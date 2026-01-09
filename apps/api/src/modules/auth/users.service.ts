import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(tenantId: string, options?: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map(this.sanitizeUser),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(tenantId: string, email: string) {
    return this.prisma.user.findFirst({
      where: { tenantId, email, deletedAt: null },
      include: { role: true },
    });
  }

  async create(tenantId: string, createdById: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: dto.roleId,
        timezone: dto.timezone || 'America/Chicago',
        locale: dto.locale || 'en',
        status: 'INVITED',
        createdById,
      },
      include: { role: true },
    });

    return this.sanitizeUser(user);
  }

  async update(tenantId: string, id: string, updatedById: string, dto: UpdateUserDto) {
    const user = await this.findOne(tenantId, id);

    const updateData: any = {
      ...dto,
      updatedById,
    };

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    return this.sanitizeUser(updated);
  }

  async delete(tenantId: string, id: string, deletedById: string) {
    await this.findOne(tenantId, id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: deletedById },
    });

    return { success: true };
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateLastLogin(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0 },
    });
  }

  async incrementFailedAttempts(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
    });

    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      await this.prisma.user.update({
        where: { id },
        data: {
          status: 'LOCKED',
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      });
    }
  }

  /**
   * Send invitation email to user
   */
  async inviteUser(tenantId: string, userId: string, inviter: any) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'INVITED') {
      throw new BadRequestException('User must be in INVITED status to send invitation');
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Send invitation email
    await this.emailService.sendInvitation(
      user.email,
      user.firstName,
      invitationToken,
      `${inviter.firstName} ${inviter.lastName}`,
    );

    return {
      data: { success: true },
      message: 'Invitation sent successfully',
    };
  }

  /**
   * Activate a user account
   */
  async activateUser(tenantId: string, userId: string, updatedById: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'ACTIVE') {
      throw new BadRequestException('User is already active');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        updatedById,
        updatedAt: new Date(),
      },
      include: { role: true },
    });

    return {
      data: this.sanitizeUser(updatedUser),
      message: 'User activated successfully',
    };
  }

  /**
   * Deactivate a user account
   */
  async deactivateUser(tenantId: string, userId: string, updatedById: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'INACTIVE') {
      throw new BadRequestException('User is already inactive');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'INACTIVE',
        updatedById,
        updatedAt: new Date(),
      },
      include: { role: true },
    });

    return {
      data: this.sanitizeUser(updatedUser),
      message: 'User deactivated successfully',
    };
  }

  /**
   * Admin reset user password (sends reset email)
   */
  async resetUserPassword(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Send password reset email
    await this.emailService.sendPasswordReset(user.email, user.firstName, resetToken);

    return {
      data: { success: true },
      message: 'Password reset email sent successfully',
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
