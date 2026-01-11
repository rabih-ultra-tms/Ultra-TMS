import { IsOptional, IsString } from 'class-validator';

export class AgentStatusDto {
  @IsOptional()
  @IsString()
  reason?: string;
}