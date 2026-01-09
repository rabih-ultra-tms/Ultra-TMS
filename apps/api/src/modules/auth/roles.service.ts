import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    console.log('🔍 Finding roles for tenantId:', tenantId);
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null, isSystem: true }],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
    console.log('✅ Found roles:', roles.length, roles.map(r => r.name));
    return roles;
  }

  async findOne(tenantId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        OR: [{ tenantId }, { tenantId: null, isSystem: true }],
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(tenantId: string, dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions || [],
        isSystem: false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(tenantId, id);

    if (role.isSystem) {
      throw new Error('Cannot modify system roles');
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    const role = await this.findOne(tenantId, id);

    if (role.isSystem) {
      throw new Error('Cannot delete system roles');
    }

    // Check if any users have this role
    const usersWithRole = await this.prisma.user.count({
      where: { roleId: id, deletedAt: null },
    });

    if (usersWithRole > 0) {
      throw new Error(`Cannot delete role: ${usersWithRole} users are assigned to it`);
    }

    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Get all available permissions
   */
  async getAvailablePermissions() {
    // Master permissions list for Ultra-TMS
    const permissions = [
      // User Management
      { module: 'users', name: 'users.view', description: 'View users' },
      { module: 'users', name: 'users.create', description: 'Create users' },
      { module: 'users', name: 'users.edit', description: 'Edit users' },
      { module: 'users', name: 'users.delete', description: 'Delete users' },
      { module: 'users', name: 'users.invite', description: 'Invite users' },
      
      // Role Management
      { module: 'roles', name: 'roles.view', description: 'View roles' },
      { module: 'roles', name: 'roles.create', description: 'Create roles' },
      { module: 'roles', name: 'roles.edit', description: 'Edit roles' },
      { module: 'roles', name: 'roles.delete', description: 'Delete roles' },
      
      // Tenant Management
      { module: 'tenant', name: 'tenant.settings', description: 'Manage tenant settings' },
      
      // CRM
      { module: 'crm', name: 'crm.companies.view', description: 'View companies' },
      { module: 'crm', name: 'crm.companies.create', description: 'Create companies' },
      { module: 'crm', name: 'crm.companies.edit', description: 'Edit companies' },
      { module: 'crm', name: 'crm.companies.delete', description: 'Delete companies' },
      { module: 'crm', name: 'crm.contacts.view', description: 'View contacts' },
      { module: 'crm', name: 'crm.contacts.create', description: 'Create contacts' },
      { module: 'crm', name: 'crm.contacts.edit', description: 'Edit contacts' },
      { module: 'crm', name: 'crm.contacts.delete', description: 'Delete contacts' },
      
      // Sales
      { module: 'sales', name: 'sales.quotes.view', description: 'View quotes' },
      { module: 'sales', name: 'sales.quotes.create', description: 'Create quotes' },
      { module: 'sales', name: 'sales.quotes.edit', description: 'Edit quotes' },
      { module: 'sales', name: 'sales.quotes.delete', description: 'Delete quotes' },
      { module: 'sales', name: 'sales.quotes.approve', description: 'Approve quotes' },
      
      // TMS Core
      { module: 'tms', name: 'tms.orders.view', description: 'View orders' },
      { module: 'tms', name: 'tms.orders.create', description: 'Create orders' },
      { module: 'tms', name: 'tms.orders.edit', description: 'Edit orders' },
      { module: 'tms', name: 'tms.orders.delete', description: 'Delete orders' },
      { module: 'tms', name: 'tms.orders.assign', description: 'Assign orders' },
      { module: 'tms', name: 'tms.loads.view', description: 'View loads' },
      { module: 'tms', name: 'tms.loads.create', description: 'Create loads' },
      { module: 'tms', name: 'tms.loads.edit', description: 'Edit loads' },
      { module: 'tms', name: 'tms.loads.dispatch', description: 'Dispatch loads' },
      
      // Carriers
      { module: 'carriers', name: 'carriers.view', description: 'View carriers' },
      { module: 'carriers', name: 'carriers.create', description: 'Create carriers' },
      { module: 'carriers', name: 'carriers.edit', description: 'Edit carriers' },
      { module: 'carriers', name: 'carriers.delete', description: 'Delete carriers' },
      { module: 'carriers', name: 'carriers.approve', description: 'Approve carriers' },
      
      // Accounting
      { module: 'accounting', name: 'accounting.invoices.view', description: 'View invoices' },
      { module: 'accounting', name: 'accounting.invoices.create', description: 'Create invoices' },
      { module: 'accounting', name: 'accounting.invoices.edit', description: 'Edit invoices' },
      { module: 'accounting', name: 'accounting.invoices.approve', description: 'Approve invoices' },
      { module: 'accounting', name: 'accounting.payments.view', description: 'View payments' },
      { module: 'accounting', name: 'accounting.payments.create', description: 'Create payments' },
      { module: 'accounting', name: 'accounting.payments.approve', description: 'Approve payments' },
      
      // Documents
      { module: 'documents', name: 'documents.view', description: 'View documents' },
      { module: 'documents', name: 'documents.upload', description: 'Upload documents' },
      { module: 'documents', name: 'documents.delete', description: 'Delete documents' },
      
      // Reports
      { module: 'reports', name: 'reports.financial', description: 'View financial reports' },
      { module: 'reports', name: 'reports.operations', description: 'View operations reports' },
      { module: 'reports', name: 'reports.sales', description: 'View sales reports' },
      
      // Commission
      { module: 'commission', name: 'commission.view', description: 'View commissions' },
      { module: 'commission', name: 'commission.calculate', description: 'Calculate commissions' },
      { module: 'commission', name: 'commission.approve', description: 'Approve commissions' },
    ];

    return {
      data: permissions,
    };
  }
}
