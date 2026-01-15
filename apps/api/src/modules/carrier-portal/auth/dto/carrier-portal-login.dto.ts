import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CarrierPortalLoginDto {
  @ApiProperty({ description: 'Carrier portal email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Carrier portal password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}