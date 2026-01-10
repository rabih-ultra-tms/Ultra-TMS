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
          submitterId: users[Math.floor(Math.random() * users.length)].id,
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          submitterName: faker.person.fullName(),
          status: faker.helpers.arrayElement(['SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED']),
          submitterEmail: faker.internet.email(),
          externalId: `SEED-FEATURE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      featureRequests.push(featureRequest);
    }
    total += 10;

    // Feature Request Votes (3 per feature = 30 per tenant = 150 total)
    for (const featureRequest of featureRequests) {
      const voterIds = faker.helpers.arrayElements(users.map(u => u.id), 3);
      for (let i = 0; i < voterIds.length; i++) {
        await prisma.featureRequestVote.create({
          data: {
            requestId: featureRequest.id,
            userId: voterIds[i],
            voteWeight: faker.helpers.arrayElement([1, -1]),
            externalId: `SEED-VOTE-${total + i + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
      total += voterIds.length;
    }

    // Feature Request Comments (2 per feature = 20 per tenant = 100 total)
    for (const featureRequest of featureRequests) {
      for (let i = 0; i < 2; i++) {
        const author = users[Math.floor(Math.random() * users.length)];
        await prisma.featureRequestComment.create({
          data: {
            requestId: featureRequest.id,
            authorType: 'USER',
            authorUserId: author.id,
            authorName: `${author.firstName} ${author.lastName}`,
            content: faker.lorem.sentences(3),
            isOfficial: false,
            externalId: `SEED-COMMENT-${total + i + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
      total += 2;
    }

    // Feedback Widgets (3 per tenant = 15 total)
    const widgetTypes = ['RATING', 'TEXT', 'EMOJI'];
    for (let i = 0; i < 3; i++) {
      await prisma.feedbackWidget.create({
        data: {
          tenantId,
          name: `${widgetTypes[i]} Widget`,
          widgetType: widgetTypes[i],
          placement: faker.helpers.arrayElement(['BOTTOM_RIGHT', 'MODAL', 'INLINE']),
          isActive: true,
          config: {
            triggerDelay: faker.number.int({ min: 0, max: 5000 }),
            hideOnMobile: faker.datatype.boolean(),
            primaryColor: faker.color.rgb(),
          },
          externalId: `SEED-WIDGET-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 3;

    // NPS Surveys (existing - keep for backwards compatibility)
    for (let i = 0; i < 5; i++) {
      await prisma.nPSSurvey.create({
        data: {
          tenantId,
          surveyNumber: `NPS-${i + 1}-${faker.string.alphanumeric(6)}`,
          question: 'How likely are you to recommend us to a friend?',
          followUpQuestion: 'What is the primary reason for your score?',
          targetType: faker.helpers.arrayElement(['ALL', 'CUSTOMERS', 'CARRIERS']),
          scheduledAt: faker.date.recent(),
          expiresAt: faker.date.future(),
          status: faker.helpers.arrayElement(['DRAFT', 'SCHEDULED', 'SENT', 'COMPLETED', 'EXPIRED']),
          externalId: `SEED-NPS-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 5;
  }

  console.log(`   ✓ Created ${total} feedback records (surveys, responses, feature requests, votes, comments, widgets, NPS)`);
}
