import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type PaginatedResponse } from "@/lib/api";
import type { Customer, CustomerListParams } from "@/lib/types/crm";
import { toast } from "sonner";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(params: CustomerListParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Customer>>("/crm/companies", { ...params, companyType: "CUSTOMER" }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Customer }>(`/crm/companies/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Customer>) =>
      apiClient.post<{ data: Customer }>("/crm/companies", { ...data, companyType: "CUSTOMER" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Customer created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      apiClient.patch<{ data: Customer }>(`/crm/companies/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Customer updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/crm/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Customer deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });
}
