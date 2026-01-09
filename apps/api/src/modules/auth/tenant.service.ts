import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get current tenant information
   */
  async getTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      data: tenant,
    };
  }

  /**
   * Update tenant information
   */
  async updateTenant(tenantId: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        domain: data.domain,
        branding: data.branding,
        updatedAt: new Date(),
      },
    });

    return {
      data: updated,
      message: 'Tenant updated successfully',
    };
  }

  /**
   * Get tenant settings
   */
  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        settings: true,
        features: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      data: {
        settings: tenant.settings,
        features: tenant.features,
      },
    };
  }

  /**
   * Update tenant settings
   */
  async updateSettings(tenantId: string, settings: any, features?: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (settings) {
      updateData.settings = settings;
    }

    if (features) {
      updateData.features = features;
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return {
      data: {
        settings: updated.settings,
        features: updated.features,
      },
      message: 'Settings updated successfully',
    };
  }
}
