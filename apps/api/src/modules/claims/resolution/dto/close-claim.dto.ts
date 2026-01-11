import { IsOptional, IsString } from 'class-validator';

export class CloseClaimDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
