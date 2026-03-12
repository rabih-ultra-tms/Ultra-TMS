'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

const ACTIONS = [
  { label: 'All Actions', value: 'all' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
  { label: 'Login', value: 'LOGIN' },
  { label: 'Logout', value: 'LOGOUT' },
  { label: 'Export', value: 'EXPORT' },
  { label: 'Import', value: 'IMPORT' },
];

const ENTITY_TYPES = [
  { label: 'All Entities', value: 'all' },
  { label: 'User', value: 'User' },
  { label: 'Role', value: 'Role' },
  { label: 'Order', value: 'Order' },
  { label: 'Load', value: 'Load' },
  { label: 'Invoice', value: 'Invoice' },
  { label: 'Carrier', value: 'Carrier' },
  { label: 'Customer', value: 'Company' },
  { label: 'Quote', value: 'Quote' },
  { label: 'Settlement', value: 'Settlement' },
];

interface AuditLogFiltersProps {
  search: string;
  action: string;
  entityType: string;
  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
  onReset: () => void;
}

export function AuditLogFilters({
  search,
  action,
  entityType,
  onSearchChange,
  onActionChange,
  onEntityTypeChange,
  onReset,
}: AuditLogFiltersProps) {
  const hasFilters = search || action !== 'all' || entityType !== 'all';

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by user, description, or IP..."
          className="pl-9 md:w-72"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={action} onValueChange={onActionChange}>
        <SelectTrigger className="md:w-40">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          {ACTIONS.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={entityType} onValueChange={onEntityTypeChange}>
        <SelectTrigger className="md:w-40">
          <SelectValue placeholder="Entity" />
        </SelectTrigger>
        <SelectContent>
          {ENTITY_TYPES.map((e) => (
            <SelectItem key={e.value} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
