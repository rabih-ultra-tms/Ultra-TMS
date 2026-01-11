import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CarrierPortalRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  invitationToken?: string;
}