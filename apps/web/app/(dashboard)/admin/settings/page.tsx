"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import type { Tenant, TenantSettings } from "@/lib/types/auth";

const tenantSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const settingsSchema = z.object({
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  currency: z.string(),
  language: z.string(),
  brandingPrimaryColor: z.string(),
  brandingSecondaryColor: z.string(),
  featuresCarrierManagement: z.boolean(),
  featuresLoadBoard: z.boolean(),
  featuresAccounting: z.boolean(),
  featuresAnalytics: z.boolean(),
  notificationsEmail: z.boolean(),
  notificationsSms: z.boolean(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;
type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function TenantSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"company" | "settings">("company");

  const tenantForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
    },
  });

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      currency: "USD",
      language: "en",
      brandingPrimaryColor: "#0066CC",
      brandingSecondaryColor: "#FF6600",
      featuresCarrierManagement: true,
      featuresLoadBoard: true,
      featuresAccounting: true,
      featuresAnalytics: true,
      notificationsEmail: true,
      notificationsSms: false,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tenantResponse, settingsResponse] = await Promise.all([
        apiClient.get<Tenant>("/auth/tenant"),
        apiClient.get<TenantSettings>("/auth/tenant/settings"),
      ]);

      tenantForm.reset({
        name: tenantResponse.name,
        contactEmail: tenantResponse.contactEmail,
        contactPhone: tenantResponse.contactPhone,
        address: tenantResponse.address,
      });

      settingsForm.reset(settingsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitTenant = async (data: TenantFormValues) => {
    setIsSavingTenant(true);

    try {
      await apiClient.put("/auth/tenant", data);
      alert("Company information updated successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update company information");
    } finally {
      setIsSavingTenant(false);
    }
  };

  const onSubmitSettings = async (data: SettingsFormValues) => {
    setIsSavingSettings(true);

    try {
      await apiClient.put("/auth/tenant/settings", data);
      alert("Settings updated successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tenant Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your company information and system preferences
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("company")}
              className={`${
                activeTab === "company"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Company Information
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              System Settings
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "company" && (
        <div className="bg-white rounded-lg shadow p-6">
          <Form {...tenantForm}>
            <form onSubmit={tenantForm.handleSubmit(onSubmitTenant)} className="space-y-6">
              <FormField
                control={tenantForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tenantForm.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tenantForm.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tenantForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingTenant}>
                  {isSavingTenant ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Regional Settings
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={settingsForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date format</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="timeFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time format</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="12h">12-hour</option>
                            <option value="24h">24-hour</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Feature Toggles
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="featuresCarrierManagement"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Carrier Management</FormLabel>
                          <FormDescription>
                            Enable carrier onboarding and management features
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="featuresLoadBoard"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Load Board</FormLabel>
                          <FormDescription>
                            Enable internal load board functionality
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="featuresAccounting"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Accounting</FormLabel>
                          <FormDescription>
                            Enable invoicing and accounting features
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="featuresAnalytics"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Analytics</FormLabel>
                          <FormDescription>
                            Enable analytics dashboards and reports
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Notifications
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="notificationsEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={settingsForm.control}
                    name="notificationsSms"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>SMS Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via SMS
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingSettings}>
                  {isSavingSettings ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
