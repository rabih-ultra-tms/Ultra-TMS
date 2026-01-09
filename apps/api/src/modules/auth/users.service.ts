import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
