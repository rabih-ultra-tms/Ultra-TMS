import { PartialType } from '@nestjs/mapped-types';
import { CreateSubrogationDto } from './create-subrogation.dto';

export class UpdateSubrogationDto extends PartialType(CreateSubrogationDto) {}
