import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Generate204Dto } from './dto/generate-204.dto';
import { Generate210Dto } from './dto/generate-210.dto';
import { Generate214Dto } from './dto/generate-214.dto';
import { Generate990Dto } from './dto/generate-990.dto';
import { Generate997Dto } from './dto/generate-997.dto';
import { EdiGenerationService } from './edi-generation.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('edi/generate')
@UseGuards(JwtAuthGuard)
@ApiTags('EDI Transactions')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class EdiGenerationController {
  constructor(private readonly service: EdiGenerationService) {}

  @Post('204')
  @ApiOperation({ summary: 'Generate EDI 204' })
  @ApiStandardResponse('EDI 204 generated')
  @ApiErrorResponses()
  generate204(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate204Dto,
  ) {
    return this.service.generate204(tenantId, user.id, dto);
  }

  @Post('210')
  @ApiOperation({ summary: 'Generate EDI 210' })
  @ApiStandardResponse('EDI 210 generated')
  @ApiErrorResponses()
  generate210(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate210Dto,
  ) {
    return this.service.generate210(tenantId, user.id, dto);
  }

  @Post('214')
  @ApiOperation({ summary: 'Generate EDI 214' })
  @ApiStandardResponse('EDI 214 generated')
  @ApiErrorResponses()
  generate214(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate214Dto,
  ) {
    return this.service.generate214(tenantId, user.id, dto);
  }

  @Post('990')
  @ApiOperation({ summary: 'Generate EDI 990' })
  @ApiStandardResponse('EDI 990 generated')
  @ApiErrorResponses()
  generate990(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Generate990Dto,
  ) {
    return this.service.generate990(tenantId, user.id, dto);
  }

  @Post('997')
  @ApiOperation({ summary: 'Generate EDI 997' })
  @ApiStandardResponse('EDI 997 generated')
  @ApiErrorResponses()
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
@ApiTags('EDI Transactions')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class EdiSendController {
  constructor(private readonly service: EdiGenerationService) {}

  @Post('send/:documentId')
  @ApiOperation({ summary: 'Send EDI document' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiStandardResponse('EDI document sent')
  @ApiErrorResponses()
  sendDocument(@CurrentTenant() tenantId: string, @Param('documentId') documentId: string) {
    return this.service.sendDocument(tenantId, documentId);
  }
}
