import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class RateHistoryQueryDto {
  @IsString()
  originMarket!: string;

  @IsString()
  destMarket!: string;

  @IsString()
  equipmentType!: string;

  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @IsOptional()
  @IsString()
  dataSource?: string;
}
