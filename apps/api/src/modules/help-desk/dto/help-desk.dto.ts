import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TicketPriority, TicketSource, TicketStatus, TicketType, ReplyType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Ticket description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TicketSource })
  @IsEnum(TicketSource)
  source: TicketSource;

  @ApiPropertyOptional({ enum: TicketType })
  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'Requester email' })
  @IsOptional()
  @IsString()
  requesterEmail?: string;

  @ApiPropertyOptional({ description: 'Requester name' })
  @IsOptional()
  @IsString()
  requesterName?: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategory' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Related entity type' })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional({ description: 'Team ID' })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}

export class AddReplyDto {
  @ApiProperty({ description: 'Reply body' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Reply body HTML' })
  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @ApiProperty({ enum: ReplyType })
  @IsEnum(ReplyType)
  replyType: ReplyType;

  @ApiPropertyOptional({ type: [Object], description: 'Attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Array<Record<string, unknown>>;
}

export class AssignTicketDto {
  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ description: 'Assigned team ID' })
  @IsOptional()
  @IsString()
  assignedTeamId?: string;
}

export class CloseTicketDto {
  @ApiPropertyOptional({ description: 'Resolution notes' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}

export class CreateTeamDto {
  @ApiProperty({ description: 'Team name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Team description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Team email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Auto-assign flag' })
  @IsOptional()
  @IsBoolean()
  autoAssign?: boolean;

  @ApiPropertyOptional({ description: 'Assignment method' })
  @IsOptional()
  @IsString()
  assignmentMethod?: string;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsOptional()
  @IsString()
  managerId?: string;
}

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}

export class TeamMemberInput {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Role' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Max open tickets' })
  @IsOptional()
  @IsInt()
  maxOpenTickets?: number;

  @ApiPropertyOptional({ description: 'Availability flag' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class ManageMembersDto {
  @ApiProperty({ type: [TeamMemberInput], description: 'Team members' })
  @IsArray()
  members: TeamMemberInput[];
}

export class CreateSlaPolicyDto {
  @ApiProperty({ description: 'SLA policy name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'SLA policy description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Object, description: 'SLA conditions' })
  @IsObject()
  conditions: {
    priority?: string[];
    category?: string[];
  };

  @ApiProperty({ description: 'First response target (minutes)', minimum: 1 })
  @IsInt()
  @Min(1)
  firstResponseTarget: number;

  @ApiProperty({ description: 'Resolution target (minutes)', minimum: 1 })
  @IsInt()
  @Min(1)
  resolutionTarget: number;

  @ApiPropertyOptional({ description: 'Use business hours' })
  @IsOptional()
  @IsBoolean()
  useBusinessHours?: boolean;

  @ApiPropertyOptional({ description: 'Priority' })
  @IsOptional()
  @IsInt()
  priority?: number;
}

export class UpdateSlaPolicyDto extends PartialType(CreateSlaPolicyDto) {}

export class CreateCannedResponseDto {
  @ApiProperty({ description: 'Response title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Response content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Public flag' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Owner ID' })
  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateCannedResponseDto extends PartialType(CreateCannedResponseDto) {}

export class CreateKbCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Public flag' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Active flag' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateKbCategoryDto extends PartialType(CreateKbCategoryDto) {}

export class CreateKbArticleDto {
  @ApiProperty({ description: 'Article title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Summary' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: 'Content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Public flag' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Featured flag' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Keywords' })
  @IsOptional()
  @IsArray()
  keywords?: string[];
}

export class UpdateKbArticleDto extends PartialType(CreateKbArticleDto) {}

export class PublishArticleDto {
  @ApiPropertyOptional({ description: 'Featured flag' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ArticleFeedbackDto {
  @ApiProperty({ description: 'Helpful flag' })
  @IsBoolean()
  helpful: boolean;
}
