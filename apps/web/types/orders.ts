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
    _count?: {
        stops: number;
        loads: number;
        items: number;
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
