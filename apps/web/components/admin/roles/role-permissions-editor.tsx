"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Shield, Users, Building2, DollarSign, Truck, FileText, BarChart3, Package, ChevronDown, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Permission } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

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
  const [expandedModules, setExpandedModules] = React.useState<string[]>([]);

  const toggleModuleExpanded = (moduleName: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(m => m !== moduleName) 
        : [...prev, moduleName]
    );
  };

  const togglePermission = (permissionCode: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, permissionCode]);
    } else {
      onChange(selectedIds.filter((id) => id !== permissionCode));
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
    const commonVerbs = ["view", "create", "edit", "update", "delete", "remove", "invite", "manage", "list", "export", "import"];

    permissions.forEach((permission) => {
      const code = permission.code || permission.name;
      const parts = code.split(".");
      const serviceFromCode = parts[0];
      const resourceFromCode = parts[1];
      const actionFromCode = parts[2];

      const service = permission.group || serviceFromCode || "other";
      
      // Determine resource grouping
      // If the second part is a common verb and there's no third part, treat it as a Service-level action (group under 'General' or similar)
      let resource = resourceFromCode || "general";
      if (!actionFromCode && resourceFromCode && commonVerbs.includes(resourceFromCode.toLowerCase())) {
        resource = "general";
      }

      const action = actionFromCode || code;

      if (!groups[service]) {
        groups[service] = {};
      }
      if (!groups[service][resource]) {
        groups[service][resource] = [];
      }

      const resourceArray = groups[service][resource];
      if (resourceArray) {
        resourceArray.push({
          ...permission,
          name: permission.name || action,
          code,
        });
      }
    });
    return groups;
  }, [permissions]);

  // Initial expansion
  React.useEffect(() => {
    if (permissions.length > 0 && expandedModules.length === 0) {
      setExpandedModules(Object.keys(groupedPermissions)); 
    }
  }, [permissions, groupedPermissions, expandedModules.length]);


  const totalSelected = selectedIds.length;
  const totalPermissions = permissions.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPermissions}</div>
            <p className="text-sm text-muted-foreground mt-2">Available system permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalSelected}</div>
            <p className="text-sm text-muted-foreground mt-2">Permissions granted to this role</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {totalPermissions > 0 ? Math.round((totalSelected / totalPermissions) * 100) : 0}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">Of all available permissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Permission Groups */}
      <TooltipProvider>
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([moduleName, resourceGroups]) => {
            const modulePermissions = Object.values(resourceGroups).flat();
            const modulePermissionIds = modulePermissions.map((p) => p.code || p.name);
            const selectedCount = modulePermissionIds.filter((id) => selectedIds.includes(id)).length;
            const isExpanded = expandedModules.includes(moduleName);

            return (
              <Card key={moduleName} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div 
                    className={cn(
                        "flex items-center justify-between p-4 cursor-pointer select-none hover:bg-accent/50",
                        isExpanded && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1" onClick={() => toggleModuleExpanded(moduleName)}>
                      <div className={cn(
                          "rounded-lg p-2",
                          isExpanded ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {moduleIcons[moduleName] || <Package className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <CardTitle className="text-base">
                            {moduleDisplayNames[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                           </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className={cn(
                                "font-medium",
                                selectedCount > 0 && "text-foreground"
                            )}>
                                {selectedCount} active
                            </span>
                            <span>•</span>
                            <span>{modulePermissions.length} available</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </div>
                </CardHeader>
                
                <div 
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <CardContent className="overflow-hidden p-0 border-t">
                    <div className="space-y-4 p-4">
                      {Object.entries(resourceGroups).map(([resourceName, resourcePermissions]) => {
                        const resourcePermissionIds = resourcePermissions.map((p) => p.code || p.name);
                        const resourceAllSelected = resourcePermissionIds.every((id) => selectedIds.includes(id));
                        const resourceSomeSelected = resourcePermissionIds.some((id) => selectedIds.includes(id));

                        return (
                          <div key={`${moduleName}-${resourceName}`} className="space-y-2">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                  {resourceName === "general" ? "General" : resourceName}
                                </span>
                              </div>
                              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <span className="font-medium uppercase">Select All</span>
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
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {resourcePermissions.map((permission) => {
                                const permissionId = permission.code || permission.name;
                                return (
                                  <Tooltip key={permissionId}>
                                    <TooltipTrigger asChild>
                                      <label className="flex items-center gap-2 rounded-md p-2 cursor-pointer hover:bg-accent">
                                        <Checkbox
                                          id={permissionId}
                                          checked={selectedIds.includes(permissionId)}
                                          onCheckedChange={(value) => togglePermission(permissionId, Boolean(value))}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {permission.name || permission.description || permissionId}
                                          </p>
                                        </div>
                                      </label>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-sm">
                                      {permission.description ? (
                                        <p className="text-sm">
                                          {permission.description}
                                        </p>
                                      ) : (
                                        <p className="text-sm">
                                          This permission allows users to {permission.name ? permission.name.split('.').pop()?.toLowerCase() : 'perform this action'} in the system.
                                        </p>
                                      )}
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
                </div>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Info Note */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">About Permissions</p>
              <p className="text-sm text-muted-foreground">
                Permissions control what actions users with this role can perform. Control is grouped by Service and Resource.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


