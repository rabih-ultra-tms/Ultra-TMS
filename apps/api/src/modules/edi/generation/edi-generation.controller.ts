import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Generate204Dto } from './dto/generate-204.dto';
import { Generate210Dto } from './dto/generate-210.dto';
import { Generate214Dto } from './dto/generate-214.dto';
import { Generate990Dto } from './dto/generate-990.dto';
import { Generate997Dto } from './dto/generate-997.dto';
import { EdiGenerationService } from './edi-generation.service';

@Controller('edi/generate')
@UseGuards(JwtAuthGuard)
export class EdiGenerationController {
  constructor(private readonly service: EdiGenerationService) {}

  @Post('204')
  generate204(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate204Dto,
  ) {
    return this.service.generate204(tenantId, user.id, dto);
  }

  @Post('210')
  generate210(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate210Dto,
  ) {
    return this.service.generate210(tenantId, user.id, dto);
  }

  @Post('214')
  generate214(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate214Dto,
  ) {
    return this.service.generate214(tenantId, user.id, dto);
  }

  @Post('990')
  generate990(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate990Dto,
  ) {
    return this.service.generate990(tenantId, user.id, dto);
  }

  @Post('997')
  generate997(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate997Dto,
  ) {
    return this.service.generate997(tenantId, user.id, dto);
  }
}

@Controller('edi')
@UseGuards(JwtAuthGuard)
export class EdiSendController {
  constructor(private readonly service: EdiGenerationService) {}

  @Post('send/:documentId')
  sendDocument(@CurrentTenant() tenantId: string, @Param('documentId') documentId: string) {
    return this.service.sendDocument(tenantId, documentId);
  }
}
