import { IsBoolean } from 'class-validator';

export class RequestQuickPayDto {
  @IsBoolean()
  acceptTerms: boolean;
}