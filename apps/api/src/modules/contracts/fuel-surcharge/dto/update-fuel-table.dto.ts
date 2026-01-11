import { PartialType } from '@nestjs/mapped-types';
import { CreateFuelTableDto } from './create-fuel-table.dto';

export class UpdateFuelTableDto extends PartialType(CreateFuelTableDto) {}
