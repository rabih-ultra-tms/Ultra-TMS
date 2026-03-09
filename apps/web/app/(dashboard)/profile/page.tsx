'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { ProfileForm } from '@/components/profile/profile-form';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { PasswordChangeForm } from '@/components/profile/password-change-form';
import { MFASettings } from '@/components/profile/mfa-settings';

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Profile" description="Manage your account settings and security" />

      {/* Profile Section */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <ProfileForm />
        <AvatarUpload />
      </div>

      {/* Security Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Security</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <PasswordChangeForm />
          <MFASettings />
        </div>
      </div>
    </div>
  );
}
