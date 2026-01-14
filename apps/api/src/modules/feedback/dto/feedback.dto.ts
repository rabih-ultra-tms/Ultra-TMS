import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { FeatureRequestStatus } from '@prisma/client';

export class CreateNpsSurveyDto {
  @IsString()
  surveyNumber: string;

  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  followUpQuestion?: string;

  @IsIn(['ALL', 'CUSTOMERS', 'CARRIERS'])
  targetType: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateNpsSurveyDto extends PartialType(CreateNpsSurveyDto) {
  @IsOptional()
  @IsString()
  status?: string;
}

export class SubmitNpsResponseDto {
  @IsString()
  surveyId: string;

  @IsInt()
  @Min(0)
  @Max(10)
  score: number;

  @IsOptional()
  @IsString()
  respondentEmail?: string;

  @IsOptional()
  @IsString()
  respondentType?: string;

  @IsOptional()
  @IsString()
  respondentId?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  followUpResponse?: string;
}

export class SurveyQuestionDto {
  @IsString()
  id: string;

  @IsIn(['TEXT', 'RATING', 'CHOICE', 'MULTIPLE_CHOICE', 'SCALE'])
  type: string;

  @IsString()
  question: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['CSAT', 'CUSTOM', 'EXIT', 'ONBOARDING'])
  surveyType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  questions: SurveyQuestionDto[];

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  requireAllQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  showProgress?: boolean;

  @IsOptional()
  @IsString()
  thankYouMessage?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @IsOptional()
  @IsObject()
  targetSegment?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
  @IsOptional()
  @IsString()
  status?: string;
}

export class SubmitSurveyResponseDto {
  @IsObject()
  answers: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeToCompleteSeconds?: number;

  @IsOptional()
  @IsString()
  responseChannel?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  respondentEmail?: string;
}

export class SubmitFeatureRequestDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  submitterName?: string;

  @IsOptional()
  @IsString()
  submitterEmail?: string;
}

export class UpdateFeatureRequestDto extends PartialType(SubmitFeatureRequestDto) {
  @IsOptional()
  @IsEnum(FeatureRequestStatus)
  status?: FeatureRequestStatus;

  @IsOptional()
  @IsDateString()
  implementedAt?: string;

  @IsOptional()
  @IsString()
  releaseNotes?: string;
}

export class AddFeatureCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @IsOptional()
  @IsString()
  authorName?: string;
}

export class SubmitFeedbackDto {
  @IsIn(['BUG', 'SUGGESTION', 'COMPLAINT', 'PRAISE', 'OTHER'])
  feedbackType: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  pageUrl?: string;

  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class RespondFeedbackDto {
  @IsString()
  response: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateWidgetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  placement: string;

  @IsOptional()
  @IsArray()
  pages?: string[];

  @IsString()
  widgetType: string;

  @IsObject()
  config: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  triggerRules?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWidgetDto extends PartialType(CreateWidgetDto) {}
