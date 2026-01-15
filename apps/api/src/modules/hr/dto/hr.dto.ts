import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { EmploymentType, TimeOffType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ description: 'Hire date', format: 'date-time', type: String })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({ description: 'Position ID' })
  @IsOptional()
  @IsString()
  positionId?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Location ID' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Annual salary', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualSalary?: number;

  @ApiPropertyOptional({ description: 'Hourly rate', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class TerminateEmployeeDto {
  @ApiProperty({ description: 'Termination date', format: 'date-time', type: String })
  @IsDateString()
  terminationDate: string;
}

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Department code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent department ID' })
  @IsOptional()
  @IsString()
  parentDepartmentId?: string;

}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

export class CreatePositionDto {
  @ApiProperty({ description: 'Position title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Position code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Minimum salary' })
  @IsOptional()
  @IsNumber()
  minSalary?: number;

  @ApiPropertyOptional({ description: 'Maximum salary' })
  @IsOptional()
  @IsNumber()
  maxSalary?: number;

}

export class UpdatePositionDto extends PartialType(CreatePositionDto) {}

export class CreateLocationDto {
  @ApiProperty({ description: 'Location code' })
  @IsString()
  locationCode: string;

  @ApiProperty({ description: 'Location name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Headquarters flag' })
  @IsOptional()
  @IsBoolean()
  isHeadquarters?: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}

export class CreateTimeOffRequestDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: TimeOffType })
  @IsEnum(TimeOffType)
  requestType: TimeOffType;

  @ApiProperty({ description: 'Start date', format: 'date-time', type: String })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date', format: 'date-time', type: String })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Total days', minimum: 0.5 })
  @IsNumber()
  @Min(0.5)
  totalDays: number;

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateTimeOffRequestDto extends PartialType(CreateTimeOffRequestDto) {}

export class CreateTimeEntryDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Clock-in time', format: 'date-time', type: String })
  @IsDateString()
  clockIn: string;

  @ApiPropertyOptional({ description: 'Clock-out time', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  clockOut?: string;

  @ApiPropertyOptional({ description: 'Location ID' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {}

export class ApproveRequestDto {
}

export class DenyRequestDto {
  @ApiPropertyOptional({ description: 'Denial reason' })
  @IsOptional()
  @IsString()
  denialReason?: string;
}

export class ApproveTimeEntryDto {
  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class IdListDto {
  @ApiProperty({ type: [String], description: 'IDs' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
