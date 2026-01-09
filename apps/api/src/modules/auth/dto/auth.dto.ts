import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class VerifyEmailDto {
  @IsNotEmpty()
  token: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
