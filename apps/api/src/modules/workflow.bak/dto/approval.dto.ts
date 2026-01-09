import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
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

// ============================================
// APPROVAL DTOs
// ============================================
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
  @IsString()
  requestedAction?: string;

  @IsOptional()
  @IsBoolean()
  myApprovals?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ApproveRequestDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRequestDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DelegateRequestDto {
  @IsString()
  delegateToUserId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddApprovalCommentDto {
  @IsString()
  comment!: string;
}

// ============================================
// RESPONSE DTOs
// ============================================
export class ApproverDto {
  userId?: string;
  roleId?: string;
  status!: string;
  respondedAt?: Date;
  notes?: string;
}

export class ApprovalResponseDto {
  id!: string;
  requestNumber!: string;
  approvalType!: string;
  entityType!: string;
  entityId!: string;
  entitySummary?: string;
  requestedAction!: string;
  requestData!: Record<string, unknown>;
  approvers!: ApproverDto[];
  requiredApprovals!: number;
  status!: string;
  dueAt?: Date;
  reminderSent!: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  requestedBy?: string;
  createdAt!: Date;
  workflowExecutionId!: string;
  stepExecutionId!: string;
}

export class ApprovalListResponseDto {
  data!: ApprovalResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
