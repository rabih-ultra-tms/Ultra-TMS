import {
  IsOptional,
  IsIn,
  IsString,
  IsArray,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export enum BulkDispatchAction {
  ASSIGN_CARRIER = 'ASSIGN_CARRIER',
  DISPATCH = 'DISPATCH',
  UPDATE_STATUS = 'UPDATE_STATUS',
}

export class BulkDispatchDto {
  @ApiProperty({ description: 'Load IDs to operate on' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  loadIds!: string[];

  @ApiProperty({ enum: BulkDispatchAction })
  @IsEnum(BulkDispatchAction)
  action!: BulkDispatchAction;

  @ApiPropertyOptional({ description: 'Carrier ID (required for ASSIGN_CARRIER)' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Target status (required for UPDATE_STATUS)' })
  @IsOptional()
  @IsString()
  targetStatus?: string;

  @ApiPropertyOptional({ description: 'Dispatch notes' })
  @IsOptional()
  @IsString()
  notes?: string;
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
