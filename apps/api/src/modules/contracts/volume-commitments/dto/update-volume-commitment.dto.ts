import { PartialType } from '@nestjs/mapped-types';
import { CreateVolumeCommitmentDto } from './create-volume-commitment.dto';

export class UpdateVolumeCommitmentDto extends PartialType(CreateVolumeCommitmentDto) {}
