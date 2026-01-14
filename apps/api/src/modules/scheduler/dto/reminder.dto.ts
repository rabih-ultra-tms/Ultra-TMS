import { IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remindAt!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referenceUrl?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf(o => o.isRecurring)
  recurrenceRule?: string;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['in_app', 'email', 'sms'], { each: true })
  notificationChannels?: string[];
}

export class UpdateReminderDto extends CreateReminderDto {}

export class SnoozeReminderDto {
  @IsInt()
  @Min(5)
  @Max(10080)
  minutes!: number;
}
