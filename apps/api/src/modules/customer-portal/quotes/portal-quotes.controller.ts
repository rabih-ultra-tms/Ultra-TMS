import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { PortalQuotesService } from './portal-quotes.service';
import {
  AcceptQuoteDto,
  DeclineQuoteDto,
  EstimateQuoteDto,
  RevisionRequestDto,
  SubmitQuoteRequestDto,
} from './dto/submit-quote-request.dto';

@UseGuards(PortalAuthGuard)
@Controller('portal/quotes')
export class PortalQuotesController {
  constructor(private readonly quotesService: PortalQuotesService) {}

  @Get()
  list(@Req() req: any) {
    return this.quotesService.list(req.portalUser.tenantId, req.portalUser.companyId, req.portalUser.id);
  }

  @Post('request')
  submit(@Body() dto: SubmitQuoteRequestDto, @Req() req: any) {
    return this.quotesService.submit(req.portalUser.tenantId, req.portalUser.companyId, req.portalUser.id, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string, @Req() req: any) {
    return this.quotesService.detail(req.portalUser.tenantId, id);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Body() dto: AcceptQuoteDto, @Req() req: any) {
    return this.quotesService.accept(req.portalUser.tenantId, id, dto);
  }

  @Post(':id/decline')
  decline(@Param('id') id: string, @Body() dto: DeclineQuoteDto, @Req() req: any) {
    return this.quotesService.decline(req.portalUser.tenantId, id, dto);
  }

  @Post(':id/revision')
  revision(@Param('id') id: string, @Body() dto: RevisionRequestDto, @Req() req: any) {
    return this.quotesService.revision(req.portalUser.tenantId, id, dto);
  }

  @Get(':id/pdf')
  pdf(@Param('id') id: string, @Req() req: any) {
    return { url: `/portal/quotes/${id}/quote.pdf`, tenantId: req.portalUser.tenantId };
  }

  @Post('estimate')
  estimate(@Body() dto: EstimateQuoteDto, @Req() req: any) {
    return this.quotesService.estimate(req.portalUser.tenantId, req.portalUser.companyId, req.portalUser.id, dto);
  }
}