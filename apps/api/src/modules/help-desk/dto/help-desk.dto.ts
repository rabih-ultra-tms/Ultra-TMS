import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TicketPriority, TicketSource, TicketStatus, TicketType, ReplyType } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsEnum(TicketSource)
  source: TicketSource;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  requesterEmail?: string;

  @IsOptional()
  @IsString()
  requesterName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  relatedType?: string;

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}

export class AddReplyDto {
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsEnum(ReplyType)
  replyType: ReplyType;

  @IsOptional()
  @IsArray()
  attachments?: Array<Record<string, unknown>>;
}

export class AssignTicketDto {
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  assignedTeamId?: string;
}

export class CloseTicketDto {
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  autoAssign?: boolean;

  @IsOptional()
  @IsString()
  assignmentMethod?: string;

  @IsOptional()
  @IsString()
  managerId?: string;
}

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}

export class TeamMemberInput {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsInt()
  maxOpenTickets?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class ManageMembersDto {
  @IsArray()
  members: TeamMemberInput[];
}

export class CreateSlaPolicyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  conditions: {
    priority?: string[];
    category?: string[];
  };

  @IsInt()
  @Min(1)
  firstResponseTarget: number;

  @IsInt()
  @Min(1)
  resolutionTarget: number;

  @IsOptional()
  @IsBoolean()
  useBusinessHours?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;
}

export class UpdateSlaPolicyDto extends PartialType(CreateSlaPolicyDto) {}

export class CreateCannedResponseDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateCannedResponseDto extends PartialType(CreateCannedResponseDto) {}

export class CreateKbCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateKbCategoryDto extends PartialType(CreateKbCategoryDto) {}

export class CreateKbArticleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  keywords?: string[];
}

export class UpdateKbArticleDto extends PartialType(CreateKbArticleDto) {}

export class PublishArticleDto {
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ArticleFeedbackDto {
  @IsBoolean()
  helpful: boolean;
}
