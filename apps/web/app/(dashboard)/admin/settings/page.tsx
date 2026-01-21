"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { GeneralSettingsForm } from "@/components/admin/settings/general-settings-form";
import { SecuritySettingsForm } from "@/components/admin/settings/security-settings-form";
import { NotificationSettings } from "@/components/admin/settings/notification-settings";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="System settings" description="Manage system-wide settings" />
      <div className="grid gap-4 lg:grid-cols-3">
        <GeneralSettingsForm />
        <SecuritySettingsForm />
        <NotificationSettings />
      </div>
    </div>
  );
}
