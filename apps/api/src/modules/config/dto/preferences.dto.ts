import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SetPreferenceDto {
  @IsString()
  key!: string;

  @IsNotEmpty()
  value!: unknown;
}

export class BulkPreferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetPreferenceDto)
  prefs!: SetPreferenceDto[];
}
