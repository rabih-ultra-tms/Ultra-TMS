import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerationService } from './generation.service';
import { GenerateDocumentDto, EntityType } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('documents/generate')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  async generateDocument(@Req() req: any, @Body() dto: GenerateDocumentDto) {
    return this.generationService.generateDocument(
      req.user.tenantId,
      req.user.sub,
      dto,
    );
  }

  @Post('batch')
  async batchGenerate(
    @Req() req: any,
    @Body()
    body: {
      templateId: string;
      entities: Array<{ entityType: EntityType; entityId: string }>;
    },
  ) {
    return this.generationService.batchGenerate(
      req.user.tenantId,
      req.user.sub,
      body.templateId,
      body.entities,
    );
  }

  @Get(':id/status')
  async getGenerationStatus(@Req() req: any, @Param('id') id: string) {
    return this.generationService.getGenerationStatus(req.user.tenantId, id);
  }
}

// Entity-specific generation endpoints
@UseGuards(JwtAuthGuard)
@Controller()
export class EntityGenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('loads/:id/rate-confirm')
  async generateRateConfirmation(@Req() req: any, @Param('id') id: string) {
    return this.generationService.generateRateConfirmation(
      req.user.tenantId,
      req.user.sub,
      id,
    );
  }

  @Post('loads/:id/bol')
  async generateBOL(@Req() req: any, @Param('id') id: string) {
    return this.generationService.generateBOL(
      req.user.tenantId,
      req.user.sub,
      id,
    );
  }

  @Post('orders/:id/invoice')
  async generateInvoice(@Req() req: any, @Param('id') id: string) {
    return this.generationService.generateInvoice(
      req.user.tenantId,
      req.user.sub,
      id,
    );
  }
}
