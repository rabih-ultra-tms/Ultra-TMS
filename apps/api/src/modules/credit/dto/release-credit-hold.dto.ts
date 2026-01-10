import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReleaseCreditHoldDto {
  @IsString()
  @IsNotEmpty()
  releasedById!: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
