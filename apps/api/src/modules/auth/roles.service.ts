import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null, isSystem: true }],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
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
      throw new BadRequestException('Cannot modify system roles');
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    const role = await this.findOne(tenantId, id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if any users have this role
    const usersWithRole = await this.prisma.user.count({
      where: { roleId: id, deletedAt: null },
    });

    if (usersWithRole > 0) {
      throw new BadRequestException(`Cannot delete role: ${usersWithRole} users are assigned to it`);
    }

    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Get all available permissions
   */
  async getAvailablePermissions() {
    // Master permissions list for Ultra-TMS
    const rawPermissions = [
      // User Management
      { module: 'users', name: 'users.view', description: 'View and search user accounts in the system' },
      { module: 'users', name: 'users.create', description: 'Add new users to your organization' },
      { module: 'users', name: 'users.edit', description: 'Update user information and settings' },
      { module: 'users', name: 'users.delete', description: 'Remove users from the system' },
      { module: 'users', name: 'users.invite', description: 'Send invitations to new users via email' },
      
      // Role Management
      { module: 'roles', name: 'roles.view', description: 'View all roles and their permissions' },
      { module: 'roles', name: 'roles.create', description: 'Create new custom roles for your team' },
      { module: 'roles', name: 'roles.edit', description: 'Modify existing roles and their permissions' },
      { module: 'roles', name: 'roles.delete', description: 'Remove roles that are no longer needed' },
      
      // Tenant Management
      { module: 'tenant', name: 'tenant.settings', description: 'Configure company-wide settings and preferences' },
      
      // CRM
      { module: 'crm', name: 'crm.companies.view', description: 'View customer and partner company information' },
      { module: 'crm', name: 'crm.companies.create', description: 'Add new companies to your CRM' },
      { module: 'crm', name: 'crm.companies.edit', description: 'Update company details and information' },
      { module: 'crm', name: 'crm.companies.delete', description: 'Remove companies from your CRM' },
      { module: 'crm', name: 'crm.contacts.view', description: 'View contact persons at customer companies' },
      { module: 'crm', name: 'crm.contacts.create', description: 'Add new contacts to companies' },
      { module: 'crm', name: 'crm.contacts.edit', description: 'Update contact information and details' },
      { module: 'crm', name: 'crm.contacts.delete', description: 'Remove contacts from the system' },
      
      // Sales
      { module: 'sales', name: 'sales.quotes.view', description: 'View price quotes sent to customers' },
      { module: 'sales', name: 'sales.quotes.create', description: 'Create new quotes for potential sales' },
      { module: 'sales', name: 'sales.quotes.edit', description: 'Modify existing quotes before approval' },
      { module: 'sales', name: 'sales.quotes.delete', description: 'Remove quotes that are no longer needed' },
      { module: 'sales', name: 'sales.quotes.approve', description: 'Approve quotes to send to customers' },
      
      // TMS Core
      { module: 'tms', name: 'tms.orders.view', description: 'View transportation orders and shipments' },
      { module: 'tms', name: 'tms.orders.create', description: 'Create new transportation orders' },
      { module: 'tms', name: 'tms.orders.edit', description: 'Update order details and information' },
      { module: 'tms', name: 'tms.orders.delete', description: 'Cancel or remove transportation orders' },
      { module: 'tms', name: 'tms.orders.assign', description: 'Assign orders to carriers and drivers' },
      { module: 'tms', name: 'tms.loads.view', description: 'View load details and tracking information' },
      { module: 'tms', name: 'tms.loads.create', description: 'Create new loads for transportation' },
      { module: 'tms', name: 'tms.loads.edit', description: 'Update load information and details' },
      { module: 'tms', name: 'tms.loads.dispatch', description: 'Dispatch loads to carriers and drivers' },
      
      // Carriers
      { module: 'carriers', name: 'carriers.view', description: 'View carrier profiles and information' },
      { module: 'carriers', name: 'carriers.create', description: 'Add new carriers to your network' },
      { module: 'carriers', name: 'carriers.edit', description: 'Update carrier information and contracts' },
      { module: 'carriers', name: 'carriers.delete', description: 'Remove carriers from your network' },
      { module: 'carriers', name: 'carriers.approve', description: 'Approve new carriers to work with' },
      
      // Accounting
      { module: 'accounting', name: 'accounting.invoices.view', description: 'View customer and carrier invoices' },
      { module: 'accounting', name: 'accounting.invoices.create', description: 'Create new invoices for services' },
      { module: 'accounting', name: 'accounting.invoices.edit', description: 'Update invoice details before sending' },
      { module: 'accounting', name: 'accounting.invoices.approve', description: 'Approve invoices for payment processing' },
      { module: 'accounting', name: 'accounting.payments.view', description: 'View payment records and transaction history' },
      { module: 'accounting', name: 'accounting.payments.create', description: 'Process and record new payments' },
      { module: 'accounting', name: 'accounting.payments.approve', description: 'Approve payments for processing' },
      
      // Documents
      { module: 'documents', name: 'documents.view', description: 'View and download uploaded documents' },
      { module: 'documents', name: 'documents.upload', description: 'Upload new documents and files' },
      { module: 'documents', name: 'documents.delete', description: 'Remove documents from the system' },
      
      // Reports
      { module: 'reports', name: 'reports.financial', description: 'Access financial reports and revenue analytics' },
      { module: 'reports', name: 'reports.operations', description: 'View operational performance and efficiency reports' },
      { module: 'reports', name: 'reports.sales', description: 'Access sales metrics and performance reports' },
      
      // Commission
      { module: 'commission', name: 'commission.view', description: 'View commission calculations and earnings' },
      { module: 'commission', name: 'commission.calculate', description: 'Calculate commissions for sales and services' },
      { module: 'commission', name: 'commission.approve', description: 'Approve commission payments to team members' },
    ];

    const permissions = rawPermissions.map((permission) => ({
      id: permission.name,
      code: permission.name,
      name: permission.description,
      description: permission.description,
      group: permission.module,
      isSystem: true,
    }));

    return {
      data: permissions,
    };
  }
}
