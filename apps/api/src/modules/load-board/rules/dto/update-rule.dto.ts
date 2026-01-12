import { PartialType } from '@nestjs/mapped-types';
import { CreatePostingRuleDto } from './create-rule.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePostingRuleDto extends PartialType(CreatePostingRuleDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
