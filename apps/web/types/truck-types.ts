/**
 * Truck Types
 * Equipment types and specifications for load planning
 */

export interface TruckType {
  id: string;
  name: string;
  category: string;
  deckLengthFt: number;
  deckWidthFt: number;
  deckHeightFt: number;
  wellLengthFt?: number;
  maxCargoWeightLbs: number;
  createdAt: string;
  updatedAt: string;
}
