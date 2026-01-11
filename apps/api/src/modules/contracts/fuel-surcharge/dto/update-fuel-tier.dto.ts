import { PartialType } from '@nestjs/mapped-types';
import { CreateFuelTierDto } from './create-fuel-tier.dto';

export class UpdateFuelTierDto extends PartialType(CreateFuelTierDto) {}
