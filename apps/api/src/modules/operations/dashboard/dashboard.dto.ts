import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiPropertyOptional({ enum: ['today', 'thisWeek', 'thisMonth'] })
  @IsOptional()
  @IsIn(['today', 'thisWeek', 'thisMonth'])
  period?: string = 'today';

  @ApiPropertyOptional({ enum: ['personal', 'team'] })
  @IsOptional()
  @IsIn(['personal', 'team'])
  scope?: string = 'personal';

  @ApiPropertyOptional({ enum: ['yesterday', 'lastWeek', 'lastMonth'] })
  @IsOptional()
  @IsIn(['yesterday', 'lastWeek', 'lastMonth'])
  comparisonPeriod?: string = 'yesterday';
}

export class DashboardChartsQueryDto {
  @ApiPropertyOptional({ enum: ['today', 'thisWeek', 'thisMonth'] })
  @IsOptional()
  @IsIn(['today', 'thisWeek', 'thisMonth'])
  period?: string = 'today';
}

export class DashboardActivityQueryDto {
  @ApiPropertyOptional({ enum: ['today', 'thisWeek', 'thisMonth'] })
  @IsOptional()
  @IsIn(['today', 'thisWeek', 'thisMonth'])
  period?: string = 'today';
}
