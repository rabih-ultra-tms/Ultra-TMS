import { PartialType } from '@nestjs/mapped-types';
import { CreateNoaRecordDto } from './create-noa-record.dto';

export class UpdateNoaRecordDto extends PartialType(CreateNoaRecordDto) {}
