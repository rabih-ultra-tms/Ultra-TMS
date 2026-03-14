'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum CdlClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

export interface Driver {
  id: string;
  tenantId: string;
  carrierId: string;
  firstName: string;
  lastName: string;
  cdlNumber: string;
  cdlState: string;
  cdlClass: CdlClass;
  cdlExpiration?: string | null;
  phone?: string;
  email?: string;
  status: DriverStatus;
  endorsements?: string[];
  restrictions?: string[];
  medicalCardExpiration?: string | null;
  hireDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateDriverInput {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseState: string;
  cdlClass: CdlClass;
  licenseExpiration?: string;
  phone?: string;
  email?: string;
  endorsements?: string[];
  restrictions?: string[];
  medicalCardExpiration?: string;
  hireDate?: string;
  notes?: string;
}

export interface UpdateDriverInput extends Partial<CreateDriverInput> {
  status?: DriverStatus;
}

export const driverKeys = {
  all: ['drivers'] as const,
  list: (carrierId?: string) =>
    carrierId
      ? [...driverKeys.all, 'list', carrierId]
      : [...driverKeys.all, 'list'],
  detail: (id: string) => [...driverKeys.all, 'detail', id] as const,
};

export function useDrivers(carrierId?: string) {
  return useQuery({
    queryKey: driverKeys.list(carrierId),
    queryFn: async () => {
      const path = carrierId
        ? `/carrier-portal/drivers?carrierId=${carrierId}`
        : '/carrier-portal/drivers';
      const response = await apiClient.get<Driver[]>(path);
      return response;
    },
    staleTime: 30_000,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      const response = await apiClient.post<Driver>(
        '/carrier-portal/drivers',
        input
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(
        `Driver ${data.firstName} ${data.lastName} created successfully`
      );
      queryClient.invalidateQueries({
        queryKey: driverKeys.list(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create driver');
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      input,
    }: {
      driverId: string;
      input: UpdateDriverInput;
    }) => {
      const response = await apiClient.put<Driver>(
        `/carrier-portal/drivers/${driverId}`,
        input
      );
      return response;
    },
    onSuccess: (data) => {
      toast.success(
        `Driver ${data.firstName} ${data.lastName} updated successfully`
      );
      queryClient.invalidateQueries({
        queryKey: driverKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: driverKeys.detail(data.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update driver');
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      await apiClient.delete(`/carrier-portal/drivers/${driverId}`);
    },
    onSuccess: () => {
      toast.success('Driver deleted successfully');
      queryClient.invalidateQueries({
        queryKey: driverKeys.list(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete driver');
    },
  });
}

export function useAssignLoadToDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      loadId,
    }: {
      driverId: string;
      loadId: string;
    }) => {
      const response = await apiClient.post(
        `/carrier-portal/drivers/${driverId}/assign-load/${loadId}`,
        {}
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Load assigned to driver successfully');
      queryClient.invalidateQueries({
        queryKey: driverKeys.list(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign load to driver');
    },
  });
}
