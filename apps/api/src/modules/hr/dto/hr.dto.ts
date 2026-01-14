import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { EmploymentType, TimeOffType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsDateString()
  hireDate: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class TerminateEmployeeDto {
  @IsDateString()
  terminationDate: string;
}

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentDepartmentId?: string;

}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

export class CreatePositionDto {
  @IsString()
  title: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  maxSalary?: number;

}

export class UpdatePositionDto extends PartialType(CreatePositionDto) {}

export class CreateLocationDto {
  @IsString()
  locationCode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isHeadquarters?: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}

export class CreateTimeOffRequestDto {
  @IsString()
  employeeId: string;

  @IsEnum(TimeOffType)
  requestType: TimeOffType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0.5)
  totalDays: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateTimeOffRequestDto extends PartialType(CreateTimeOffRequestDto) {}

export class CreateTimeEntryDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  clockIn: string;

  @IsOptional()
  @IsDateString()
  clockOut?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {}

export class ApproveRequestDto {
}

export class DenyRequestDto {
  @IsOptional()
  @IsString()
  denialReason?: string;
}

export class ApproveTimeEntryDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class IdListDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
