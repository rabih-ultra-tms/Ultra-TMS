import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClaimNoteDto {
  @ApiProperty({ description: 'Note text for the claim.' })
  @IsString()
  @IsNotEmpty()
  note!: string;

  @ApiPropertyOptional({ description: 'Optional note type or category.' })
  @IsOptional()
  @IsString()
  noteType?: string;

  @ApiPropertyOptional({ description: 'Whether the note is internal only.' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
