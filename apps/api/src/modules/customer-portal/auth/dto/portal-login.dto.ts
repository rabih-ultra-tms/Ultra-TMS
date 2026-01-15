import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PortalLoginDto {
  @ApiProperty({ description: 'Portal user email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Portal user password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}