import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignClaimDto {
  @ApiProperty({ description: 'User identifier assigned to the claim.' })
  @IsString()
  @IsNotEmpty()
  assignedToId!: string;

  @ApiPropertyOptional({ description: 'Optional due date for the assignment (ISO 8601).' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
