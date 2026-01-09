import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update user's own profile
   */
  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        timezone: data.timezone,
        locale: data.locale,
        updatedAt: new Date(),
      },
      include: { role: true },
    });

    const { passwordHash, ...sanitized } = updated;

    return {
      data: sanitized,
      message: 'Profile updated successfully',
    };
  }

  /**
   * Change user's own password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    return {
      data: { success: true },
      message: 'Password changed successfully',
    };
  }

  /**
   * Update user avatar (placeholder for storage integration)
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl,
        updatedAt: new Date(),
      },
    });

    return {
      data: { avatarUrl: updated.avatarUrl },
      message: 'Avatar updated successfully',
    };
  }
}
