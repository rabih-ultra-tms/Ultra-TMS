"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { MFASettings } from "@/components/profile/mfa-settings";
import { ActiveSessions } from "@/components/profile/active-sessions";

export default function ProfileSecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Manage password and MFA" />
      <div className="grid gap-4 lg:grid-cols-2">
        <PasswordChangeForm />
        <MFASettings />
      </div>
      <ActiveSessions />
    </div>
  );
}
