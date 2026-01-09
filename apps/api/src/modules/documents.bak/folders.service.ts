import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFolderDto, UpdateFolderDto, AddDocumentToFolderDto } from './dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateFolderDto) {
    // Validate parent folder exists if provided
    if (dto.parentFolderId) {
      const parentFolder = await this.prisma.documentFolder.findFirst({
        where: { id: dto.parentFolderId, tenantId },
      });

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    // Check for duplicate name in same parent
    const existing = await this.prisma.documentFolder.findFirst({
      where: {
        tenantId,
        parentFolderId: dto.parentFolderId || null,
        name: dto.name,
      },
    });

    if (existing) {
      throw new BadRequestException('Folder with this name already exists');
    }

    // Build path
    let path = `/${dto.name}`;
    if (dto.parentFolderId) {
      const parentFolder = await this.prisma.documentFolder.findFirst({
        where: { id: dto.parentFolderId },
      });
      path = `${parentFolder?.path || ''}/${dto.name}`;
    }

    return this.prisma.documentFolder.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        parentFolderId: dto.parentFolderId,
        path,
        entityType: dto.entityType,
        entityId: dto.entityId,
        createdBy: userId,
      },
      include: {
        parentFolder: { select: { id: true, name: true, path: true } },
        subFolders: { select: { id: true, name: true } },
        _count: { select: { documents: true, subFolders: true } },
      },
    });
  }

  async findAll(
    tenantId: string,
    parentFolderId?: string,
    entityType?: string,
    entityId?: string,
  ) {
    const where: any = {
      tenantId,
    };

    if (parentFolderId) {
      where.parentFolderId = parentFolderId;
    } else if (!entityType) {
      // Only root folders if no parent specified and not filtering by entity
      where.parentFolderId = null;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    return this.prisma.documentFolder.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parentFolder: { select: { id: true, name: true } },
        _count: { select: { documents: true, subFolders: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
      include: {
        parentFolder: { select: { id: true, name: true, path: true } },
        subFolders: {
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        },
        documents: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                documentType: true,
                fileName: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async update(tenantId: string, id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.isSystem) {
      throw new BadRequestException('Cannot modify system folder');
    }

    // Check for circular reference
    if (dto.parentFolderId) {
      if (dto.parentFolderId === id) {
        throw new BadRequestException('Folder cannot be its own parent');
      }

      // Check if the new parent is a descendant of this folder
      const isDescendant = await this.isDescendant(dto.parentFolderId, id);
      if (isDescendant) {
        throw new BadRequestException('Cannot move folder into its own descendant');
      }
    }

    // Update path if name or parent changes
    let path = folder.path;
    if (dto.name || dto.parentFolderId !== undefined) {
      const name = dto.name || folder.name;
      if (dto.parentFolderId) {
        const parentFolder = await this.prisma.documentFolder.findFirst({
          where: { id: dto.parentFolderId },
        });
        path = `${parentFolder?.path || ''}/${name}`;
      } else if (dto.parentFolderId === null) {
        path = `/${name}`;
      } else {
        // Just name change, update last segment
        const segments = folder.path?.split('/') || [''];
        segments[segments.length - 1] = name;
        path = segments.join('/');
      }
    }

    return this.prisma.documentFolder.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        parentFolderId: dto.parentFolderId,
        path,
      },
      include: {
        parentFolder: { select: { id: true, name: true } },
        _count: { select: { documents: true, subFolders: true } },
      },
    });
  }

  async delete(tenantId: string, id: string, recursive = false) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { documents: true, subFolders: true } },
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.isSystem) {
      throw new BadRequestException('Cannot delete system folder');
    }

    if (!recursive && (folder._count.documents > 0 || folder._count.subFolders > 0)) {
      throw new BadRequestException(
        'Folder is not empty. Use recursive=true to delete with contents',
      );
    }

    if (recursive) {
      // Delete all descendants
      await this.deleteRecursive(id);
    }

    await this.prisma.documentFolder.delete({ where: { id } });
    return { success: true };
  }

  async addDocument(tenantId: string, folderId: string, userId: string, dto: AddDocumentToFolderDto) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id: folderId, tenantId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const document = await this.prisma.document.findFirst({
      where: { id: dto.documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if already in folder
    const existing = await this.prisma.folderDocument.findUnique({
      where: {
        folderId_documentId: {
          folderId,
          documentId: dto.documentId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Document already in folder');
    }

    return this.prisma.folderDocument.create({
      data: {
        folderId,
        documentId: dto.documentId,
        addedBy: userId,
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            documentType: true,
            fileName: true,
            mimeType: true,
          },
        },
      },
    });
  }

  async removeDocument(tenantId: string, folderId: string, documentId: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id: folderId, tenantId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const folderDocument = await this.prisma.folderDocument.findUnique({
      where: {
        folderId_documentId: {
          folderId,
          documentId,
        },
      },
    });

    if (!folderDocument) {
      throw new NotFoundException('Document not in folder');
    }

    await this.prisma.folderDocument.delete({
      where: {
        folderId_documentId: {
          folderId,
          documentId,
        },
      },
    });

    return { success: true };
  }

  private async isDescendant(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id: potentialDescendantId },
    });

    if (!folder) return false;
    if (!folder.parentFolderId) return false;
    if (folder.parentFolderId === ancestorId) return true;

    return this.isDescendant(folder.parentFolderId, ancestorId);
  }

  private async deleteRecursive(folderId: string) {
    // Get all subfolders
    const subFolders = await this.prisma.documentFolder.findMany({
      where: { parentFolderId: folderId },
    });

    for (const subFolder of subFolders) {
      await this.deleteRecursive(subFolder.id);
      await this.prisma.documentFolder.delete({ where: { id: subFolder.id } });
    }

    // Delete folder document associations
    await this.prisma.folderDocument.deleteMany({
      where: { folderId },
    });
  }
}
