import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

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
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ApprovalDecisionDto {
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectApprovalDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class DelegateApprovalDto {
  @IsString()
  delegateToUserId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateApprovalPayloadDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ApprovalType)
  approvalType!: ApprovalType;

  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsArray()
  @IsString({ each: true })
  approverIds!: string[];

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  requestedAction?: string;

  @IsOptional()
  @IsString()
  requestedById?: string;

  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class ApprovalResponseDto {
  id!: string;
  requestNumber!: string;
  title!: string;
  description?: string | null;
  approvalType!: string;
  entityType!: string;
  entityId!: string;
  approverIds!: string[];
  status!: string;
  dueDate?: Date | null;
  decidedBy?: string | null;
  decidedAt?: Date | null;
  decision?: string | null;
  comments?: string | null;
  createdAt!: Date;
  customFields?: Record<string, unknown>;
}

export class ApprovalListResponseDto {
  data!: ApprovalResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class ApprovalStatsResponseDto {
  total!: number;
  pending!: number;
  approved!: number;
  rejected!: number;
}
