import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarrierPortalRegisterDto {
  @ApiProperty({ description: 'Carrier portal email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Carrier portal password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Invitation token' })
  @IsOptional()
  @IsString()
  invitationToken?: string;
}