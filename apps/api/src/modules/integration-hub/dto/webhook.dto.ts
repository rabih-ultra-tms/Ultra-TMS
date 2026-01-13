import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { WebhookStatus } from '@prisma/client';

export class WebhookEndpointQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateWebhookEndpointDto {
  @IsString()
  name!: string;

  @IsUrl()
  url!: string;

  @IsArray()
  @IsString({ each: true })
  events!: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWebhookEndpointDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class WebhookEndpointResponseDto {
  id!: string;
  name!: string;
  url!: string;
  events!: string[];
  description?: string | null;
  secret?: string | null;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class WebhookEndpointListResponseDto {
  data!: WebhookEndpointResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class WebhookSubscriptionQueryDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateWebhookSubscriptionDto {
  @IsString()
  webhookEndpointId!: string;

  @IsString()
  eventType!: string;

  @IsOptional()
  @IsObject()
  filterConditions?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWebhookSubscriptionDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsObject()
  filterConditions?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WebhookSubscriptionResponseDto {
  id!: string;
  webhookEndpointId!: string;
  eventType!: string;
  filterConditions!: Record<string, unknown>;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class WebhookSubscriptionListResponseDto {
  data!: WebhookSubscriptionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class WebhookDeliveryQueryDto {
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class WebhookDeliveryResponseDto {
  id!: string;
  event!: string;
  status!: WebhookStatus;
  responseStatus?: number | null;
  attempts!: number;
  lastAttempt?: Date | null;
  nextRetry?: Date | null;
  createdAt!: Date;
}

export class WebhookDeliveryListResponseDto {
  data!: WebhookDeliveryResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
