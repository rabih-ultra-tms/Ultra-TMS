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

// --- Load Posting types (matches load-postings backend) ---

export type PostingStatus = 'ACTIVE' | 'BOOKED' | 'EXPIRED' | 'CANCELLED';
export type PostingType = 'INTERNAL' | 'EXTERNAL' | 'BOTH';
export type PostingVisibility = 'ALL_CARRIERS' | 'PREFERRED_ONLY' | 'SPECIFIC_CARRIERS';
export type RateType = 'ALL_IN' | 'PER_MILE';
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'WITHDRAWN';

export interface LoadPosting {
    id: string;
    tenantId: string;
    loadId: string;
    postingType: PostingType;
    visibility: PostingVisibility;
    status: PostingStatus;
    showRate: boolean;
    rateType: RateType;
    postedRate?: number;
    rateMin?: number;
    rateMax?: number;
    originCity: string;
    originState: string;
    originZip?: string;
    originLat?: number;
    originLng?: number;
    destCity: string;
    destState: string;
    destZip?: string;
    destLat?: number;
    destLng?: number;
    equipmentType: string;
    weight?: number;
    commodity?: string;
    length?: number;
    pickupDate: string;
    deliveryDate?: string;
    expiresAt?: string;
    autoRefresh: boolean;
    refreshInterval?: number;
    viewCount: number;
    bidCount: number;
    inquiryCount: number;
    load?: {
        id: string;
        loadNumber: string;
        order?: {
            id: string;
            orderNumber: string;
            customer?: { companyName: string };
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface LoadPostingListResponse {
    data: LoadPosting[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LoadPostingSearchFilters {
    originCity?: string;
    originState?: string;
    originRadius?: number;
    destCity?: string;
    destState?: string;
    destRadius?: number;
    equipmentType?: string;
    pickupDateFrom?: string;
    pickupDateTo?: string;
    minRate?: number;
    maxRate?: number;
    status?: PostingStatus;
    page?: number;
    limit?: number;
}

export interface CreateLoadPostingPayload {
    loadId: string;
    postingType: PostingType;
    visibility?: PostingVisibility;
    showRate?: boolean;
    rateType?: RateType;
    postedRate?: number;
    rateMin?: number;
    rateMax?: number;
    expiresAt?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
    carrierIds?: string[];
}

// --- Bid types ---

export interface LoadBid {
    id: string;
    postingId: string;
    loadId: string;
    carrierId: string;
    bidAmount: number;
    rateType: RateType;
    status: BidStatus;
    notes?: string;
    truckNumber?: string;
    driverName?: string;
    driverPhone?: string;
    counterAmount?: number;
    counterNotes?: string;
    expiresAt?: string;
    carrier?: {
        id: string;
        legalName: string;
        companyName: string;
        mcNumber?: string;
        dotNumber?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface LoadBidListResponse {
    data: LoadBid[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// --- Carrier Match types ---

export interface CarrierMatch {
    id: string;
    carrierId: string;
    carrierName: string;
    companyName: string;
    mcNumber?: string;
    dotNumber?: string;
    matchScore: number;
    onTimePercentage?: number;
    claimsRate?: number;
    insuranceStatus: 'valid' | 'expired' | 'pending';
    preferredLanes?: string[];
    equipmentTypes?: string[];
    distance?: number;
}

export interface CarrierMatchListResponse {
    data: CarrierMatch[];
}

// --- Dashboard types ---

export interface LoadBoardDashboardStats {
    activePostings: number;
    pendingBids: number;
    avgTimeToCover: number; // hours
    coverageRate: number; // percentage
}

export interface RecentPosting {
    id: string;
    originCity: string;
    originState: string;
    destCity: string;
    destState: string;
    equipmentType: string;
    postedRate?: number;
    status: PostingStatus;
    bidCount: number;
    createdAt: string;
}
