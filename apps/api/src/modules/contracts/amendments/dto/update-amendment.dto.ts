import { PartialType } from '@nestjs/mapped-types';
import { CreateAmendmentDto } from './create-amendment.dto';

export class UpdateAmendmentDto extends PartialType(CreateAmendmentDto) {}
