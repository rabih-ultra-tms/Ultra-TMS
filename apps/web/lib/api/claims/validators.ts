/**
 * Zod validators for claims service inputs
 */

import { z } from 'zod';
import { ClaimType, ClaimStatus } from './types';

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export const createClaimSchema = z.object({
  orderId: z.string().optional(),
  loadId: z.string().optional(),
  companyId: z.string().optional(),
  carrierId: z.string().optional(),
  claimType: z.enum([
    ClaimType.CARGO_DAMAGE,
    ClaimType.CARGO_LOSS,
    ClaimType.SHORTAGE,
    ClaimType.LATE_DELIVERY,
    ClaimType.OVERCHARGE,
    ClaimType.OTHER,
  ] as const),
  description: z.string().min(1),
  incidentDate: z.string().datetime(),
  incidentLocation: z.string().optional(),
  claimedAmount: z.number().min(0),
  claimantName: z.string().min(1),
  claimantCompany: z.string().optional(),
  claimantEmail: z.string().email().optional(),
  claimantPhone: z.string().optional(),
  receivedDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
        totalValue: z.number().min(0).optional(),
        damageType: z.string().optional(),
        damageExtent: z.string().optional(),
      })
    )
    .optional(),
});

export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export const updateClaimSchema = z.object({
  claimType: z
    .enum([
      ClaimType.CARGO_DAMAGE,
      ClaimType.CARGO_LOSS,
      ClaimType.SHORTAGE,
      ClaimType.LATE_DELIVERY,
      ClaimType.OVERCHARGE,
      ClaimType.OTHER,
    ] as const)
    .optional(),
  description: z.string().min(1).optional(),
  incidentDate: z.string().datetime().optional(),
  incidentLocation: z.string().optional(),
  claimedAmount: z.number().min(0).optional(),
  claimantName: z.string().min(1).optional(),
  claimantCompany: z.string().optional(),
  claimantEmail: z.string().email().optional(),
  claimantPhone: z.string().optional(),
  receivedDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateClaimItemInput = z.infer<typeof createClaimItemSchema>;
export const createClaimItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalValue: z.number().min(0).optional(),
  damageType: z.string().optional(),
  damageExtent: z.string().optional(),
});

export type UpdateClaimItemInput = z.infer<typeof updateClaimItemSchema>;
export const updateClaimItemSchema = z.object({
  description: z.string().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  totalValue: z.number().min(0).optional(),
  damageType: z.string().optional(),
  damageExtent: z.string().optional(),
});

export type SettlementInput = z.infer<typeof settlementSchema>;
export const settlementSchema = z.object({
  approvedAmount: z.number().min(0),
  reason: z.string().optional(),
});

export type FileClaimInput = z.infer<typeof fileClaimSchema>;
export const fileClaimSchema = z.object({
  reason: z.string().optional(),
});

export type AssignClaimInput = z.infer<typeof assignClaimSchema>;
export const assignClaimSchema = z.object({
  assignedToId: z.string().min(1),
});

export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
export const updateClaimStatusSchema = z.object({
  status: z.enum([
    ClaimStatus.DRAFT,
    ClaimStatus.SUBMITTED,
    ClaimStatus.UNDER_INVESTIGATION,
    ClaimStatus.PENDING_DOCUMENTATION,
    ClaimStatus.APPROVED,
    ClaimStatus.DENIED,
    ClaimStatus.SETTLED,
    ClaimStatus.CLOSED,
  ] as const),
  reason: z.string().optional(),
});
