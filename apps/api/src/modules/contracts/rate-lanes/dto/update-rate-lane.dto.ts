import { PartialType } from '@nestjs/mapped-types';
import { CreateRateLaneDto } from './create-rate-lane.dto';

export class UpdateRateLaneDto extends PartialType(CreateRateLaneDto) {}
