import { PartialType } from '@nestjs/mapped-types';
import { CreateClaimItemDto } from './create-claim-item.dto';

export class UpdateClaimItemDto extends PartialType(CreateClaimItemDto) {}
