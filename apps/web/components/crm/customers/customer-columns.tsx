import type { Customer } from "@/lib/types/crm";

export interface CustomerColumn {
  id: keyof Customer | "actions";
  label: string;
}

export const customerColumns: CustomerColumn[] = [
  { id: "code", label: "Code" },
  { id: "name", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "actions", label: "Actions" },
];
