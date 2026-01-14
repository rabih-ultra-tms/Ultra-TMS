import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { NpsController } from './nps/nps.controller';
import { SurveysController } from './surveys/surveys.controller';
import { FeaturesController } from './features/features.controller';
import { FeedbackEntriesController } from './entries/feedback-entries.controller';
import { WidgetsController } from './widgets/widgets.controller';
import { NpsSurveysService } from './nps/nps-surveys.service';
import { NpsScoreService } from './nps/nps-score.service';
import { FeedbackAnalyticsService } from './analytics/feedback-analytics.service';
import { SurveysService } from './surveys/surveys.service';
import { FeaturesService } from './features/features.service';
import { VotingService } from './features/voting.service';
import { FeedbackEntriesService } from './entries/feedback-entries.service';
import { WidgetsService } from './widgets/widgets.service';
import { SentimentService } from './sentiment/sentiment.service';

@Module({
  imports: [EventEmitterModule],
  controllers: [NpsController, SurveysController, FeaturesController, FeedbackEntriesController, WidgetsController],
  providers: [
    PrismaService,
    NpsSurveysService,
    NpsScoreService,
    FeedbackAnalyticsService,
    SurveysService,
    FeaturesService,
    VotingService,
    FeedbackEntriesService,
    WidgetsService,
    SentimentService,
  ],
})
export class FeedbackModule {}
