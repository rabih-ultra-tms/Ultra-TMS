import { IsOptional, IsString } from 'class-validator';

export class TransferAssignmentDto {
  @IsString()
  toAgentId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}