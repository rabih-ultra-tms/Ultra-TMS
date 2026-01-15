import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReportGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsEnum(ReportGroupBy)
  groupBy?: ReportGroupBy = ReportGroupBy.MONTH;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;
}

export class AgingReportDto {
  @IsOptional()
  @IsDateString()
  asOfDate?: string;
}
