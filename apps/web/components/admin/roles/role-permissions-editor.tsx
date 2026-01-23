"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Shield, Users, Building2, DollarSign, Truck, FileText, BarChart3, Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Permission } from "@/lib/types/auth";

interface RolePermissionsEditorProps {
  permissions: Permission[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const moduleIcons: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  roles: <Shield className="h-4 w-4" />,
  tenant: <Building2 className="h-4 w-4" />,
  crm: <Building2 className="h-4 w-4" />,
  sales: <DollarSign className="h-4 w-4" />,
  tms: <Truck className="h-4 w-4" />,
  carriers: <Truck className="h-4 w-4" />,
  accounting: <DollarSign className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  commission: <DollarSign className="h-4 w-4" />,
};

const moduleDisplayNames: Record<string, string> = {
  users: "User Management",
  roles: "Role Management",
  tenant: "Tenant Settings",
  crm: "CRM",
  sales: "Sales & Deals",
  tms: "Transportation (TMS)",
  carriers: "Carrier Management",
  accounting: "Accounting & Finance",
  documents: "Document Management",
  reports: "Reports & Analytics",
  commission: "Commission Management",
};

export function RolePermissionsEditor({
  permissions,
  selectedIds,
  onChange,
}: RolePermissionsEditorProps) {
  const togglePermission = (permissionCode: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, permissionCode]);
    } else {
      onChange(selectedIds.filter((id) => id !== permissionCode));
    }
  };

  const toggleModule = (moduleName: string, checked: boolean) => {
    const modulePerms = permissions
      .filter((p) => (p.group || p.code?.split(".")[0]) === moduleName)
      .map((p) => p.code || p.name);

    if (checked) {
      const newSelected = [...new Set([...selectedIds, ...modulePerms])];
      onChange(newSelected);
    } else {
      onChange(selectedIds.filter((id) => !modulePerms.includes(id)));
    }
  };

  const toggleResource = (moduleName: string, resourceName: string, checked: boolean) => {
    const resourcePerms = permissions
      .filter((p) => {
        const code = p.code || p.name;
        const [service, resource] = code.split(".");
        const group = p.group || service;
        return group === moduleName && (resource || "general") === resourceName;
      })
      .map((p) => p.code || p.name);

    if (checked) {
      const newSelected = [...new Set([...selectedIds, ...resourcePerms])];
      onChange(newSelected);
    } else {
      onChange(selectedIds.filter((id) => !resourcePerms.includes(id)));
    }
  };

  // Group permissions by module
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Record<string, Permission[]>> = {};
    permissions.forEach((permission) => {
      const code = permission.code || permission.name;
      const [serviceFromCode, resourceFromCode, actionFromCode] = code.split(".");
      const service = permission.group || serviceFromCode || "other";
      const resource = resourceFromCode || "general";
      const action = actionFromCode || code;

      if (!groups[service]) {
        groups[service] = {};
      }
      if (!groups[service][resource]) {
        groups[service][resource] = [];
      }

      groups[service][resource].push({
        ...permission,
        name: permission.name || action,
        code,
      });
    });
    return groups;
  }, [permissions]);

  const totalSelected = selectedIds.length;
  const totalPermissions = permissions.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPermissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Available system permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalSelected}</div>
            <p className="text-xs text-muted-foreground mt-1">Permissions granted to this role</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalPermissions > 0 ? Math.round((totalSelected / totalPermissions) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Of all available permissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Permission Groups */}
      <TooltipProvider>
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([moduleName, resourceGroups]) => {
            const modulePermissions = Object.values(resourceGroups).flat();
            const modulePermissionIds = modulePermissions.map((p) => p.code || p.name);
            const allSelected = modulePermissionIds.every((id) => selectedIds.includes(id));
            const someSelected = modulePermissionIds.some((id) => selectedIds.includes(id));
            const selectedCount = modulePermissionIds.filter((id) => selectedIds.includes(id)).length;

            return (
              <Card key={moduleName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-primary/10 p-2">
                        {moduleIcons[moduleName] || <Package className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {moduleDisplayNames[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                        </CardTitle>
                        <CardDescription>
                          {selectedCount} of {modulePermissions.length} permissions selected
                        </CardDescription>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-sm font-medium">Select All</span>
                          <Checkbox
                            checked={allSelected}
                            ref={(el) => {
                              if (el) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (el as any).indeterminate = someSelected && !allSelected;
                              }
                            }}
                            onCheckedChange={(checked) => toggleModule(moduleName, Boolean(checked))}
                          />
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Select or deselect all permissions in {moduleDisplayNames[moduleName] || moduleName}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(resourceGroups).map(([resourceName, resourcePermissions]) => {
                      const resourcePermissionIds = resourcePermissions.map((p) => p.code || p.name);
                      const resourceAllSelected = resourcePermissionIds.every((id) => selectedIds.includes(id));
                      const resourceSomeSelected = resourcePermissionIds.some((id) => selectedIds.includes(id));

                      return (
                        <div key={`${moduleName}-${resourceName}`} className="rounded-md border">
                          <div className="flex items-center justify-between border-b px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">
                                {resourceName === "general"
                                  ? "General"
                                  : resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {resourcePermissions.length} permissions
                              </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-medium">
                              Select All
                              <Checkbox
                                checked={resourceAllSelected}
                                ref={(el) => {
                                  if (el) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (el as any).indeterminate = resourceSomeSelected && !resourceAllSelected;
                                  }
                                }}
                                onCheckedChange={(checked) =>
                                  toggleResource(moduleName, resourceName, Boolean(checked))
                                }
                              />
                            </label>
                          </div>
                          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                            {resourcePermissions.map((permission) => {
                              const permissionId = permission.code || permission.name;
                              return (
                                <Tooltip key={permissionId}>
                                  <TooltipTrigger asChild>
                                    <label className="flex items-start gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
                                      <Checkbox
                                        checked={selectedIds.includes(permissionId)}
                                        onCheckedChange={(value) => togglePermission(permissionId, Boolean(value))}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {permission.name || permission.description || permissionId}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {permission.code || permissionId}
                                        </p>
                                      </div>
                                    </label>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold">
                                        {permission.name || permission.description || permissionId}
                                      </p>
                                      <p className="text-xs opacity-80">
                                        {permission.description || permissionId.replace(/[._]/g, " ")}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Info Note */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">About Permissions</p>
              <p className="text-sm text-blue-700">
                Permissions control what actions users with this role can perform. Select only the permissions needed for this role&apos;s responsibilities. You can use &quot;Select All&quot; for each module to quickly grant all permissions in that area.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
