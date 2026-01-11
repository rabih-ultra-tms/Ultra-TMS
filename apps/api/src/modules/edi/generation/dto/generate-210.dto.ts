import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate210Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
