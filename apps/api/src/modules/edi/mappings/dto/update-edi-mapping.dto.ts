import { PartialType } from '@nestjs/mapped-types';
import { CreateEdiMappingDto } from './create-edi-mapping.dto';

export class UpdateEdiMappingDto extends PartialType(CreateEdiMappingDto) {}
