import { PartialType } from '@nestjs/mapped-types';
import { CreateCsaScoreDto } from './create-csa-score.dto';

export class UpdateCsaScoreDto extends PartialType(CreateCsaScoreDto) {}
