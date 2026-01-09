"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import type { Role } from "@/lib/types/auth";

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const SERVICE_CATEGORIES = [
  {
    name: "Core Services",
    description: "Essential business logic for freight brokerage operations",
    services: [
      {
        name: "Auth & Admin",
        description: "User authentication, roles, and tenant management",
        icon: "🔐",
        permissions: [
          { key: "users.view", label: "View Users", description: "View user profiles and details" },
          { key: "users.create", label: "Create Users", description: "Add new users to the system" },
          { key: "users.edit", label: "Edit Users", description: "Modify user information" },
          { key: "users.delete", label: "Delete Users", description: "Remove users from the system" },
          { key: "users.invite", label: "Invite Users", description: "Send user invitations" },
          { key: "roles.view", label: "View Roles", description: "View role configurations" },
          { key: "roles.create", label: "Create Roles", description: "Create new roles" },
          { key: "roles.edit", label: "Edit Roles", description: "Modify role permissions" },
          { key: "roles.delete", label: "Delete Roles", description: "Remove roles" },
          { key: "tenant.view", label: "View Tenant", description: "View tenant settings" },
          { key: "tenant.edit", label: "Edit Tenant", description: "Modify tenant configuration" },
          { key: "tenant.settings", label: "Tenant Settings", description: "Manage tenant settings" },
        ],
      },
      {
        name: "CRM",
        description: "Customer relationship management - companies, contacts, opportunities",
        icon: "👥",
        permissions: [
          { key: "crm.companies.view", label: "View Companies", description: "View customer companies" },
          { key: "crm.companies.create", label: "Create Companies", description: "Add new customers" },
          { key: "crm.companies.edit", label: "Edit Companies", description: "Modify customer details" },
          { key: "crm.companies.delete", label: "Delete Companies", description: "Remove customers" },
          { key: "crm.contacts.view", label: "View Contacts", description: "View contact information" },
          { key: "crm.contacts.create", label: "Create Contacts", description: "Add new contacts" },
          { key: "crm.contacts.edit", label: "Edit Contacts", description: "Modify contact details" },
          { key: "crm.contacts.delete", label: "Delete Contacts", description: "Remove contacts" },
          { key: "crm.leads.view", label: "View Leads", description: "View sales leads" },
          { key: "crm.leads.create", label: "Create Leads", description: "Add new leads" },
          { key: "crm.leads.edit", label: "Edit Leads", description: "Modify lead information" },
          { key: "crm.leads.delete", label: "Delete Leads", description: "Remove leads" },
          { key: "crm.opportunities.view", label: "View Opportunities", description: "View sales opportunities" },
          { key: "crm.opportunities.create", label: "Create Opportunities", description: "Create new opportunities" },
          { key: "crm.opportunities.edit", label: "Edit Opportunities", description: "Modify opportunities" },
          { key: "crm.opportunities.delete", label: "Delete Opportunities", description: "Remove opportunities" },
          { key: "crm.activities.view", label: "View Activities", description: "View CRM activities" },
          { key: "crm.activities.create", label: "Create Activities", description: "Log new activities" },
          { key: "crm.activities.edit", label: "Edit Activities", description: "Modify activities" },
          { key: "crm.activities.delete", label: "Delete Activities", description: "Remove activities" },
        ],
      },
      {
        name: "Sales",
        description: "Quotes, rate tables, and pricing management",
        icon: "💰",
        permissions: [
          { key: "sales.quotes.view", label: "View Quotes", description: "View customer quotes" },
          { key: "sales.quotes.create", label: "Create Quotes", description: "Generate new quotes" },
          { key: "sales.quotes.edit", label: "Edit Quotes", description: "Modify quote details" },
          { key: "sales.quotes.delete", label: "Delete Quotes", description: "Remove quotes" },
          { key: "sales.proposals.view", label: "View Proposals", description: "View sales proposals" },
          { key: "sales.proposals.create", label: "Create Proposals", description: "Create new proposals" },
          { key: "sales.proposals.edit", label: "Edit Proposals", description: "Modify proposals" },
          { key: "sales.proposals.delete", label: "Delete Proposals", description: "Remove proposals" },
          { key: "sales.rates.view", label: "View Rates", description: "View rate tables" },
          { key: "sales.rates.manage", label: "Manage Rates", description: "Edit pricing and rates" },
        ],
      },
      {
        name: "TMS Core",
        description: "Orders, loads, stops, and shipment tracking",
        icon: "🚚",
        permissions: [
          { key: "tms.orders.view", label: "View Orders", description: "View customer orders" },
          { key: "tms.orders.create", label: "Create Orders", description: "Create new orders" },
          { key: "tms.orders.edit", label: "Edit Orders", description: "Modify order details" },
          { key: "tms.orders.delete", label: "Delete Orders", description: "Cancel/remove orders" },
          { key: "tms.loads.view", label: "View Loads", description: "View load details" },
          { key: "tms.loads.create", label: "Create Loads", description: "Create new loads" },
          { key: "tms.loads.edit", label: "Edit Loads", description: "Modify load information" },
          { key: "tms.loads.delete", label: "Delete Loads", description: "Cancel/remove loads" },
          { key: "tms.loads.dispatch", label: "Dispatch Loads", description: "Assign carriers to loads" },
          { key: "tms.tracking.view", label: "View Tracking", description: "View shipment status" },
          { key: "tms.tracking.update", label: "Update Tracking", description: "Update load status" },
          { key: "tms.appointments.view", label: "View Appointments", description: "View pickup/delivery appointments" },
          { key: "tms.appointments.manage", label: "Manage Appointments", description: "Schedule appointments" },
        ],
      },
      {
        name: "Carrier Management",
        description: "Carrier profiles, compliance, and performance scorecards",
        icon: "🔧",
        permissions: [
          { key: "carriers.view", label: "View Carriers", description: "View carrier profiles" },
          { key: "carriers.create", label: "Create Carriers", description: "Onboard new carriers" },
          { key: "carriers.edit", label: "Edit Carriers", description: "Modify carrier information" },
          { key: "carriers.delete", label: "Delete Carriers", description: "Remove carriers" },
          { key: "carriers.search", label: "Search Carriers", description: "Search carrier database" },
          { key: "carriers.compliance.view", label: "View Compliance", description: "View carrier compliance docs" },
          { key: "carriers.compliance.manage", label: "Manage Compliance", description: "Update compliance status" },
          { key: "carriers.scorecards.view", label: "View Scorecards", description: "View performance metrics" },
          { key: "carriers.scorecards.manage", label: "Manage Scorecards", description: "Update performance scores" },
          { key: "carriers.safety.view", label: "View Safety", description: "View safety records" },
          { key: "carriers.safety.manage", label: "Manage Safety", description: "Update safety information" },
        ],
      },
      {
        name: "Accounting",
        description: "Invoicing, payments, and financial settlements",
        icon: "💵",
        permissions: [
          { key: "accounting.invoices.view", label: "View Invoices", description: "View customer invoices" },
          { key: "accounting.invoices.create", label: "Create Invoices", description: "Generate new invoices" },
          { key: "accounting.invoices.edit", label: "Edit Invoices", description: "Modify invoice details" },
          { key: "accounting.invoices.approve", label: "Approve Invoices", description: "Approve for sending" },
          { key: "accounting.payments.view", label: "View Payments", description: "View payment records" },
          { key: "accounting.payments.process", label: "Process Payments", description: "Record payments" },
          { key: "accounting.payables.view", label: "View Payables", description: "View carrier payables" },
          { key: "accounting.payables.process", label: "Process Payables", description: "Pay carrier invoices" },
          { key: "accounting.settlements.view", label: "View Settlements", description: "View settlement reports" },
          { key: "accounting.settlements.manage", label: "Manage Settlements", description: "Process settlements" },
          { key: "accounting.credit.view", label: "View Credit", description: "View credit information" },
          { key: "accounting.credit.manage", label: "Manage Credit", description: "Set credit limits" },
        ],
      },
      {
        name: "Load Board",
        description: "Internal load posting and carrier bidding",
        icon: "📋",
        permissions: [
          { key: "loadboard.view", label: "View Load Board", description: "View available loads" },
          { key: "loadboard.post", label: "Post Loads", description: "Post loads to board" },
          { key: "loadboard.search", label: "Search Loads", description: "Search available loads" },
          { key: "loadboard.manage", label: "Manage Load Board", description: "Full board management" },
          { key: "loadboard.bids.view", label: "View Bids", description: "View carrier bids" },
          { key: "loadboard.bids.accept", label: "Accept Bids", description: "Accept carrier bids" },
        ],
      },
    ],
  },
  {
    name: "Operations Services",
    description: "Day-to-day operational support modules",
    services: [
      {
        name: "Commission",
        description: "Sales commission plans and payout calculations",
        icon: "💸",
        permissions: [
          { key: "commission.view", label: "View Commissions", description: "View commission records" },
          { key: "commission.manage", label: "Manage Commissions", description: "Set commission rules" },
          { key: "commission.statements", label: "Commission Statements", description: "Generate statements" },
        ],
      },
      {
        name: "Claims",
        description: "Cargo claims and OS&D management",
        icon: "⚠️",
        permissions: [
          { key: "claims.view", label: "View Claims", description: "View claim records" },
          { key: "claims.create", label: "Create Claims", description: "File new claims" },
          { key: "claims.edit", label: "Edit Claims", description: "Modify claim details" },
          { key: "claims.manage", label: "Manage Claims", description: "Process and resolve claims" },
        ],
      },
      {
        name: "Documents",
        description: "Document storage, OCR, and template management",
        icon: "📄",
        permissions: [
          { key: "documents.view", label: "View Documents", description: "View stored documents" },
          { key: "documents.upload", label: "Upload Documents", description: "Upload new files" },
          { key: "documents.edit", label: "Edit Documents", description: "Modify document metadata" },
          { key: "documents.delete", label: "Delete Documents", description: "Remove documents" },
          { key: "documents.rate-confirmations", label: "Rate Confirmations", description: "Manage rate confirmations" },
          { key: "documents.pods", label: "Proof of Delivery", description: "Manage POD documents" },
          { key: "documents.templates.view", label: "View Templates", description: "View document templates" },
          { key: "documents.templates.manage", label: "Manage Templates", description: "Edit templates" },
        ],
      },
      {
        name: "Communication",
        description: "Email, SMS, and messaging system",
        icon: "💬",
        permissions: [
          { key: "communication.email", label: "Send Email", description: "Send email messages" },
          { key: "communication.sms", label: "Send SMS", description: "Send text messages" },
          { key: "communication.chat", label: "Use Chat", description: "Internal chat messaging" },
          { key: "communication.templates", label: "Email Templates", description: "Manage email templates" },
        ],
      },
    ],
  },
  {
    name: "Platform Services",
    description: "Infrastructure and cross-cutting concerns",
    services: [
      {
        name: "Analytics",
        description: "KPIs, reports, and business dashboards",
        icon: "📊",
        permissions: [
          { key: "analytics.view", label: "View Analytics", description: "View analytics dashboards" },
          { key: "analytics.reports", label: "Generate Reports", description: "Create custom reports" },
          { key: "analytics.export", label: "Export Data", description: "Export analytics data" },
          { key: "reports.operations", label: "Operations Reports", description: "View ops metrics" },
          { key: "reports.sales", label: "Sales Reports", description: "View sales metrics" },
          { key: "reports.financial", label: "Financial Reports", description: "View financial metrics" },
          { key: "reports.analytics", label: "Advanced Analytics", description: "Advanced reporting" },
        ],
      },
      {
        name: "Workflow",
        description: "Automation rules and workflow triggers",
        icon: "⚙️",
        permissions: [
          { key: "workflow.view", label: "View Workflows", description: "View automation rules" },
          { key: "workflow.create", label: "Create Workflows", description: "Create new automations" },
          { key: "workflow.manage", label: "Manage Workflows", description: "Edit workflow rules" },
        ],
      },
      {
        name: "Integrations",
        description: "API gateway and external system webhooks",
        icon: "🔌",
        permissions: [
          { key: "integrations.view", label: "View Integrations", description: "View connected systems" },
          { key: "integrations.manage", label: "Manage Integrations", description: "Configure integrations" },
        ],
      },
      {
        name: "Audit",
        description: "Compliance audit trails and activity logs",
        icon: "🔍",
        permissions: [
          { key: "audit.view", label: "View Audit Logs", description: "View system audit trail" },
        ],
      },
    ],
  },
];

export default function RoleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(SERVICE_CATEGORIES.map(c => c.name));
  const [expandedServices, setExpandedServices] = useState<string[]>([]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleService = (serviceName: string) => {
    setExpandedServices(prev =>
      prev.includes(serviceName)
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  useEffect(() => {
    if (!isNew) {
      loadRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id, isNew]);

  const loadRole = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ data: Role }>(`/roles/${resolvedParams.id}`);
      const roleData = response.data;
      setRole(roleData);

      form.reset({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load role");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RoleFormValues) => {
    setIsSaving(true);

    try {
      if (isNew) {
        await apiClient.post("/roles", data);
      } else {
        await apiClient.put(`/roles/${resolvedParams.id}`, data);
      }
      router.push("/admin/roles");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    const current = form.getValues("permissions");
    if (current.includes(permission)) {
      form.setValue(
        "permissions",
        current.filter((p) => p !== permission)
      );
    } else {
      form.setValue("permissions", [...current, permission]);
    }
  };

  const selectAllInService = (permissionKeys: string[]) => {
    const current = form.getValues("permissions");
    const allSelected = permissionKeys.every((p) => current.includes(p));

    if (allSelected) {
      form.setValue(
        "permissions",
        current.filter((p) => !permissionKeys.includes(p))
      );
    } else {
      form.setValue(
        "permissions",
        Array.from(new Set([...current, ...permissionKeys]))
      );
    }
  };

  const selectAllInCategory = (services: typeof SERVICE_CATEGORIES[0]['services']) => {
    const allPermissions = services.flatMap(s => s.permissions.map(p => p.key));
    const current = form.getValues("permissions");
    const allSelected = allPermissions.every((p) => current.includes(p));

    if (allSelected) {
      form.setValue(
        "permissions",
        current.filter((p) => !allPermissions.includes(p))
      );
    } else {
      form.setValue(
        "permissions",
        Array.from(new Set([...current, ...allPermissions]))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading role...</div>
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

  if (!isNew && role?.isSystem) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="text-sm text-yellow-800">
            This is a system role and cannot be edited.
          </div>
        </div>
        <div className="mt-4">
          <Link href="/admin/roles">
            <Button variant="outline">Back to roles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/roles">
            <Button variant="ghost" size="sm" className="mb-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              ← Back to Roles
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {isNew ? "Create New Role" : `Edit Role: ${role?.name}`}
          </h1>
          <p className="mt-2 text-slate-600">
            Configure role permissions by selecting services and specific actions
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">Role Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Operations Manager" 
                          {...field}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">Description</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={2}
                          className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          placeholder="Describe the role's responsibilities and access level..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Permissions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-900 mb-1">Service Permissions</h2>
                <p className="text-sm text-slate-600">
                  Select permissions organized by service modules. Click service names to expand.
                </p>
              </div>

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="space-y-4">
                      {SERVICE_CATEGORIES.map((category) => {
                        const selectedPermissions = form.watch("permissions");
                        const allCategoryPermissions = category.services.flatMap(s => s.permissions.map(p => p.key));
                        const allCategorySelected = allCategoryPermissions.every((p) =>
                          selectedPermissions.includes(p)
                        );
                        const isCategoryExpanded = expandedCategories.includes(category.name);

                        return (
                          <div key={category.name} className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* Category Header */}
                            <div className="bg-slate-50 border-b border-slate-200">
                              <div className="flex items-center justify-between p-3">
                                <button
                                  type="button"
                                  onClick={() => toggleCategory(category.name)}
                                  className="flex items-center gap-2 flex-1 text-left"
                                >
                                  <svg
                                    className={`w-4 h-4 text-slate-500 transition-transform ${
                                      isCategoryExpanded ? 'rotate-90' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                      {category.name}
                                    </h3>
                                    <p className="text-xs text-slate-600">{category.description}</p>
                                  </div>
                                </button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => selectAllInCategory(category.services)}
                                  className="text-xs font-medium text-blue-600 border-blue-300 hover:bg-blue-50 px-3 py-1 h-7"
                                >
                                  {allCategorySelected ? "Clear All" : "Select All"}
                                </Button>
                              </div>
                            </div>

                            {/* Services in Category */}
                            {isCategoryExpanded && (
                              <div className="divide-y divide-slate-100">
                                {category.services.map((service) => {
                                  const servicePermissionKeys = service.permissions.map(p => p.key);
                                  const allServiceSelected = servicePermissionKeys.every((p) =>
                                    selectedPermissions.includes(p)
                                  );
                                  const someServiceSelected = servicePermissionKeys.some((p) =>
                                    selectedPermissions.includes(p)
                                  );
                                  const isServiceExpanded = expandedServices.includes(service.name);

                                  return (
                                    <div key={service.name} className="bg-white">
                                      {/* Service Header */}
                                      <div className="flex items-center justify-between p-3 hover:bg-slate-50">
                                        <button
                                          type="button"
                                          onClick={() => toggleService(service.name)}
                                          className="flex items-center gap-2 flex-1 text-left"
                                        >
                                          <svg
                                            className={`w-3 h-3 text-slate-400 transition-transform ${
                                              isServiceExpanded ? 'rotate-90' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                          <span className="text-lg" title={service.name}>
                                            {service.icon}
                                          </span>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-slate-900">
                                                {service.name}
                                              </span>
                                              {someServiceSelected && (
                                                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                                                  {servicePermissionKeys.filter(p => selectedPermissions.includes(p)).length}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-slate-600">{service.description}</p>
                                          </div>
                                        </button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => selectAllInService(servicePermissionKeys)}
                                          className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 h-6"
                                        >
                                          {allServiceSelected ? "Clear" : "All"}
                                        </Button>
                                      </div>

                                      {/* Permissions Grid */}
                                      {isServiceExpanded && (
                                        <div className="px-3 pb-3 pt-1">
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {service.permissions.map((permission) => {
                                              const isChecked = selectedPermissions.includes(permission.key);
                                              
                                              return (
                                                <div
                                                  key={permission.key}
                                                  className={`flex items-start space-x-2 p-2 rounded border transition-all cursor-pointer ${
                                                    isChecked
                                                      ? 'bg-blue-50 border-blue-300'
                                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                                  }`}
                                                  onClick={() => togglePermission(permission.key)}
                                                  title={permission.description}
                                                >
                                                  <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => togglePermission(permission.key)}
                                                    className="mt-0.5"
                                                  />
                                                  <div className="flex-1 min-w-0">
                                                    <label className="text-xs font-medium text-slate-900 cursor-pointer block leading-tight">
                                                      {permission.label}
                                                    </label>
                                                    <p className="text-xs text-slate-500 leading-tight">
                                                      {permission.description}
                                                    </p>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">{form.watch("permissions").length}</span> permissions selected
              </div>
              <div className="flex gap-3">
                <Link href="/admin/roles">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isSaving ? "Saving..." : isNew ? "Create Role" : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
