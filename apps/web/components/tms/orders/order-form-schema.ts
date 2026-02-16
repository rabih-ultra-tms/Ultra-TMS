import { z } from "zod";

// --- Equipment Types ---

export const EQUIPMENT_TYPES = [
  "DRY_VAN",
  "REEFER",
  "FLATBED",
  "STEP_DECK",
  "POWER_ONLY",
  "HOTSHOT",
  "CONTAINER",
  "OTHER",
] as const;

export type OrderEquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const EQUIPMENT_TYPE_CONFIG: Record<
  OrderEquipmentType,
  { label: string; icon: string }
> = {
  DRY_VAN: { label: "Dry Van", icon: "Container" },
  REEFER: { label: "Reefer", icon: "Snowflake" },
  FLATBED: { label: "Flatbed", icon: "RectangleHorizontal" },
  STEP_DECK: { label: "Step Deck", icon: "ArrowDownRight" },
  POWER_ONLY: { label: "Power Only", icon: "Zap" },
  HOTSHOT: { label: "Hotshot", icon: "Flame" },
  CONTAINER: { label: "Container", icon: "Package" },
  OTHER: { label: "Other", icon: "MoreHorizontal" },
};

// --- Priority ---

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type OrderPriority = (typeof PRIORITIES)[number];

// --- Hazmat Classes ---

export const HAZMAT_CLASSES = [
  "CLASS_1",
  "CLASS_2",
  "CLASS_3",
  "CLASS_4",
  "CLASS_5",
  "CLASS_6",
  "CLASS_7",
  "CLASS_8",
  "CLASS_9",
] as const;

export const HAZMAT_CLASS_LABELS: Record<string, string> = {
  CLASS_1: "Class 1 - Explosives",
  CLASS_2: "Class 2 - Gases",
  CLASS_3: "Class 3 - Flammable Liquids",
  CLASS_4: "Class 4 - Flammable Solids",
  CLASS_5: "Class 5 - Oxidizers",
  CLASS_6: "Class 6 - Toxic Substances",
  CLASS_7: "Class 7 - Radioactive",
  CLASS_8: "Class 8 - Corrosives",
  CLASS_9: "Class 9 - Miscellaneous",
};

// --- Special Handling Options ---

export const SPECIAL_HANDLING_OPTIONS = [
  { value: "LIFTGATE", label: "Liftgate Required" },
  { value: "INSIDE_DELIVERY", label: "Inside Delivery" },
  { value: "APPOINTMENT", label: "Appointment Required" },
  { value: "DRIVER_ASSIST", label: "Driver Assist" },
  { value: "OVERSIZED", label: "Oversized" },
  { value: "TARP", label: "Tarp Required" },
] as const;

// --- Payment Terms ---

export const PAYMENT_TERMS = [
  "QUICK_PAY",
  "NET_15",
  "NET_30",
  "COD",
  "PREPAID",
] as const;

export const PAYMENT_TERMS_LABELS: Record<string, string> = {
  QUICK_PAY: "Quick Pay",
  NET_15: "Net 15",
  NET_30: "Net 30",
  COD: "COD",
  PREPAID: "Prepaid",
};

// --- Accessorial Types ---

export const ACCESSORIAL_TYPES = [
  "DETENTION",
  "LUMPER",
  "FUEL_SURCHARGE",
  "LIFTGATE",
  "LAYOVER",
  "TONU",
  "ADDITIONAL_STOP",
  "OTHER",
] as const;

export const ACCESSORIAL_TYPE_LABELS: Record<string, string> = {
  DETENTION: "Detention",
  LUMPER: "Lumper",
  FUEL_SURCHARGE: "Fuel Surcharge",
  LIFTGATE: "Liftgate",
  LAYOVER: "Layover",
  TONU: "Truck Order Not Used",
  ADDITIONAL_STOP: "Additional Stop",
  OTHER: "Other",
};

// --- Base Object Schemas (for merging) ---

const customerStepFields = {
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().optional(),
  customerReferenceNumber: z
    .string()
    .max(50, "Max 50 characters")
    .optional()
    .or(z.literal("")),
  poNumber: z
    .string()
    .max(50, "Max 50 characters")
    .optional()
    .or(z.literal("")),
  bolNumber: z
    .string()
    .max(50, "Max 50 characters")
    .optional()
    .or(z.literal("")),
  salesRepId: z.string().optional().or(z.literal("")),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  internalNotes: z
    .string()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal("")),
};

const cargoStepFields = {
  commodity: z.string().min(1, "Commodity is required"),
  weight: z.number().min(1, "Minimum 1 lb").max(80000, "Maximum 80,000 lbs"),
  pieces: z.number().min(1).optional().nullable(),
  pallets: z
    .number()
    .min(0)
    .max(30, "Maximum 30 pallets")
    .optional()
    .nullable(),
  equipmentType: z.enum(EQUIPMENT_TYPES),
  isHazmat: z.boolean().default(false),
  hazmatUnNumber: z.string().optional().or(z.literal("")),
  hazmatClass: z.string().optional().or(z.literal("")),
  hazmatPlacard: z.string().optional().or(z.literal("")),
  tempMin: z.number().optional().nullable(),
  tempMax: z.number().optional().nullable(),
  specialHandling: z.array(z.string()).default([]),
  dimensionLength: z.number().optional().nullable(),
  dimensionWidth: z.number().optional().nullable(),
  dimensionHeight: z.number().optional().nullable(),
};

export const stopFormSchema = z.object({
  id: z.string(),
  type: z.enum(["PICKUP", "DELIVERY", "STOP"]),
  facilityName: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z
    .string()
    .min(1, "State is required")
    .max(2, "Use 2-letter state code"),
  zipCode: z.string().min(1, "ZIP code is required"),
  contactName: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTimeFrom: z.string().min(1, "Start time is required"),
  appointmentTimeTo: z.string().optional().or(z.literal("")),
  weight: z.number().optional().nullable(),
  pieces: z.number().optional().nullable(),
  pallets: z.number().optional().nullable(),
  commodity: z.string().optional().or(z.literal("")),
  instructions: z.string().max(500).optional().or(z.literal("")),
  referenceNumber: z.string().optional().or(z.literal("")),
  sequence: z.number(),
});

const stopsStepFields = {
  stops: z
    .array(stopFormSchema)
    .min(2, "At least pickup and delivery required"),
};

export const accessorialSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Type is required"),
  amount: z.number().min(0, "Amount must be positive"),
  notes: z.string().optional().or(z.literal("")),
});

const rateStepFields = {
  customerRate: z.number().min(0, "Rate must be positive").optional().nullable(),
  fuelSurcharge: z.number().min(0).optional().nullable(),
  accessorials: z.array(accessorialSchema).default([]),
  estimatedCarrierRate: z.number().min(0).optional().nullable(),
  paymentTerms: z.string().min(1, "Payment terms required"),
  billingContactId: z.string().optional().or(z.literal("")),
  billingNotes: z
    .string()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal("")),
};

// --- Step Schemas (with refinements for per-step validation) ---

export const customerStepSchema = z.object(customerStepFields);

export const cargoStepSchema = z
  .object(cargoStepFields)
  .superRefine((data, ctx) => {
    if (data.isHazmat) {
      if (!data.hazmatUnNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "UN Number required for hazmat",
          path: ["hazmatUnNumber"],
        });
      }
      if (!data.hazmatClass) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hazmat class is required",
          path: ["hazmatClass"],
        });
      }
      if (!data.hazmatPlacard) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Placard type is required",
          path: ["hazmatPlacard"],
        });
      }
    }
    if (data.equipmentType === "REEFER") {
      if (data.tempMin == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Min temperature required for reefer",
          path: ["tempMin"],
        });
      }
      if (data.tempMax == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Max temperature required for reefer",
          path: ["tempMax"],
        });
      }
      if (
        data.tempMin != null &&
        data.tempMax != null &&
        data.tempMin > data.tempMax
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Min temp must be less than max temp",
          path: ["tempMin"],
        });
      }
    }
  });

export const stopsStepSchema = z
  .object(stopsStepFields)
  .superRefine((data, ctx) => {
    const hasPickup = data.stops.some(
      (s: StopFormValues) => s.type === "PICKUP"
    );
    const hasDelivery = data.stops.some(
      (s: StopFormValues) => s.type === "DELIVERY"
    );
    if (!hasPickup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one pickup stop is required",
        path: ["stops"],
      });
    }
    if (!hasDelivery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one delivery stop is required",
        path: ["stops"],
      });
    }
  });

export const rateStepSchema = z.object(rateStepFields);

// --- Combined Order Form Schema (flat merge, no superRefine) ---

export const orderFormSchema = z.object({
  ...customerStepFields,
  ...cargoStepFields,
  ...stopsStepFields,
  ...rateStepFields,
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
export type CustomerStepValues = z.infer<typeof customerStepSchema>;
export type CargoStepValues = z.infer<typeof cargoStepSchema>;
export type StopFormValues = z.infer<typeof stopFormSchema>;
export type StopsStepValues = z.infer<typeof stopsStepSchema>;
export type RateStepValues = z.infer<typeof rateStepSchema>;
export type AccessorialValues = z.infer<typeof accessorialSchema>;

// --- Default Values ---

export function createDefaultStop(
  type: "PICKUP" | "DELIVERY" | "STOP",
  sequence: number
): StopFormValues {
  return {
    id: crypto.randomUUID(),
    type,
    facilityName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    contactName: "",
    contactPhone: "",
    appointmentDate: "",
    appointmentTimeFrom: "",
    appointmentTimeTo: "",
    weight: null,
    pieces: null,
    pallets: null,
    commodity: "",
    instructions: "",
    referenceNumber: "",
    sequence,
  };
}

export const ORDER_FORM_DEFAULTS: OrderFormValues = {
  // Step 1
  customerId: "",
  customerName: "",
  customerReferenceNumber: "",
  poNumber: "",
  bolNumber: "",
  salesRepId: "",
  priority: "MEDIUM",
  internalNotes: "",
  // Step 2
  commodity: "",
  weight: 0,
  pieces: null,
  pallets: null,
  equipmentType: "DRY_VAN",
  isHazmat: false,
  hazmatUnNumber: "",
  hazmatClass: "",
  hazmatPlacard: "",
  tempMin: null,
  tempMax: null,
  specialHandling: [],
  dimensionLength: null,
  dimensionWidth: null,
  dimensionHeight: null,
  // Step 3
  stops: [createDefaultStop("PICKUP", 0), createDefaultStop("DELIVERY", 1)],
  // Step 4
  customerRate: null,
  fuelSurcharge: null,
  accessorials: [],
  estimatedCarrierRate: null,
  paymentTerms: "NET_30",
  billingContactId: "",
  billingNotes: "",
};

// --- Step field lists for partial validation ---

export const STEP_FIELDS: (keyof OrderFormValues)[][] = [
  // Step 1: Customer & Reference
  [
    "customerId",
    "customerName",
    "customerReferenceNumber",
    "poNumber",
    "bolNumber",
    "salesRepId",
    "priority",
    "internalNotes",
  ],
  // Step 2: Cargo Details
  [
    "commodity",
    "weight",
    "pieces",
    "pallets",
    "equipmentType",
    "isHazmat",
    "hazmatUnNumber",
    "hazmatClass",
    "hazmatPlacard",
    "tempMin",
    "tempMax",
    "specialHandling",
    "dimensionLength",
    "dimensionWidth",
    "dimensionHeight",
  ],
  // Step 3: Stops
  ["stops"],
  // Step 4: Rate & Billing
  [
    "customerRate",
    "fuelSurcharge",
    "accessorials",
    "estimatedCarrierRate",
    "paymentTerms",
    "billingContactId",
    "billingNotes",
  ],
  // Step 5: Review (no fields)
  [],
];
