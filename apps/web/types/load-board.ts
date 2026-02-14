// Load Board posting status (matches Prisma LoadPostStatus enum)
export type LoadPostStatus = 'DRAFT' | 'POSTED' | 'RESPONDED' | 'COVERED' | 'EXPIRED' | 'CANCELLED';

export interface LoadPost {
    id: string;
    tenantId: string;
    accountId: string;
    loadId?: string;
    orderId?: string;
    postNumber: string;
    externalPostId?: string;
    status: LoadPostStatus;
    originCity: string;
    originState: string;
    originZip?: string;
    destCity: string;
    destState: string;
    destZip?: string;
    pickupDate: string;
    deliveryDate?: string;
    equipmentType: string;
    length?: number;
    weight?: number;
    commodity?: string;
    postedRate: number;
    currency: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    postedAt?: string;
    expiresAt?: string;
    removedAt?: string;
    views: number;
    clicks: number;
    leadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface LoadBoardFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: LoadPostStatus | 'all';
    equipmentType?: string[];
    originState?: string;
    destState?: string;
    pickupDateFrom?: string;
    pickupDateTo?: string;
    minRate?: number;
    maxRate?: number;
}

export interface LoadBoardListResponse {
    data: LoadPost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface LoadBoardStats {
    activePostings: number;
    totalResponses: number;
    coveredToday: number;
    avgTimeToFill: number; // in hours
    avgPostedRate: number;
}
