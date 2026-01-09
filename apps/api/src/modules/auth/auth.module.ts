import { Module, Global } from '@nestjs/common';
import { JwtAuthGuard } from './guards';
import { PrismaService } from '../../prisma.service';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';

@Global()
@Module({
  controllers: [UsersController, RolesController],
  providers: [PrismaService, JwtAuthGuard, UsersService, RolesService],
  exports: [JwtAuthGuard, UsersService, RolesService],
})
export class AuthModule {}
