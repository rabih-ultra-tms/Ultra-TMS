import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './guards';
import { ProfileService } from './profile.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { IStorageService } from '../storage/storage.interface';
import { STORAGE_SERVICE } from '../storage/storage.module';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  /**
   * GET /api/v1/profile
   * Get current user profile
   */
  @Get()
  async getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  /**
   * PUT /api/v1/profile
   * Update own profile
   */
  @Put()
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { firstName?: string; lastName?: string; phone?: string; title?: string },
  ) {
    return this.profileService.updateProfile(userId, data);
  }

  /**
   * PUT /api/v1/profile/password
   * Change own password
   */
  @Put('password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.profileService.changePassword(userId, currentPassword, newPassword);
  }

  /**
   * POST /api/v1/profile/avatar
   * Upload avatar image
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${userId}-${Date.now()}.${fileExtension}`;

    // Upload to storage
    const avatarUrl = await this.storageService.upload(
      file.buffer,
      filename,
      'avatars',
    );

    // Update user record
    return this.profileService.updateAvatar(userId, avatarUrl);
  }
}
