import { PartialType } from '@nestjs/mapped-types';
import { CreateDqfDto } from './create-dqf.dto';

export class UpdateDqfDto extends PartialType(CreateDqfDto) {}
