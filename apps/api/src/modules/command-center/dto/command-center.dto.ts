import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CommandCenterKPIsQueryDto {
  @ApiPropertyOptional({ enum: ['today', 'thisWeek', 'thisMonth'] })
  @IsOptional()
  @IsIn(['today', 'thisWeek', 'thisMonth'])
  period?: string = 'today';
}

export class CommandCenterAlertsQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'critical', 'warning', 'info'] })
  @IsOptional()
  @IsIn(['all', 'critical', 'warning', 'info'])
  severity?: string = 'all';

  @ApiPropertyOptional({ description: 'Max alerts to return' })
  @IsOptional()
  limit?: number = 50;
}

export class AutoMatchDto {
  @IsString()
  loadId!: string;
}

export class SavePreferencesDto {
  @ApiPropertyOptional({
    enum: ['loads', 'quotes', 'carriers', 'tracking', 'alerts'],
  })
  @IsOptional()
  @IsIn(['loads', 'quotes', 'carriers', 'tracking', 'alerts'])
  defaultTab?: string;

  @ApiPropertyOptional({ enum: ['board', 'split', 'dashboard', 'focus'] })
  @IsOptional()
  @IsIn(['board', 'split', 'dashboard', 'focus'])
  defaultLayout?: string;

  @ApiPropertyOptional()
  @IsOptional()
  kpiStripCollapsed?: boolean;
}
