import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

import { CommissionDashboardStats } from "@/components/commissions/commission-dashboard-stats";
import { CommissionPlanCard } from "@/components/commissions/commission-plan-card";
import { TierEditor } from "@/components/commissions/tier-editor";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCommissionDashboard = {
    pendingTotal: 12500,
    paidMTD: 8900,
    paidYTD: 98000,
    avgCommissionRate: 11.5,
    topReps: [
        { id: "r1", name: "John Doe", email: "john@acme.com", pendingAmount: 3500, paidMTD: 2800, paidYTD: 32000, loadCount: 45 },
        { id: "r2", name: "Jane Smith", email: "jane@acme.com", pendingAmount: 2100, paidMTD: 1900, paidYTD: 28000, loadCount: 38 },
    ],
    pendingChange: 4.2,
    paidMTDChange: -1.5,
    paidYTDChange: 12.0,
};

const mockPercentagePlan = {
    id: "plan-1",
    name: "Standard Commission",
    planType: "PERCENT_MARGIN" as const,
    description: "Standard percentage-based plan",
    percentRate: 10,
    flatAmount: null,
    tiers: [],
    status: "ACTIVE",
    isDefault: true,
    effectiveDate: new Date().toISOString(),
    endDate: null,
    _count: { assignments: 5, entries: 20 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const mockTieredPlan = {
    id: "plan-2",
    name: "Tiered Growth Plan",
    planType: "TIERED" as const,
    description: "Higher margins earn higher rates",
    percentRate: null,
    flatAmount: null,
    tiers: [
        { id: "t1", tierNumber: 1, tierName: null, thresholdType: "MARGIN", thresholdMin: 0, thresholdMax: 12, rateType: "PERCENT", rateAmount: 8, periodType: null },
        { id: "t2", tierNumber: 2, tierName: null, thresholdType: "MARGIN", thresholdMin: 12, thresholdMax: 18, rateType: "PERCENT", rateAmount: 10, periodType: null },
        { id: "t3", tierNumber: 3, tierName: null, thresholdType: "MARGIN", thresholdMin: 18, thresholdMax: 25, rateType: "PERCENT", rateAmount: 12, periodType: null },
        { id: "t4", tierNumber: 4, tierName: null, thresholdType: "MARGIN", thresholdMin: 25, thresholdMax: null, rateType: "PERCENT", rateAmount: 15, periodType: null },
    ],
    status: "ACTIVE",
    isDefault: false,
    effectiveDate: new Date().toISOString(),
    endDate: null,
    _count: { assignments: 3, entries: 15 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const mockFlatPlan = {
    id: "plan-3",
    name: "Flat Fee Plan",
    planType: "FLAT_FEE" as const,
    description: null,
    percentRate: null,
    flatAmount: 150,
    tiers: [],
    status: "INACTIVE",
    isDefault: false,
    effectiveDate: new Date().toISOString(),
    endDate: null,
    _count: { assignments: 0, entries: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// ===================== COM-001: Commission Dashboard Stats =====================

describe("COM-001: CommissionDashboardStats", () => {
    it("renders 4 KPI cards with correct values", () => {
        render(<CommissionDashboardStats data={mockCommissionDashboard} isLoading={false} />);
        expect(screen.getByText("Pending Commission")).toBeInTheDocument();
        expect(screen.getByText("$12,500")).toBeInTheDocument();
        expect(screen.getByText("Paid This Month")).toBeInTheDocument();
        expect(screen.getByText("$8,900")).toBeInTheDocument();
        expect(screen.getByText("Paid This Year")).toBeInTheDocument();
        expect(screen.getByText("$98,000")).toBeInTheDocument();
        expect(screen.getByText("Avg Commission Rate")).toBeInTheDocument();
        expect(screen.getByText("11.5%")).toBeInTheDocument();
    });

    it("shows loading skeletons", () => {
        const { container } = render(<CommissionDashboardStats data={undefined} isLoading={true} />);
        const skeletons = container.querySelectorAll(".animate-pulse");
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows zero values when data undefined", () => {
        render(<CommissionDashboardStats data={undefined} isLoading={false} />);
        const zeros = screen.getAllByText("$0");
        expect(zeros.length).toBeGreaterThanOrEqual(3);
        expect(screen.getByText("0.0%")).toBeInTheDocument();
    });

    it("shows trend indicators", () => {
        render(<CommissionDashboardStats data={mockCommissionDashboard} isLoading={false} />);
        expect(screen.getByText("+4.2%")).toBeInTheDocument();
        expect(screen.getByText("-1.5%")).toBeInTheDocument();
    });
});

// ===================== COM-003: Commission Plan Card =====================

describe("COM-003: CommissionPlanCard", () => {
    it("renders percentage plan with rate", () => {
        render(<CommissionPlanCard plan={mockPercentagePlan} />);
        expect(screen.getByText("Standard Commission")).toBeInTheDocument();
        expect(screen.getByText("Standard percentage-based plan")).toBeInTheDocument();
        expect(screen.getByText("Percentage")).toBeInTheDocument();
        expect(screen.getByText("10%")).toBeInTheDocument();
    });

    it("shows Default and Active badges", () => {
        render(<CommissionPlanCard plan={mockPercentagePlan} />);
        expect(screen.getByText("Default")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("shows rep count", () => {
        render(<CommissionPlanCard plan={mockPercentagePlan} />);
        expect(screen.getByText("5 reps")).toBeInTheDocument();
    });

    it("renders tiered plan with tier count", () => {
        render(<CommissionPlanCard plan={mockTieredPlan} />);
        expect(screen.getByText("Tiered Growth Plan")).toBeInTheDocument();
        expect(screen.getByText("Tiered")).toBeInTheDocument();
        expect(screen.getByText("4 tiers")).toBeInTheDocument();
    });

    it("renders flat plan with dollar amount", () => {
        render(<CommissionPlanCard plan={mockFlatPlan} />);
        expect(screen.getByText("Flat Fee Plan")).toBeInTheDocument();
        expect(screen.getByText("Flat Rate")).toBeInTheDocument();
        expect(screen.getByText("$150.00")).toBeInTheDocument();
    });

    it("shows Inactive badge for inactive plan", () => {
        render(<CommissionPlanCard plan={mockFlatPlan} />);
        expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("shows singular rep for single rep", () => {
        render(<CommissionPlanCard plan={{ ...mockPercentagePlan, _count: { assignments: 1, entries: 5 } }} />);
        expect(screen.getByText("1 rep")).toBeInTheDocument();
    });
});

// ===================== COM-003: Tier Editor =====================

describe("COM-003: TierEditor", () => {
    const mockTiers = [
        { minMargin: 0, maxMargin: 12, rate: 8 },
        { minMargin: 12, maxMargin: null, rate: 15 },
    ];

    it("renders existing tiers", () => {
        render(<TierEditor tiers={mockTiers} onChange={jest.fn()} />);
        expect(screen.getByText("Commission Tiers")).toBeInTheDocument();
        expect(screen.getByDisplayValue("0")).toBeInTheDocument();
        const twelves = screen.getAllByDisplayValue("12");
        expect(twelves.length).toBe(2); // max margin for tier 1 + min margin for tier 2
        expect(screen.getByDisplayValue("8")).toBeInTheDocument();
        expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    });

    it("shows add tier button", () => {
        render(<TierEditor tiers={mockTiers} onChange={jest.fn()} />);
        expect(screen.getByText("Add Tier")).toBeInTheDocument();
    });

    it("calls onChange when add tier clicked", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<TierEditor tiers={mockTiers} onChange={onChange} />);
        await user.click(screen.getByText("Add Tier"));
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange when remove tier clicked", async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const { container } = render(<TierEditor tiers={mockTiers} onChange={onChange} />);
        const trashButtons = container.querySelectorAll("button.text-destructive");
        expect(trashButtons.length).toBe(2);
        await user.click(trashButtons[0]!);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("disables inputs when disabled prop is true", () => {
        render(<TierEditor tiers={mockTiers} onChange={jest.fn()} disabled />);
        const addButton = screen.getByText("Add Tier").closest("button");
        expect(addButton).toBeDisabled();
    });
});
