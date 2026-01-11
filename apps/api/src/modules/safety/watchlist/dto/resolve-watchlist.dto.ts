import { IsOptional, IsString } from 'class-validator';

export class ResolveWatchlistDto {
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
