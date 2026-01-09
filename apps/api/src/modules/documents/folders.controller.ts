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
import { FoldersService } from './folders.service';
import { CreateFolderDto, UpdateFolderDto, AddDocumentToFolderDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('documents/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateFolderDto) {
    return this.foldersService.create(req.user.tenantId, req.user.sub, dto);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('parentFolderId') parentFolderId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.foldersService.findAll(
      req.user.tenantId,
      parentFolderId,
      entityType,
      entityId,
    );
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.foldersService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
  ) {
    return this.foldersService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Req() req: any,
    @Param('id') id: string,
    @Query('recursive') recursive?: boolean,
  ) {
    return this.foldersService.delete(req.user.tenantId, id, recursive);
  }

  @Post(':id/add')
  async addDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AddDocumentToFolderDto,
  ) {
    return this.foldersService.addDocument(
      req.user.tenantId,
      id,
      req.user.sub,
      dto,
    );
  }

  @Delete(':id/remove/:docId')
  async removeDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return this.foldersService.removeDocument(req.user.tenantId, id, docId);
  }
}
