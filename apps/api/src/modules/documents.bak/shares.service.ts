import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateShareDto, ShareType } from './dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SharesService {
  constructor(private readonly prisma: PrismaService) {}

  async createShare(tenantId: string, documentId: string, userId: string, dto: CreateShareDto) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Generate secure access token
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Hash password if provided
    let accessPassword: string | undefined;
    if (dto.password) {
      accessPassword = await bcrypt.hash(dto.password, 10);
    }

    const share = await this.prisma.documentShare.create({
      data: {
        documentId,
        shareType: dto.shareType,
        accessToken,
        accessPassword,
        expiresAt: dto.expiresAt,
        maxViews: dto.maxViews,
        maxDownloads: dto.maxDownloads,
        allowDownload: dto.allowDownload ?? true,
        recipientEmail: dto.recipientEmail,
        recipientName: dto.recipientName,
        createdBy: userId,
      },
    });

    // Generate the share URL
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${accessToken}`;

    return {
      ...share,
      shareUrl,
      accessToken, // Only return on creation
    };
  }

  async getDocumentShares(tenantId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.documentShare.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shareType: true,
        expiresAt: true,
        maxViews: true,
        maxDownloads: true,
        viewCount: true,
        downloadCount: true,
        allowDownload: true,
        recipientEmail: true,
        recipientName: true,
        status: true,
        createdAt: true,
        lastAccessedAt: true,
      },
    });
  }

  async getSharedDocument(accessToken: string, password?: string) {
    const share = await this.prisma.documentShare.findUnique({
      where: { accessToken },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            documentType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share link not found or expired');
    }

    // Check status
    if (share.status !== 'ACTIVE') {
      throw new BadRequestException('Share link is no longer active');
    }

    // Check expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      await this.prisma.documentShare.update({
        where: { id: share.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Share link has expired');
    }

    // Check max views
    if (share.maxViews && share.viewCount >= share.maxViews) {
      throw new BadRequestException('Maximum views exceeded');
    }

    // Check password
    if (share.accessPassword) {
      if (!password) {
        return {
          requiresPassword: true,
          document: {
            name: share.document.name,
          },
        };
      }

      const passwordValid = await bcrypt.compare(password, share.accessPassword);
      if (!passwordValid) {
        throw new BadRequestException('Invalid password');
      }
    }

    // Update view count and last accessed
    await this.prisma.documentShare.update({
      where: { id: share.id },
      data: {
        viewCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return {
      document: share.document,
      allowDownload: share.allowDownload,
      downloadCount: share.downloadCount,
      maxDownloads: share.maxDownloads,
    };
  }

  async downloadSharedDocument(accessToken: string, password?: string) {
    const share = await this.prisma.documentShare.findUnique({
      where: { accessToken },
      include: {
        document: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    if (share.status !== 'ACTIVE') {
      throw new BadRequestException('Share link is no longer active');
    }

    if (!share.allowDownload) {
      throw new BadRequestException('Download not allowed for this share');
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      throw new BadRequestException('Maximum downloads exceeded');
    }

    // Check password if required
    if (share.accessPassword) {
      if (!password) {
        throw new BadRequestException('Password required');
      }

      const passwordValid = await bcrypt.compare(password, share.accessPassword);
      if (!passwordValid) {
        throw new BadRequestException('Invalid password');
      }
    }

    // Update download count
    await this.prisma.documentShare.update({
      where: { id: share.id },
      data: {
        downloadCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    // Return document for download
    // In production, return pre-signed S3 URL
    return {
      document: share.document,
      downloadUrl: `/api/v1/documents/${share.document.id}/file`,
    };
  }

  async revokeShare(tenantId: string, shareId: string) {
    const share = await this.prisma.documentShare.findFirst({
      where: { id: shareId },
      include: {
        document: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.document.tenantId !== tenantId) {
      throw new NotFoundException('Share not found');
    }

    await this.prisma.documentShare.update({
      where: { id: shareId },
      data: { status: 'REVOKED' },
    });

    return { success: true };
  }

  async updateShare(
    tenantId: string,
    shareId: string,
    updates: Partial<CreateShareDto>,
  ) {
    const share = await this.prisma.documentShare.findFirst({
      where: { id: shareId },
      include: { document: true },
    });

    if (!share || share.document.tenantId !== tenantId) {
      throw new NotFoundException('Share not found');
    }

    const data: any = {};

    if (updates.expiresAt !== undefined) {
      data.expiresAt = updates.expiresAt;
    }

    if (updates.maxViews !== undefined) {
      data.maxViews = updates.maxViews;
    }

    if (updates.maxDownloads !== undefined) {
      data.maxDownloads = updates.maxDownloads;
    }

    if (updates.allowDownload !== undefined) {
      data.allowDownload = updates.allowDownload;
    }

    if (updates.password) {
      data.accessPassword = await bcrypt.hash(updates.password, 10);
    }

    return this.prisma.documentShare.update({
      where: { id: shareId },
      data,
    });
  }
}
