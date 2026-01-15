import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { PortalQuotesService } from './portal-quotes.service';
import {
  AcceptQuoteDto,
  DeclineQuoteDto,
  EstimateQuoteDto,
  RevisionRequestDto,
  SubmitQuoteRequestDto,
} from './dto/submit-quote-request.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CompanyScope } from '../decorators/company-scope.decorator';
import type { CompanyScopeType } from '../decorators/company-scope.decorator';

@UseGuards(PortalAuthGuard, CompanyScopeGuard)
@Controller('portal/quotes')
@ApiTags('Customer Portal')
@ApiBearerAuth('Portal-JWT')
export class PortalQuotesController {
  constructor(private readonly quotesService: PortalQuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List portal quotes' })
  @ApiStandardResponse('Portal quotes list')
  @ApiErrorResponses()
  list(@CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.quotesService.list(scope.tenantId, scope.id, req.portalUser.id);
  }

  @Post('request')
  @ApiOperation({ summary: 'Submit quote request' })
  @ApiStandardResponse('Quote request submitted')
  @ApiErrorResponses()
  submit(@Body() dto: SubmitQuoteRequestDto, @CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.quotesService.submit(scope.tenantId, scope.id, req.portalUser.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote details')
  @ApiErrorResponses()
  detail(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.quotesService.detail(scope.tenantId, scope.id, id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote accepted')
  @ApiErrorResponses()
  accept(@Param('id') id: string, @Body() dto: AcceptQuoteDto, @CompanyScope() scope: CompanyScopeType) {
    return this.quotesService.accept(scope.tenantId, scope.id, id, dto);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote declined')
  @ApiErrorResponses()
  decline(@Param('id') id: string, @Body() dto: DeclineQuoteDto, @CompanyScope() scope: CompanyScopeType) {
    return this.quotesService.decline(scope.tenantId, scope.id, id, dto);
  }

  @Post(':id/revision')
  @ApiOperation({ summary: 'Request quote revision' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote revision requested')
  @ApiErrorResponses()
  revision(@Param('id') id: string, @Body() dto: RevisionRequestDto, @CompanyScope() scope: CompanyScopeType) {
    return this.quotesService.revision(scope.tenantId, scope.id, id, dto);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Get quote PDF' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiStandardResponse('Quote PDF')
  @ApiErrorResponses()
  pdf(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return { url: `/portal/quotes/${id}/quote.pdf`, tenantId: scope.tenantId };
  }

  @Post('estimate')
  @ApiOperation({ summary: 'Estimate quote' })
  @ApiStandardResponse('Quote estimate')
  @ApiErrorResponses()
  estimate(@Body() dto: EstimateQuoteDto, @CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.quotesService.estimate(scope.tenantId, scope.id, req.portalUser.id, dto);
  }
}