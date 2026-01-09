import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { ApprovalsService } from './approvals.service';
import {
  ApprovalQueryDto,
  ApproveRequestDto,
  RejectRequestDto,
  DelegateRequestDto,
  AddApprovalCommentDto,
} from './dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ApprovalQueryDto,
  ) {
    return this.approvalsService.findAll(tenantId, query);
  }

  @Get('my')
  async findMyApprovals(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Query() query: ApprovalQueryDto,
  ) {
    return this.approvalsService.findMyApprovals(tenantId, userId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.approvalsService.findOne(tenantId, id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
  ) {
    return this.approvalsService.approve(tenantId, id, userId, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: RejectRequestDto,
  ) {
    return this.approvalsService.reject(tenantId, id, userId, dto);
  }

  @Post(':id/delegate')
  @HttpCode(HttpStatus.OK)
  async delegate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: DelegateRequestDto,
  ) {
    return this.approvalsService.delegate(tenantId, id, userId, dto);
  }

  @Post(':id/comment')
  @HttpCode(HttpStatus.OK)
  async addComment(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: AddApprovalCommentDto,
  ) {
    return this.approvalsService.addComment(tenantId, id, userId, dto);
  }
}
