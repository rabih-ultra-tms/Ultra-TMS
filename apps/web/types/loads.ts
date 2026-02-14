export enum LoadStatus {
    PLANNING = 'PLANNING', // Not in backend enum but in status machine description? Backend has PENDING.
    PENDING = 'PENDING',
    TENDERED = 'TENDERED',
    ACCEPTED = 'ACCEPTED',
    DISPATCHED = 'DISPATCHED',
    AT_PICKUP = 'AT_PICKUP',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    AT_DELIVERY = 'AT_DELIVERY',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface Load {
    id: string;
    loadNumber: string;
    status: LoadStatus;
    carrierId?: string;
    driverName?: string;
    driverPhone?: string;
    truckNumber?: string;
    trailerNumber?: string;
    carrierRate?: number;
    equipmentType?: string;
    createdAt: string;
    updatedAt: string;
    // Additional fields for list display & design
    originCity?: string;
    originState?: string;
    destinationCity?: string;
    destinationState?: string;
    pickupDate?: string; // ISO date string
    deliveryDate?: string; // ISO date string
    weight?: number;
    miles?: number;
    customerReference?: string;
    lastLocation?: string;
    lastLocationTime?: string; // ISO date string
    commodity?: string;
    temperature?: number;
    accessorials?: Array<{ type: string; amount: number }>;
    fuelSurcharge?: number;

    order: {
        id: string;
        orderNumber: string;
        customer: {
            id: string;
            name: string;
        };
    };
    carrier?: {
        id: string;
        legalName: string;
        mcNumber: string;
    };
    stops?: Array<{
        id: string;
        orderId: string;
        stopType: 'PICKUP' | 'DELIVERY';
        stopSequence: number;
        facilityName?: string;
        address?: string;
        city: string;
        state: string;
        zip?: string;
        appointmentDate?: string; // ISO
        appointmentTime?: string;
        contactName?: string;
        contactPhone?: string;
        notes?: string;
        status?: string; // PENDING, ARRIVED, COMPLETED
        arrivedAt?: string;
        departedAt?: string;
    }>;
}

export interface LoadListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: LoadStatus | 'all' | LoadStatus[];
    carrierId?: string;
    equipmentType?: string;
    fromDate?: string;
    toDate?: string;
}

export interface LoadListResponse {
    data: Load[];
    total: number;
    page: number;
    limit: number;
}

export interface LoadStats {
    total: number;
    unassigned: number;
    inTransit: number;
    deliveredToday: number;
    avgMargin: number;
    totalActive: number;
}

// --- Types for Load Detail Page ---

export interface CheckCall {
    id: string;
    tenantId: string;
    loadId: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    status?: string;
    notes?: string;
    contacted?: string;
    contactMethod?: string;
    eta?: string;
    milesRemaining?: number;
    source?: string;
    createdAt: string;
    createdById?: string;
}

export interface LoadDetailResponse extends Load {
    orderId: string;
    tenantId: string;
    accessorialCosts?: number;
    fuelAdvance?: number;
    totalCost?: number;
    currentLocationLat?: number;
    currentLocationLng?: number;
    currentCity?: string;
    currentState?: string;
    lastTrackingUpdate?: string;
    eta?: string;
    equipmentLength?: number;
    equipmentWeightLimit?: number;
    dispatchedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    rateConfirmationSent?: boolean;
    rateConfirmationSigned?: boolean;
    dispatchNotes?: string;
    checkCalls?: CheckCall[];
    documents?: Array<{
        id: string;
        documentType: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        uploadedAt: string;
        url?: string;
    }>;
    timeline?: Array<{
        id: string;
        timestamp: string;
        eventType: string;
        description: string;
        userId?: string;
        userName?: string;
    }>;
}
