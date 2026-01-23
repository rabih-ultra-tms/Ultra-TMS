"use client";

import * as React from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [expandedModules, setExpandedModules] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

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

      groups[service][resource].push({
        ...permission,
        name: permission.name || action,
        code,
      });
    });
    return groups;
  }, [permissions]);

  // Initial expansion
  React.useEffect(() => {
    if (permissions.length > 0 && expandedModules.length === 0) {
      setExpandedModules(Object.keys(groupedPermissions)); 
    }
  }, [permissions, groupedPermissions]);


  const totalSelected = selectedIds.length;
  const totalPermissions = permissions.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn("border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-lg", isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white")}>
          <CardHeader className={cn("pb-4 border-b", isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200")}>
            <CardTitle className={cn("text-base font-semibold", isDark ? "text-gray-100" : "text-gray-900")}>Total Permissions</CardTitle>
          </CardHeader>
          <CardContent className={cn("pt-6", isDark ? "bg-slate-900" : "bg-white")}>
            <div className={cn("text-3xl font-bold", isDark ? "text-gray-100" : "text-gray-900")}>{totalPermissions}</div>
            <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-600")}>Available system permissions</p>
          </CardContent>
        </Card>
        <Card className={cn("border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-lg", isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white")}>
          <CardHeader className={cn("pb-4 border-b", isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200")}>
            <CardTitle className={cn("text-base font-semibold", isDark ? "text-gray-100" : "text-gray-900")}>Selected</CardTitle>
          </CardHeader>
          <CardContent className={cn("pt-6", isDark ? "bg-slate-900" : "bg-white")}>
            <div className={cn("text-3xl font-bold", isDark ? "text-blue-400" : "text-blue-600")}>{totalSelected}</div>
            <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-600")}>Permissions granted to this role</p>
          </CardContent>
        </Card>
        <Card className={cn("border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-lg", isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white")}>
          <CardHeader className={cn("pb-4 border-b", isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200")}>
            <CardTitle className={cn("text-base font-semibold", isDark ? "text-gray-100" : "text-gray-900")}>Coverage</CardTitle>
          </CardHeader>
          <CardContent className={cn("pt-6", isDark ? "bg-slate-900" : "bg-white")}>
            <div className={cn("text-3xl font-bold", isDark ? "text-green-400" : "text-green-600")}>
              {totalPermissions > 0 ? Math.round((totalSelected / totalPermissions) * 100) : 0}%
            </div>
            <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-600")}>Of all available permissions</p>
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
            const isExpanded = expandedModules.includes(moduleName);

            return (
              <Card key={moduleName} className={cn(
                "overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 rounded-lg",
                isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"
              )}>
                <CardHeader className="p-0">
                  <div 
                    className={cn(
                        "flex items-center justify-between p-4 cursor-pointer select-none transition-all duration-200",
                        isExpanded 
                          ? isDark ? "bg-slate-800 border-l-2 border-gray-600" : "bg-gray-100 border-l-2 border-gray-400"
                          : isDark ? "hover:bg-slate-800/50" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1" onClick={() => toggleModuleExpanded(moduleName)}>
                      <div className={cn(
                          "rounded-lg p-2 transition-colors",
                          isExpanded 
                            ? isDark ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-white"
                            : isDark ? "bg-slate-800 text-gray-300" : "bg-gray-100 text-gray-700"
                      )}>
                        {moduleIcons[moduleName] || <Package className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <CardTitle className={cn("text-base font-semibold tracking-tight", isDark ? "text-gray-100" : "text-gray-900")}>
                            {moduleDisplayNames[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                           </CardTitle>
                        </div>
                        <div className={cn("flex items-center gap-2 text-sm mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                            <span className={cn(
                                "font-medium",
                                selectedCount > 0 ? (isDark ? "text-gray-100" : "text-gray-900") : ""
                            )}>
                                {selectedCount} active
                            </span>
                            <span>•</span>
                            <span>{modulePermissions.length} available</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className={cn("h-5 w-5", isDark ? "text-gray-400" : "text-gray-600")} /> : <ChevronRight className={cn("h-5 w-5", isDark ? "text-gray-400" : "text-gray-600")} />}
                    </div>
                  </div>
                </CardHeader>
                
                <div 
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <CardContent className={cn(
                    "overflow-hidden p-0 border-t",
                    isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
                  )}>
                    <div className="space-y-4 p-4">
                      {Object.entries(resourceGroups).map(([resourceName, resourcePermissions]) => {
                        const resourcePermissionIds = resourcePermissions.map((p) => p.code || p.name);
                        const resourceAllSelected = resourcePermissionIds.every((id) => selectedIds.includes(id));
                        const resourceSomeSelected = resourcePermissionIds.some((id) => selectedIds.includes(id));

                        return (
                          <div key={`${moduleName}-${resourceName}`} className="space-y-2">
                            <div className={cn("flex items-center justify-between border-b pb-2.5", isDark ? "border-gray-800" : "border-gray-200")}>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-600")}>
                                  {resourceName === "general" ? "General" : resourceName}
                                </span>
                              </div>
                              <label className={cn("flex items-center gap-1.5 cursor-pointer transition-colors text-base", isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-900")}>
                                <span className="font-medium uppercase">Select All</span>
                                <Checkbox
                                  className="h-6 w-6"
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
                                  <label className={cn(
                                    "flex items-center gap-2 rounded-md p-3 -ml-3 cursor-pointer transition-colors group/item",
                                    isDark 
                                      ? "hover:bg-slate-800 text-gray-300" 
                                      : "hover:bg-gray-100 text-gray-700"
                                  )}>
                                        <Checkbox
                                          id={permissionId}
                                          checked={selectedIds.includes(permissionId)}
                                          onCheckedChange={(value) => togglePermission(permissionId, Boolean(value))}
                                          className={cn("h-6 w-6 flex-shrink-0", isDark ? "border-gray-600" : "border-gray-300")}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className={cn("text-base font-medium leading-relaxed truncate transition-colors", isDark ? "group-hover/item:text-blue-400" : "group-hover/item:text-blue-600")}>
                                            {permission.name || permission.description || permissionId}
                                          </p>
                                          {/* Hide technical code unless hovered or needed, allows for tighter UI */}
                                        </div>
                                      </label>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-sm">
                                      {permission.description ? (
                                        <p className="text-sm leading-relaxed">
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
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">About Permissions</p>
              <p className="text-sm text-blue-700">
                Permissions control what actions users with this role can perform. Control is grouped by Service and Resource.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>{children}</span>
}

