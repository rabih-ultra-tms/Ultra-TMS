import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsNotEmpty()
  value!: unknown;

  @IsOptional()
  @IsString()
  changeReason?: string;
}
