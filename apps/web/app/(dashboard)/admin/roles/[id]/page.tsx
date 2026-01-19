"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import { useCreateRole, useRole, useUpdateRole } from "@/lib/hooks/admin/use-roles";

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
  const roleQuery = useRole(isNew ? "" : resolvedParams.id);
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const role = roleQuery.data?.data ?? null;
  const isLoading = !isNew && roleQuery.isLoading;
  const errorMessage =
    !isNew && roleQuery.error
      ? roleQuery.error instanceof Error
        ? roleQuery.error.message
        : "Failed to load role"
      : null;
  const isSaving = createRoleMutation.isPending || updateRoleMutation.isPending;
  const [expandedCategories, setExpandedCategories] = useState<string[]>(SERVICE_CATEGORIES.map((c) => c.name));
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
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleService = (serviceName: string) => {
    setExpandedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((name) => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const getSelectionState = (keys: string[]) => {
    const selected = form.watch("permissions");
    const selectedCount = keys.filter((k) => selected.includes(k)).length;
    if (selectedCount === 0) return { checked: false as const, selectedCount };
    if (selectedCount === keys.length) return { checked: true as const, selectedCount };
    return { checked: "indeterminate" as const, selectedCount };
  };

  useEffect(() => {
    if (!role) return;
    form.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
  }, [form, role]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      if (isNew) {
        await createRoleMutation.mutateAsync(data);
      } else {
        await updateRoleMutation.mutateAsync({ id: resolvedParams.id, data });
      }
      router.push("/admin/roles");
    } catch {
      // handled by mutation
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

  const selectAllInCategory = (services: typeof SERVICE_CATEGORIES[0]["services"]) => {
    const allPermissions = services.flatMap((s) => s.permissions.map((p) => p.key));
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
    return <LoadingState message="Loading role..." />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        message={errorMessage}
        backButton={
          <Link href="/admin/roles">
            <Button variant="outline">Back to roles</Button>
          </Link>
        }
      />
    );
  }

  if (!isNew && !role) {
    return (
      <EmptyState
        title="Role not found"
        description="We couldn't find the role you're looking for."
        action={
          <Link href="/admin/roles">
            <Button variant="outline">Back to roles</Button>
          </Link>
        }
      />
    );
  }

  if (!isNew && role?.isSystem) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="text-sm text-yellow-800">This is a system role and cannot be edited.</div>
        </div>
        <div className="mt-4">
          <Link href="/admin/roles">
            <Button variant="outline">Back to roles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isNew ? "Create Role" : `Edit Role: ${role?.name}`}</h1>
          <p className="text-sm text-gray-600 mt-1">Configure permissions in a compact tree view.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">Role Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Operations Manager" className="h-9" />
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
                    <FormLabel className="text-xs font-medium text-gray-700">Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        placeholder="Short summary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Permissions</h2>
                <p className="text-xs text-gray-600">Select categories, services, or individual permissions.</p>
              </div>
              <div className="text-xs text-gray-500">{form.watch("permissions").length} selected</div>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {SERVICE_CATEGORIES.map((category) => {
                const categoryKeys = category.services.flatMap((s) => s.permissions.map((p) => p.key));
                const categoryState = getSelectionState(categoryKeys);

                return (
                  <div key={category.name} className="border border-slate-200 rounded-md">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.name)}
                        className="p-1 text-slate-600 hover:text-slate-900"
                        aria-label="Toggle category"
                      >
                        <ChevronRightIcon
                          className={`h-4 w-4 transition-transform ${expandedCategories.includes(category.name) ? "rotate-90" : ""}`}
                        />
                      </button>
                      <Checkbox
                        checked={categoryState.checked}
                        onCheckedChange={() => selectAllInCategory(category.services)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          {category.name}
                          <span className="text-[11px] text-slate-500">{categoryState.selectedCount} / {categoryKeys.length}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{category.description}</p>
                      </div>
                    </div>

                    {expandedCategories.includes(category.name) && (
                      <div className="divide-y divide-slate-200">
                        {category.services.map((service) => {
                          const serviceKeys = service.permissions.map((p) => p.key);
                          const serviceState = getSelectionState(serviceKeys);

                          return (
                            <div key={service.name} className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleService(service.name)}
                                  className="p-1 text-slate-600 hover:text-slate-900"
                                  aria-label="Toggle service"
                                >
                                  <ChevronRightIcon
                                    className={`h-4 w-4 transition-transform ${expandedServices.includes(service.name) ? "rotate-90" : ""}`}
                                  />
                                </button>
                                <Checkbox
                                  checked={serviceState.checked}
                                  onCheckedChange={() => selectAllInService(serviceKeys)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                    {service.icon} {service.name}
                                    <span className="text-[11px] text-slate-500">{serviceState.selectedCount} / {serviceKeys.length}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 truncate">{service.description}</p>
                                </div>
                              </div>

                              {expandedServices.includes(service.name) && (
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1 pl-8">
                                  {service.permissions.map((permission) => {
                                    const isChecked = form.watch("permissions").includes(permission.key);
                                    return (
                                      <label
                                        key={permission.key}
                                        className={`flex items-start gap-2 rounded-md border px-2 py-1 text-xs cursor-pointer ${isChecked ? "bg-blue-50 border-blue-200" : "border-slate-200 hover:bg-slate-50"}`}
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={() => togglePermission(permission.key)}
                                          className="mt-0.5"
                                        />
                                        <div className="leading-tight">
                                          <div className="font-medium text-slate-900">{permission.label}</div>
                                          <p className="text-[11px] text-slate-500">{permission.description}</p>
                                        </div>
                                      </label>
                                    );
                                  })}
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
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-gray-700"
              onClick={() => router.push("/admin/roles")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-blue-600 text-white">
              {isSaving ? "Saving..." : isNew ? "Create Role" : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  if (!isNew) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">{content}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{content}</div>
      </div>
    </div>
  );
}
