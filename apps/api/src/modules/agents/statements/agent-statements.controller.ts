import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentStatementsService } from './agent-statements.service';
import { GenerateStatementDto, StatementQueryDto } from './dto';
import type { Response } from 'express';

@Controller()
@UseGuards(JwtAuthGuard)
export class AgentStatementsController {
  constructor(private readonly statementsService: AgentStatementsService) {}

  @Get('agents/:id/statements')
  listForAgent(@Request() req: any, @Param('id') id: string, @Query() query: StatementQueryDto) {
    return this.statementsService.listForAgent(req.user.tenantId, id, query);
  }

  @Post('agents/:id/statements/generate')
  generate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: GenerateStatementDto,
  ) {
    return this.statementsService.generate(req.user.tenantId, id, dto);
  }

  @Get('agents/:id/statements/:statementId')
  findOne(@Request() req: any, @Param('id') id: string, @Param('statementId') statementId: string) {
    return this.statementsService.findOne(req.user.tenantId, id, statementId);
  }

  @Get('agents/:id/statements/:statementId/pdf')
  async download(
    @Request() req: any,
    @Param('id') id: string,
    @Param('statementId') statementId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.statementsService.generatePdf(req.user.tenantId, id, statementId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=agent-statement-${statementId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    return res.send(pdfBuffer);
  }
}
