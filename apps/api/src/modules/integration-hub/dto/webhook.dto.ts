import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  IsArray,
  Min,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum WebhookEndpointStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
}

export enum WebhookSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FAILED = 'FAILED',
}

export enum WebhookDeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export enum WebhookAuthType {
  NONE = 'NONE',
  BASIC = 'BASIC',
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  HMAC = 'HMAC',
}

// ============================================
// WEBHOOK ENDPOINT DTOs (Inbound)
// ============================================
export class WebhookEndpointQueryDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsEnum(WebhookEndpointStatus)
  status?: WebhookEndpointStatus;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateWebhookEndpointDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsString()
  endpointPath!: string;

  @IsArray()
  @IsString({ each: true })
  eventTypes!: string[];

  @IsString()
  handlerType!: string;

  @IsOptional()
  @IsObject()
  transformTemplate?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  targetService?: string;

  @IsOptional()
  @IsArray()
  ipWhitelist?: string[];

  @IsOptional()
  @IsString()
  signatureHeader?: string;

  @IsOptional()
  @IsString()
  signatureAlgorithm?: string;
}

export class UpdateWebhookEndpointDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @IsOptional()
  @IsString()
  handlerType?: string;

  @IsOptional()
  @IsObject()
  transformTemplate?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  targetService?: string;

  @IsOptional()
  @IsArray()
  ipWhitelist?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsEnum(WebhookEndpointStatus)
  status?: WebhookEndpointStatus;
}

export class WebhookEndpointResponseDto {
  id!: string;
  integrationId?: string;
  endpointPath!: string;
  fullUrl!: string;
  secretKey!: string;
  eventTypes!: string[];
  handlerType!: string;
  transformTemplate?: Record<string, unknown>;
  targetService?: string;
  ipWhitelist?: string[];
  signatureHeader?: string;
  signatureAlgorithm?: string;
  status!: string;
  isEnabled!: boolean;
  totalReceived!: number;
  totalProcessed!: number;
  totalFailed!: number;
  lastReceivedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

// ============================================
// WEBHOOK SUBSCRIPTION DTOs (Outbound)
// ============================================
export class WebhookSubscriptionQueryDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsEnum(WebhookSubscriptionStatus)
  status?: WebhookSubscriptionStatus;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateWebhookSubscriptionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  url!: string;

  @IsArray()
  @IsString({ each: true })
  eventTypes!: string[];

  @IsOptional()
  @IsEnum(WebhookAuthType)
  authType?: WebhookAuthType;

  @IsOptional()
  @IsObject()
  authConfig?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsObject()
  transformTemplate?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  retryEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;
}

export class UpdateWebhookSubscriptionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @IsOptional()
  @IsEnum(WebhookAuthType)
  authType?: WebhookAuthType;

  @IsOptional()
  @IsObject()
  authConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  retryEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;
}

export class WebhookSubscriptionResponseDto {
  id!: string;
  name!: string;
  description?: string;
  url!: string;
  eventTypes!: string[];
  authType!: string;
  hasAuthConfig!: boolean;
  hasSecretKey!: boolean;
  contentType!: string;
  headers!: Record<string, string>;
  retryEnabled!: boolean;
  maxRetries!: number;
  retryIntervals!: number[];
  status!: string;
  isEnabled!: boolean;
  totalSent!: number;
  totalDelivered!: number;
  totalFailed!: number;
  lastTriggeredAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  consecutiveFailures!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class WebhookSubscriptionListResponseDto {
  data!: WebhookSubscriptionResponseDto[];
  total!: number;
}

// ============================================
// WEBHOOK DELIVERY DTOs
// ============================================
export class WebhookDeliveryQueryDto {
  @IsOptional()
  @IsEnum(WebhookDeliveryStatus)
  status?: WebhookDeliveryStatus;

  @IsOptional()
  @IsString()
  eventType?: string;

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
  subscriptionId!: string;
  eventType!: string;
  eventId!: string;
  payload!: Record<string, unknown>;
  attemptNumber!: number;
  requestUrl!: string;
  requestHeaders?: Record<string, unknown>;
  requestBody?: string;
  responseStatus?: number;
  responseHeaders?: Record<string, unknown>;
  responseBody?: string;
  responseTimeMs?: number;
  status!: string;
  errorMessage?: string;
  nextRetryAt?: Date;
  createdAt!: Date;
}

export class WebhookDeliveryListResponseDto {
  data!: WebhookDeliveryResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
