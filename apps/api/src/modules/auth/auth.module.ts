import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../../prisma.service';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';
import { ProfileService } from './profile.service';
import { MfaService } from './mfa.service';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { AuthController } from './auth.controller';
import { TenantController } from './tenant.controller';
import { ProfileController } from './profile.controller';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController, RolesController, TenantController, ProfileController],
  providers: [PrismaService, JwtAuthGuard, JwtStrategy, AuthService, UsersService, RolesService, TenantService, ProfileService, MfaService],
  exports: [JwtAuthGuard, JwtModule, AuthService, UsersService, RolesService, TenantService, ProfileService, MfaService],
})
export class AuthModule {}
