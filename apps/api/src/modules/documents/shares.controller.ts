import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post(':id/share')
  async createShare(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateShareDto,
  ) {
    return this.sharesService.createShare(
      req.user.tenantId,
      id,
      req.user.sub,
      dto,
    );
  }

  @Get(':id/shares')
  async getDocumentShares(@Req() req: any, @Param('id') id: string) {
    return this.sharesService.getDocumentShares(req.user.tenantId, id);
  }

  @Delete('shares/:id')
  async revokeShare(@Req() req: any, @Param('id') id: string) {
    return this.sharesService.revokeShare(req.user.tenantId, id);
  }

  @Put('shares/:id')
  async updateShare(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateShareDto>,
  ) {
    return this.sharesService.updateShare(req.user.tenantId, id, dto);
  }
}

// Public endpoints for accessing shared documents
@Controller('documents/shared')
export class PublicSharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Get(':token')
  async getSharedDocument(
    @Param('token') token: string,
    @Query('password') password?: string,
  ) {
    return this.sharesService.getSharedDocument(token, password);
  }

  @Get(':token/download')
  async downloadSharedDocument(
    @Param('token') token: string,
    @Query('password') password?: string,
  ) {
    return this.sharesService.downloadSharedDocument(token, password);
  }
}
