import { PartialType } from '@nestjs/mapped-types';
import { CreateRateAlertDto } from './create-rate-alert.dto';

export class UpdateRateAlertDto extends PartialType(CreateRateAlertDto) {}
