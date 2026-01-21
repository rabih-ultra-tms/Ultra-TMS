"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileForm } from "@/components/profile/profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information" />
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileForm />
        <AvatarUpload />
      </div>
    </div>
  );
}
