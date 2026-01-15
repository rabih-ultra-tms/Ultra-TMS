import { Exclude } from 'class-transformer';

export class TradingPartnerResponseDto {
  @Exclude()
  ftpPassword?: string | null;
}
