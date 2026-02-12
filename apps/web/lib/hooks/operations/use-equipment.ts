import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const EQUIPMENT_KEY = 'equipment';

export interface EquipmentMake {
  id: string;
  name: string;
  popularity_rank?: number;
}

export interface EquipmentModel {
  id: string;
  name: string;
  make_id: string;
  make_name?: string;
  has_dimensions?: boolean;
  has_rates?: boolean;
}

export interface EquipmentDimensions {
  id?: string;
  model_id?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  front_image_url?: string | null;
  side_image_url?: string | null;
}

export const useEquipmentMakes = () => {
  return useQuery({
    queryKey: [EQUIPMENT_KEY, 'makes'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: EquipmentMake[] }>(
        '/operations/equipment/makes'
      );
      return response.data || [];
    },
    retry: false,
  });
};

export const useEquipmentModels = (makeId: string) => {
  return useQuery({
    queryKey: [EQUIPMENT_KEY, 'models', makeId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: EquipmentModel[] }>(
        '/operations/equipment/models',
        { makeId }
      );
      return response.data || [];
    },
    enabled: !!makeId,
    retry: false,
  });
};

export const useEquipmentDimensions = (modelId: string) => {
  return useQuery({
    queryKey: [EQUIPMENT_KEY, 'dimensions', modelId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: EquipmentDimensions | null }>(
        '/operations/equipment/dimensions',
        { modelId }
      );
      return response.data || null;
    },
    enabled: !!modelId,
    retry: false,
  });
};
