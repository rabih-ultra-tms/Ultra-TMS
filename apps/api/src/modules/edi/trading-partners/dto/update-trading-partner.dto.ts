import { PartialType } from '@nestjs/mapped-types';
import { CreateTradingPartnerDto } from './create-trading-partner.dto';

export class UpdateTradingPartnerDto extends PartialType(CreateTradingPartnerDto) {}
