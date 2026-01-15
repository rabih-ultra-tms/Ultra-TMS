import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ApprovalType {
  SINGLE = 'SINGLE',
  ALL = 'ALL',
  ANY = 'ANY',
  SEQUENTIAL = 'SEQUENTIAL',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class ApprovalQueryDto {
  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @ApiPropertyOptional({ description: 'Entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ApprovalDecisionDto {
  @ApiPropertyOptional({ description: 'Approval comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectApprovalDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ description: 'Additional comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class DelegateApprovalDto {
  @ApiProperty({ description: 'Delegate to user ID' })
  @IsString()
  delegateToUserId!: string;

  @ApiPropertyOptional({ description: 'Delegation reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateApprovalPayloadDto {
  @ApiProperty({ description: 'Approval title' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Approval description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ApprovalType })
  @IsEnum(ApprovalType)
  approvalType!: ApprovalType;

  @ApiProperty({ description: 'Entity type' })
  @IsString()
  entityType!: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  entityId!: string;

  @ApiProperty({ type: [String], description: 'Approver user IDs' })
  @IsArray()
  @IsString({ each: true })
  approverIds!: string[];

  @ApiPropertyOptional({ description: 'Due date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Requested action' })
  @IsOptional()
  @IsString()
  requestedAction?: string;

  @ApiPropertyOptional({ description: 'Requester user ID' })
  @IsOptional()
  @IsString()
  requestedById?: string;

  @ApiPropertyOptional({ type: Object, description: 'Custom fields' })
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class ApprovalResponseDto {
  @ApiProperty({ description: 'Approval ID' })
  id!: string;
  @ApiProperty({ description: 'Request number' })
  requestNumber!: string;
  @ApiProperty({ description: 'Approval title' })
  title!: string;
  @ApiPropertyOptional({ description: 'Approval description' })
  description?: string | null;
  @ApiProperty({ description: 'Approval type' })
  approvalType!: string;
  @ApiProperty({ description: 'Entity type' })
  entityType!: string;
  @ApiProperty({ description: 'Entity ID' })
  entityId!: string;
  @ApiProperty({ type: [String], description: 'Approver user IDs' })
  approverIds!: string[];
  @ApiProperty({ description: 'Approval status' })
  status!: string;
  @ApiPropertyOptional({ type: String, format: 'date-time', description: 'Due date' })
  dueDate?: Date | null;
  @ApiPropertyOptional({ description: 'Decided by user ID' })
  decidedBy?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', description: 'Decided at' })
  decidedAt?: Date | null;
  @ApiPropertyOptional({ description: 'Decision' })
  decision?: string | null;
  @ApiPropertyOptional({ description: 'Decision comments' })
  comments?: string | null;
  @ApiProperty({ type: String, format: 'date-time', description: 'Created at' })
  createdAt!: Date;
  @ApiPropertyOptional({ type: Object, description: 'Custom fields' })
  customFields?: Record<string, unknown>;
}

export class ApprovalListResponseDto {
  @ApiProperty({ type: [ApprovalResponseDto] })
  data!: ApprovalResponseDto[];
  @ApiProperty({ description: 'Total approvals' })
  total!: number;
  @ApiProperty({ description: 'Page number' })
  page!: number;
  @ApiProperty({ description: 'Page size' })
  limit!: number;
  @ApiProperty({ description: 'Total pages' })
  totalPages!: number;
}

export class ApprovalStatsResponseDto {
  @ApiProperty({ description: 'Total approvals' })
  total!: number;
  @ApiProperty({ description: 'Pending approvals' })
  pending!: number;
  @ApiProperty({ description: 'Approved approvals' })
  approved!: number;
  @ApiProperty({ description: 'Rejected approvals' })
  rejected!: number;
}
