import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedFeedback(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 20 });
    if (users.length === 0) continue;

    // Surveys (3 per tenant = 15 total)
    const surveys = [];
    const surveyTypes = ['NPS', 'CSAT', 'CUSTOM'];
    for (let i = 0; i < 3; i++) {
      const survey = await prisma.survey.create({
        data: {
          tenantId,
          title: `${surveyTypes[i]} Survey - ${faker.lorem.words(3)}`,
          description: faker.lorem.paragraph(),
          surveyType: surveyTypes[i],
          status: faker.helpers.arrayElement(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']),
          startDate: faker.date.recent(),
          endDate: faker.date.future(),
          questions: JSON.stringify([
            { id: 1, type: 'rating', question: 'How satisfied are you?', required: true },
            { id: 2, type: 'text', question: 'Any additional feedback?', required: false },
          ]),
          externalId: `SEED-SURVEY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      surveys.push(survey);
    }
    total += 3;

    // Survey Responses (5 per survey = 15 per tenant = 75 total)
    for (const survey of surveys) {
      for (let i = 0; i < 5; i++) {
        await prisma.surveyResponse.create({
          data: {
            tenantId,
            surveyId: survey.id,
            userId: users[Math.floor(Math.random() * users.length)].id,
            answers: JSON.stringify({
              1: faker.number.int({ min: 1, max: 10 }),
              2: faker.lorem.sentences(2),
            }),
            completedAt: faker.date.recent(),
            externalId: `SEED-SURVEY-RESPONSE-${total + i + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
      total += 5;
    }

    // Feature Requests (10 per tenant = 50 total)
    const featureRequests = [];
    for (let i = 0; i < 10; i++) {
      const featureRequest = await prisma.featureRequest.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          category: faker.helpers.arrayElement(['UI', 'API', 'INTEGRATION', 'REPORTING', 'MOBILE']),
          status: faker.helpers.arrayElement(['NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']),
          votes: faker.number.int({ min: 0, max: 50 }),
          externalId: `SEED-FEATURE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      featureRequests.push(featureRequest);
    }
    total += 10;

    // Feature Request Votes (3 per feature = 30 per tenant = 150 total)
    for (const featureRequest of featureRequests) {
      for (let i = 0; i < 3; i++) {
        await prisma.featureRequestVote.create({
          data: {
            tenantId,
            featureRequestId: featureRequest.id,
            userId: users[Math.floor(Math.random() * users.length)].id,
            voteType: faker.helpers.arrayElement(['UPVOTE', 'DOWNVOTE']),
            externalId: `SEED-VOTE-${total + i + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
      total += 3;
    }

    // Feature Request Comments (2 per feature = 20 per tenant = 100 total)
    for (const featureRequest of featureRequests) {
      for (let i = 0; i < 2; i++) {
        await prisma.featureRequestComment.create({
          data: {
            tenantId,
            featureRequestId: featureRequest.id,
            userId: users[Math.floor(Math.random() * users.length)].id,
            comment: faker.lorem.sentences(3),
            isInternal: faker.datatype.boolean(0.3),
            externalId: `SEED-COMMENT-${total + i + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
      total += 2;
    }

    // Feedback Widgets (3 per tenant = 15 total)
    const widgetTypes = ['FEEDBACK_BUTTON', 'RATING_POPUP', 'SURVEY_MODAL'];
    for (let i = 0; i < 3; i++) {
      await prisma.feedbackWidget.create({
        data: {
          tenantId,
          name: `${widgetTypes[i]} Widget`,
          widgetType: widgetTypes[i],
          placement: faker.helpers.arrayElement(['BOTTOM_RIGHT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'INLINE']),
          isActive: true,
          settings: JSON.stringify({
            triggerDelay: faker.number.int({ min: 0, max: 5000 }),
            hideOnMobile: faker.datatype.boolean(),
            primaryColor: faker.color.rgb(),
          }),
          externalId: `SEED-WIDGET-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 3;

    // NPS Surveys (existing - keep for backwards compatibility)
    for (let i = 0; i < 5; i++) {
      await prisma.npsSurvey.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          source: faker.helpers.arrayElement(['EMAIL', 'PORTAL', 'IN_APP']),
          status: faker.helpers.arrayElement(['SENT', 'COMPLETED', 'EXPIRED']),
          sentAt: faker.date.recent(),
          expiresAt: faker.date.future(),
          externalId: `SEED-NPS-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 5;
  }

  console.log(`   ✓ Created ${total} feedback records (surveys, responses, feature requests, votes, comments, widgets, NPS)`);
}
