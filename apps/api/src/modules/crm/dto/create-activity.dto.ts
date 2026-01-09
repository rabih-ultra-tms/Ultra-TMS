import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, IsIn } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsIn(['COMPANY', 'CONTACT', 'OPPORTUNITY', 'ORDER'])
  entityType!: string; // COMPANY, CONTACT, OPPORTUNITY, ORDER

  @IsUUID()
  entityId!: string;

  @IsString()
  @IsIn(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK'])
  activityType!: string; // CALL, EMAIL, MEETING, NOTE, TASK

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  activityDate?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  opportunityId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: string; // LOW, MEDIUM, HIGH

  @IsOptional()
  @IsString()
  status?: string; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  activityDate?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
