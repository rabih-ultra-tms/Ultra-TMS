/**
 * Zod validators for contract service inputs
 */

import { z } from 'zod';
import { ContractType } from './types';

export type CreateContractInput = z.infer<typeof createContractInputSchema>;
export const createContractInputSchema = z.object({
  contractNumber: z.string().min(1),
  contractName: z.string().min(1),
  type: z.enum([
    ContractType.CARRIER,
    ContractType.CUSTOMER,
    ContractType.VENDOR,
  ] as const),
  partyId: z.string().min(1),
  partyName: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  value: z.number().positive(),
  currency: z.string().default('USD'),
  terms: z.string().min(1),
  attachments: z.array(z.string()).optional(),
  externalId: z.string().optional(),
  sourceSystem: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type RateTableInput = z.infer<typeof rateTableInputSchema>;
export const rateTableInputSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  effectiveDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  baseCurrency: z.string().default('USD'),
  description: z.string().optional(),
});

export type RateLaneInput = z.infer<typeof rateLaneInputSchema>;
export const rateLaneInputSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  originZone: z.string().optional(),
  destinationZone: z.string().optional(),
  weight: z.number().positive().optional(),
  distance: z.number().positive().optional(),
  baseRate: z.number().positive(),
  markup: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  minCharge: z.number().nonnegative().optional(),
  effectiveDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
});

export type AmendmentInput = z.infer<typeof amendmentInputSchema>;
export const amendmentInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  effectiveDate: z.string().datetime(),
  changes: z.record(z.string(), z.unknown()),
});

export type SLAInput = z.infer<typeof slaInputSchema>;
export const slaInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  deliveryTime: z.number().positive(),
  pickupTime: z.number().positive(),
  onTimePercentage: z.number().min(0).max(100),
  penalty: z.number().optional(),
  reward: z.number().optional(),
});

export type VolumeCommitmentInput = z.infer<typeof volumeCommitmentInputSchema>;
export const volumeCommitmentInputSchema = z.object({
  commitmentPeriod: z.string().min(1),
  minVolume: z.number().positive(),
  maxVolume: z.number().positive(),
  volumeUnit: z.string().min(1),
  discountPercentage: z.number().min(0).max(100),
  penaltyPercentage: z.number().min(0).max(100).optional(),
});

export type FuelSurchargeTableInput = z.infer<
  typeof fuelSurchargeTableInputSchema
>;
export const fuelSurchargeTableInputSchema = z.object({
  name: z.string().min(1),
  baseFuelPrice: z.number().positive(),
  surchargePercentage: z.number().positive(),
  effectiveDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
});
