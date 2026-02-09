/**
 * Design Tokens — Barrel Export
 *
 * Import from "@/lib/design-tokens" for all token constants and types.
 *
 * Usage:
 *   import { LOAD_STATUSES, getStatusClasses, TEXT_PRESETS } from "@/lib/design-tokens";
 */

export {
  LOAD_STATUSES,
  ORDER_STATUSES,
  CARRIER_STATUSES,
  DOCUMENT_STATUSES,
  INSURANCE_STATUSES,
  PRIORITIES,
  getStatusClasses,
  getIntentClasses,
} from "./status";

export type {
  LoadStatus,
  OrderStatus,
  CarrierStatus,
  DocumentStatus,
  InsuranceStatus,
  Priority,
  Intent,
  StatusColorToken,
} from "./status";

export {
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  TEXT_PRESETS,
} from "./typography";
