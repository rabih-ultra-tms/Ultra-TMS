export enum OrderStatus {
    PENDING = 'PENDING',
    QUOTED = 'QUOTED',
    BOOKED = 'BOOKED',
    DISPATCHED = 'DISPATCHED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    INVOICED = 'INVOICED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    ON_HOLD = 'ON_HOLD',
}

export type OrderStopType = 'PICKUP' | 'DELIVERY';

export interface OrderStop {
    id: string;
    stopType: OrderStopType;
    stopSequence: number;
    facilityName?: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    appointmentDate?: string;
    appointmentTimeStart?: string;
    appointmentTimeEnd?: string;
}

export interface OrderLoad {
    id: string;
    loadNumber: string;
    status: string;
}

export interface OrderItem {
    id: string;
    description: string;
    quantity: number;
    weightLbs?: number;
}

export interface OrderCustomer {
    id: string;
    name: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerReference?: string;
    status: OrderStatus;
    specialInstructions?: string;
    stops: OrderStop[];
    loads: OrderLoad[];
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
    // Fields returned by API (Prisma scalar defaults)
    equipmentType?: string;
    customerRate?: number;
    totalCharges?: number;
    commodity?: string;
    weightLbs?: number;
    isHazmat?: boolean;
    isHot?: boolean;
    isExpedited?: boolean;
    orderDate?: string;
    // Included relations
    customer?: OrderCustomer;
    _count?: {
        stops: number;
        loads: number;
    };
}

export interface OrderListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus | 'all';
    customerId?: string;
    fromDate?: string;
    toDate?: string;
}

export interface OrderListResponse {
    data: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// --- Types for Order Detail Page ---

export type EquipmentType =
    | 'DRY_VAN'
    | 'REEFER'
    | 'FLATBED'
    | 'STEP_DECK'
    | 'POWER_ONLY'
    | 'HOTSHOT'
    | 'CONTAINER'
    | 'OTHER';

export type StopStatus = 'PENDING' | 'ARRIVED' | 'DEPARTED' | 'CANCELLED';

export interface Stop {
    id: string;
    tenantId: string;
    orderId?: string;
    loadId?: string;
    stopType: OrderStopType;
    stopSequence: number;
    facilityName?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    appointmentRequired: boolean;
    appointmentDate?: string;
    appointmentTimeStart?: string;
    appointmentTimeEnd?: string;
    scheduledAppointment?: string;
    status: StopStatus;
    arrivedAt?: string;
    departedAt?: string;
    specialInstructions?: string;
    externalId?: string;
    sourceSystem?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TimelineEvent {
    id: string;
    timestamp: string;
    eventType: string;
    description: string;
    userId?: string;
    userName?: string;
    metadata?: Record<string, unknown>;
}

export interface OrderDocument {
    id: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    uploadedById?: string;
    uploadedByName?: string;
    url?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        pages: number;
    };
}

export interface OrderDetailResponse extends Order {
    stops: Stop[];
    loads: OrderLoad[];
    documents?: OrderDocument[];
    timeline?: TimelineEvent[];
    customer?: {
        id: string;
        name: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
    };
    // Financial fields from Prisma model
    customerRate?: number;
    accessorialCharges?: number;
    fuelSurcharge?: number;
    totalCharges?: number;
    currency?: string;
    // Freight details
    commodity?: string;
    commodityClass?: string;
    weightLbs?: number;
    pieceCount?: number;
    palletCount?: number;
    equipmentType?: EquipmentType;
    // Flags
    isHazmat?: boolean;
    hazmatClass?: string;
    temperatureMin?: number;
    temperatureMax?: number;
    isHot?: boolean;
    isTeam?: boolean;
    isExpedited?: boolean;
    // Dates
    orderDate?: string;
    requiredDeliveryDate?: string;
    actualDeliveryDate?: string;
    // Notes
    internalNotes?: string;
    // Metadata
    poNumber?: string;
    bolNumber?: string;
    salesRepId?: string;
    // JSON blob for fields without dedicated DB columns
    customFields?: Record<string, unknown>;
}
