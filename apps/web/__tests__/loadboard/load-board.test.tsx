import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

import { LbDashboardStats } from "@/components/load-board/lb-dashboard-stats";
import { LbRecentPostings } from "@/components/load-board/lb-recent-postings";
import { PostingDetailCard } from "@/components/load-board/posting-detail-card";
import { BidsList } from "@/components/load-board/bids-list";
import { CarrierMatchesPanel } from "@/components/load-board/carrier-matches-panel";
import { CarrierMatchCard } from "@/components/load-board/carrier-match-card";
import { LoadSearchResults } from "@/components/load-board/load-search-results";
import { BidCounterDialog } from "@/components/load-board/bid-counter-dialog";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockDashboardStats = {
    activePostings: 12,
    pendingBids: 5,
    avgTimeToCover: 6.2,
    coverageRate: 78,
};

const mockRecentPostings = [
    {
        id: "p1",
        originCity: "Chicago",
        originState: "IL",
        destCity: "New York",
        destState: "NY",
        equipmentType: "Dry Van",
        postedRate: 2500,
        status: "ACTIVE" as const,
        bidCount: 3,
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
        id: "p2",
        originCity: "Los Angeles",
        originState: "CA",
        destCity: "Dallas",
        destState: "TX",
        equipmentType: "Flatbed",
        postedRate: 3200,
        status: "BOOKED" as const,
        bidCount: 7,
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    },
];

const mockPosting = {
    id: "p1",
    tenantId: "t1",
    loadId: "l1",
    postingType: "BOTH" as const,
    visibility: "ALL_CARRIERS" as const,
    status: "ACTIVE" as const,
    showRate: true,
    rateType: "ALL_IN" as const,
    postedRate: 2500,
    originCity: "Chicago",
    originState: "IL",
    destCity: "New York",
    destState: "NY",
    equipmentType: "Dry Van",
    weight: 40000,
    commodity: "General freight",
    pickupDate: "2026-03-01",
    deliveryDate: "2026-03-03",
    autoRefresh: false,
    viewCount: 24,
    bidCount: 3,
    inquiryCount: 1,
    load: {
        id: "l1",
        loadNumber: "LD-001",
        order: {
            id: "o1",
            orderNumber: "ORD-001",
            customer: { companyName: "Acme Corp" },
        },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const mockBids = [
    {
        id: "b1",
        postingId: "p1",
        loadId: "l1",
        carrierId: "c1",
        bidAmount: 2400,
        rateType: "ALL_IN" as const,
        status: "PENDING" as const,
        notes: "Can pick up same day",
        truckNumber: "TK-123",
        driverName: "John Smith",
        driverPhone: "555-0100",
        carrier: {
            id: "c1",
            legalName: "Fast Freight LLC",
            companyName: "Fast Freight",
            mcNumber: "MC123456",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "b2",
        postingId: "p1",
        loadId: "l1",
        carrierId: "c2",
        bidAmount: 2600,
        rateType: "ALL_IN" as const,
        status: "REJECTED" as const,
        carrier: {
            id: "c2",
            legalName: "Quick Haul Inc",
            companyName: "Quick Haul",
            mcNumber: "MC789012",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const mockMatches = [
    {
        id: "m1",
        carrierId: "c3",
        carrierName: "Premier Trucking",
        companyName: "Premier Trucking",
        mcNumber: "MC555111",
        matchScore: 92,
        onTimePercentage: 97,
        claimsRate: 0.5,
        insuranceStatus: "valid" as const,
    },
    {
        id: "m2",
        carrierId: "c4",
        carrierName: "Budget Freight",
        companyName: "Budget Freight",
        mcNumber: "MC555222",
        matchScore: 71,
        onTimePercentage: 85,
        claimsRate: 2.1,
        insuranceStatus: "expired" as const,
    },
];

// ===================== LB-001: Dashboard Stats =====================

describe("LB-001: LbDashboardStats", () => {
    it("renders 4 KPI cards with correct values", () => {
        render(<LbDashboardStats stats={mockDashboardStats} isLoading={false} />);
        expect(screen.getByText("Active Postings")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("Pending Bids")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("Avg Time to Cover")).toBeInTheDocument();
        expect(screen.getByText("6.2h")).toBeInTheDocument();
        expect(screen.getByText("Coverage Rate")).toBeInTheDocument();
        expect(screen.getByText("78%")).toBeInTheDocument();
    });

    it("shows loading skeletons", () => {
        const { container } = render(<LbDashboardStats stats={undefined} isLoading={true} />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows fallback values when stats undefined", () => {
        render(<LbDashboardStats stats={undefined} isLoading={false} />);
        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBe(2);
        const dashes = screen.getAllByText("—");
        expect(dashes.length).toBe(2);
    });
});

// ===================== LB-001: Recent Postings =====================

describe("LB-001: LbRecentPostings", () => {
    it("renders posting list with routes and status", () => {
        render(<LbRecentPostings postings={mockRecentPostings} isLoading={false} />);
        expect(screen.getByText("Recent Postings")).toBeInTheDocument();
        expect(screen.getByText(/Chicago/)).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
        expect(screen.getByText("Booked")).toBeInTheDocument();
    });

    it("renders links to posting detail", () => {
        render(<LbRecentPostings postings={mockRecentPostings} isLoading={false} />);
        const links = screen.getAllByRole("link");
        expect(links[0]).toHaveAttribute("href", "/load-board/postings/p1");
    });

    it("shows empty state", () => {
        render(<LbRecentPostings postings={[]} isLoading={false} />);
        expect(screen.getByText(/No active postings/)).toBeInTheDocument();
    });

    it("formats rate as currency", () => {
        render(<LbRecentPostings postings={mockRecentPostings} isLoading={false} />);
        expect(screen.getByText("$2,500")).toBeInTheDocument();
        expect(screen.getByText("$3,200")).toBeInTheDocument();
    });

    it("shows bid count per posting", () => {
        render(<LbRecentPostings postings={mockRecentPostings} isLoading={false} />);
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
    });
});

// ===================== LB-003: Search Results =====================

describe("LB-003: LoadSearchResults", () => {
    it("renders results with details", () => {
        render(<LoadSearchResults postings={[mockPosting]} isLoading={false} isError={false} />);
        expect(screen.getByText(/Chicago/)).toBeInTheDocument();
        expect(screen.getByText("Dry Van")).toBeInTheDocument();
        expect(screen.getByText("$2,500")).toBeInTheDocument();
    });

    it("shows empty state", () => {
        render(<LoadSearchResults postings={[]} isLoading={false} isError={false} />);
        expect(screen.getByText(/No loads match/)).toBeInTheDocument();
    });

    it("shows error state", () => {
        render(<LoadSearchResults postings={undefined} isLoading={false} isError={true} onRetry={jest.fn()} />);
        expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });

    it("shows result count", () => {
        render(<LoadSearchResults postings={[mockPosting]} isLoading={false} isError={false} />);
        expect(screen.getByText("1 result found")).toBeInTheDocument();
    });

    it("links to posting detail", () => {
        render(<LoadSearchResults postings={[mockPosting]} isLoading={false} isError={false} />);
        expect(screen.getByRole("link")).toHaveAttribute("href", "/load-board/postings/p1");
    });
});

// ===================== LB-004: Posting Detail Card =====================

describe("LB-004: PostingDetailCard", () => {
    it("renders posting detail with all fields", () => {
        render(<PostingDetailCard posting={mockPosting} isLoading={false} />);
        expect(screen.getByText("Posting Detail")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
        expect(screen.getByText(/Chicago/)).toBeInTheDocument();
        expect(screen.getByText("Dry Van")).toBeInTheDocument();
        expect(screen.getByText("40,000 lbs")).toBeInTheDocument();
        expect(screen.getByText("General freight")).toBeInTheDocument();
        expect(screen.getByText("$2,500")).toBeInTheDocument();
    });

    it("shows load number and customer", () => {
        render(<PostingDetailCard posting={mockPosting} isLoading={false} />);
        expect(screen.getByText(/LD-001/)).toBeInTheDocument();
        expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    });

    it("shows view and bid counts", () => {
        render(<PostingDetailCard posting={mockPosting} isLoading={false} />);
        expect(screen.getByText("24")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });
});

// ===================== LB-004: Bids List =====================

describe("LB-004: BidsList", () => {
    const defaultProps = {
        bids: mockBids,
        isLoading: false,
        postingStatus: "ACTIVE",
        onAccept: jest.fn(),
        onReject: jest.fn(),
        onCounter: jest.fn(),
        isAccepting: false,
        isRejecting: false,
        isCountering: false,
    };

    it("renders bids with carrier names and amounts", () => {
        render(<BidsList {...defaultProps} />);
        expect(screen.getByText("Bids (2)")).toBeInTheDocument();
        expect(screen.getByText("Fast Freight")).toBeInTheDocument();
        expect(screen.getByText("$2,400")).toBeInTheDocument();
        expect(screen.getByText("Quick Haul")).toBeInTheDocument();
        expect(screen.getByText("$2,600")).toBeInTheDocument();
    });

    it("shows MC number", () => {
        render(<BidsList {...defaultProps} />);
        expect(screen.getByText("MC#MC123456")).toBeInTheDocument();
    });

    it("shows driver info", () => {
        render(<BidsList {...defaultProps} />);
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(screen.getByText("TK-123")).toBeInTheDocument();
    });

    it("shows actions for PENDING bids on ACTIVE posting", () => {
        render(<BidsList {...defaultProps} />);
        expect(screen.getByText("Accept")).toBeInTheDocument();
        expect(screen.getByText("Counter")).toBeInTheDocument();
        expect(screen.getByText("Reject")).toBeInTheDocument();
    });

    it("hides actions when posting not ACTIVE", () => {
        render(<BidsList {...defaultProps} postingStatus="BOOKED" />);
        expect(screen.queryByText("Accept")).not.toBeInTheDocument();
    });

    it("shows status badges", () => {
        render(<BidsList {...defaultProps} />);
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("shows empty state", () => {
        render(<BidsList {...defaultProps} bids={[]} />);
        expect(screen.getByText(/No bids received/)).toBeInTheDocument();
    });

    it("shows bid notes", () => {
        render(<BidsList {...defaultProps} />);
        expect(screen.getByText("Can pick up same day")).toBeInTheDocument();
    });
});

// ===================== LB-004: Bid Counter Dialog =====================

describe("LB-004: BidCounterDialog", () => {
    it("renders fields", () => {
        render(<BidCounterDialog open={true} onOpenChange={jest.fn()} onSubmit={jest.fn()} isPending={false} />);
        expect(screen.getByText("Counter Offer")).toBeInTheDocument();
        expect(screen.getByLabelText("Counter Amount ($)")).toBeInTheDocument();
    });

    it("submit disabled when empty", () => {
        render(<BidCounterDialog open={true} onOpenChange={jest.fn()} onSubmit={jest.fn()} isPending={false} />);
        expect(screen.getByText("Send Counter Offer")).toBeDisabled();
    });

    it("shows pending state", () => {
        render(<BidCounterDialog open={true} onOpenChange={jest.fn()} onSubmit={jest.fn()} isPending={true} />);
        expect(screen.getByText("Sending...")).toBeInTheDocument();
    });
});

// ===================== LB-005: Carrier Matches Panel =====================

describe("LB-005: CarrierMatchesPanel", () => {
    it("renders matches sorted by score", () => {
        render(<CarrierMatchesPanel matches={mockMatches} isLoading={false} onTender={jest.fn()} isTendering={false} />);
        expect(screen.getByText("Suggested Carriers (2)")).toBeInTheDocument();
        expect(screen.getByText("Premier Trucking")).toBeInTheDocument();
    });

    it("shows empty state", () => {
        render(<CarrierMatchesPanel matches={[]} isLoading={false} onTender={jest.fn()} isTendering={false} />);
        expect(screen.getByText(/No carrier matches/)).toBeInTheDocument();
    });
});

// ===================== LB-005: Carrier Match Card =====================

describe("LB-005: CarrierMatchCard", () => {
    it("renders match with score and metrics", () => {
        render(<CarrierMatchCard match={mockMatches[0]!} onTender={jest.fn()} isTendering={false} />);
        expect(screen.getByText("Premier Trucking")).toBeInTheDocument();
        expect(screen.getByText("MC#MC555111")).toBeInTheDocument();
        expect(screen.getByText("92")).toBeInTheDocument();
        expect(screen.getByText("97% on-time")).toBeInTheDocument();
        expect(screen.getByText("0.5% claims")).toBeInTheDocument();
        expect(screen.getByText("Insured")).toBeInTheDocument();
    });

    it("calls onTender", async () => {
        const user = userEvent.setup();
        const onTender = jest.fn();
        render(<CarrierMatchCard match={mockMatches[0]!} onTender={onTender} isTendering={false} />);
        await user.click(screen.getByText("Tender"));
        expect(onTender).toHaveBeenCalledTimes(1);
    });

    it("disables when tendering", () => {
        render(<CarrierMatchCard match={mockMatches[0]!} onTender={jest.fn()} isTendering={true} />);
        expect(screen.getByText("Tender").closest("button")).toBeDisabled();
    });

    it("shows expired insurance", () => {
        render(<CarrierMatchCard match={mockMatches[1]!} onTender={jest.fn()} isTendering={false} />);
        expect(screen.getByText("Expired")).toBeInTheDocument();
    });
});
