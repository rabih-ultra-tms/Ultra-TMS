import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PortalUserRole } from '@prisma/client';

export class InvitePortalUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: PortalUserRole })
  @IsEnum(PortalUserRole)
  role!: PortalUserRole;

  @ApiPropertyOptional({ type: [String], description: 'Permission codes' })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdatePortalUserDto {
  @ApiPropertyOptional({ enum: PortalUserRole })
  @IsOptional()
  @IsEnum(PortalUserRole)
  role?: PortalUserRole;

  @ApiPropertyOptional({ type: [String], description: 'Permission codes' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;
}