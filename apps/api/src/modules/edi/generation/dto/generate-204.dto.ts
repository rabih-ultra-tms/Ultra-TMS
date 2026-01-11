import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate204Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  loadId: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
