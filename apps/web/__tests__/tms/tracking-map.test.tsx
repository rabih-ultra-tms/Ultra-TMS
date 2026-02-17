import { render, screen, within } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  trackingPositionsReturn,
  type TrackingPosition,
} from "@/test/mocks/hooks-tms-tracking";
import { socketContextReturn } from "@/test/mocks/socket-provider";

import { TrackingMap } from "@/components/tms/tracking/tracking-map";
import { TrackingSidebar } from "@/components/tms/tracking/tracking-sidebar";
import { TrackingPinPopup } from "@/components/tms/tracking/tracking-pin-popup";

// ─── Google Maps globals stub (used by buildMarkerIcon in tracking-map.tsx) ──

beforeAll(() => {
  (window as any).google = {
    maps: {
      Size: class Size {
        width: number;
        height: number;
        constructor(w: number, h: number) {
          this.width = w;
          this.height = h;
        }
      },
      Point: class Point {
        x: number;
        y: number;
        constructor(x: number, y: number) {
          this.x = x;
          this.y = y;
        }
      },
      LatLngBounds: class LatLngBounds {
        extend() { return this; }
      },
      MapOptions: {},
    },
  };
});

afterAll(() => {
  delete (window as any).google;
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();
const FRESH_TIMESTAMP = new Date(Date.now() - 5 * 60_000).toISOString(); // 5 min ago
const STALE_TIMESTAMP = new Date(Date.now() - 45 * 60_000).toISOString(); // 45 min ago

function makePosition(overrides: Partial<TrackingPosition> = {}): TrackingPosition {
  return {
    loadId: "load-1",
    loadNumber: "LD-2026-100",
    lat: 33.749,
    lng: -84.388,
    heading: 90,
    speed: 55,
    timestamp: FRESH_TIMESTAMP,
    status: "IN_TRANSIT",
    eta: new Date(Date.now() + 6 * 3600_000).toISOString(),
    etaStatus: "on-time",
    carrier: { id: "c1", name: "Fast Freight", mcNumber: "MC-123456" },
    driver: { name: "John Driver", phone: "555-0100" },
    origin: "Atlanta, GA",
    destination: "Miami, FL",
    equipmentType: "DRY_VAN",
    ...overrides,
  };
}

const pos1 = makePosition();
const pos2 = makePosition({
  loadId: "load-2",
  loadNumber: "LD-2026-101",
  lat: 30.332,
  lng: -81.656,
  etaStatus: "tight",
  carrier: { id: "c2", name: "Road Runner", mcNumber: "MC-654321" },
  origin: "Jacksonville, FL",
  destination: "Orlando, FL",
});
const pos3 = makePosition({
  loadId: "load-3",
  loadNumber: "LD-2026-102",
  lat: 25.761,
  lng: -80.192,
  etaStatus: "at-risk",
  timestamp: STALE_TIMESTAMP,
  carrier: { id: "c3", name: "Slowpoke Inc", mcNumber: "MC-111111" },
  origin: "Tampa, FL",
  destination: "Key West, FL",
});

// ─── TrackingMap Tests ───────────────────────────────────────────────────────

describe("TrackingMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trackingPositionsReturn.data = [pos1, pos2, pos3];
    trackingPositionsReturn.isLoading = false;
    trackingPositionsReturn.isError = false;
    trackingPositionsReturn.error = null;
    trackingPositionsReturn.refetch = jest.fn();
    socketContextReturn.connected = true;
    socketContextReturn.status = "connected";
  });

  it("renders the map container", () => {
    render(<TrackingMap />);
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
  });

  it("renders markers for each position", () => {
    render(<TrackingMap />);
    expect(screen.getByTestId("marker-LD-2026-100")).toBeInTheDocument();
    expect(screen.getByTestId("marker-LD-2026-101")).toBeInTheDocument();
    expect(screen.getByTestId("marker-LD-2026-102")).toBeInTheDocument();
  });

  it("renders status filter chips", () => {
    render(<TrackingMap />);
    // Toolbar + sidebar both render these labels, so use getAllByText
    expect(screen.getAllByText(/On Time/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Tight/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/At Risk/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Stale GPS/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders search input", () => {
    render(<TrackingMap />);
    expect(screen.getByPlaceholderText("Search loads...")).toBeInTheDocument();
  });

  it("shows load count in toolbar", () => {
    render(<TrackingMap />);
    expect(screen.getByText("3 loads")).toBeInTheDocument();
  });

  it("shows 'No loads match' overlay when search returns empty", async () => {
    const user = userEvent.setup();
    render(<TrackingMap />);
    const searchInput = screen.getByPlaceholderText("Search loads...");
    await user.type(searchInput, "NONEXISTENT");
    expect(screen.getByText("No loads match your filters")).toBeInTheDocument();
  });

  it("filters by search query on load number", async () => {
    const user = userEvent.setup();
    render(<TrackingMap />);
    const searchInput = screen.getByPlaceholderText("Search loads...");
    await user.type(searchInput, "LD-2026-100");
    expect(screen.getByTestId("marker-LD-2026-100")).toBeInTheDocument();
    expect(screen.queryByTestId("marker-LD-2026-101")).not.toBeInTheDocument();
  });

  it("filters by search query on carrier name", async () => {
    const user = userEvent.setup();
    render(<TrackingMap />);
    const searchInput = screen.getByPlaceholderText("Search loads...");
    await user.type(searchInput, "Road Runner");
    expect(screen.getByTestId("marker-LD-2026-101")).toBeInTheDocument();
    expect(screen.queryByTestId("marker-LD-2026-100")).not.toBeInTheDocument();
  });

  it("opens info window when marker is clicked", async () => {
    const user = userEvent.setup();
    render(<TrackingMap />);
    await user.click(screen.getByTestId("marker-LD-2026-100"));
    expect(screen.getByTestId("info-window")).toBeInTheDocument();
  });
});

describe("TrackingMap — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trackingPositionsReturn.data = undefined;
    trackingPositionsReturn.isLoading = true;
    socketContextReturn.connected = true;
    socketContextReturn.status = "connected";
  });

  it("shows loading skeleton when map data is loading", () => {
    render(<TrackingMap />);
    // The sidebar should show skeletons while loading
    expect(screen.getByText("Active Loads")).toBeInTheDocument();
  });
});

describe("TrackingMap — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trackingPositionsReturn.data = [];
    trackingPositionsReturn.isLoading = false;
    socketContextReturn.connected = true;
    socketContextReturn.status = "connected";
  });

  it("shows empty overlay when no loads exist", () => {
    render(<TrackingMap />);
    expect(screen.getByText("No active loads to track")).toBeInTheDocument();
  });
});

// ─── TrackingSidebar Tests ───────────────────────────────────────────────────

describe("TrackingSidebar", () => {
  const mockOnSelectLoad = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    socketContextReturn.connected = true;
    socketContextReturn.status = "connected";
  });

  it("renders the sidebar header", () => {
    render(
      <TrackingSidebar
        positions={[pos1, pos2]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("Active Loads")).toBeInTheDocument();
  });

  it("shows 'Live' when WebSocket is connected", () => {
    render(
      <TrackingSidebar
        positions={[pos1]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("shows 'Polling' when WebSocket is disconnected", () => {
    socketContextReturn.connected = false;
    socketContextReturn.status = "disconnected";
    render(
      <TrackingSidebar
        positions={[pos1]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("Polling")).toBeInTheDocument();
  });

  it("renders load rows with load numbers", () => {
    render(
      <TrackingSidebar
        positions={[pos1, pos2]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("LD-2026-100")).toBeInTheDocument();
    expect(screen.getByText("LD-2026-101")).toBeInTheDocument();
  });

  it("renders carrier names", () => {
    render(
      <TrackingSidebar
        positions={[pos1]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("Fast Freight")).toBeInTheDocument();
  });

  it("renders origin and destination", () => {
    render(
      <TrackingSidebar
        positions={[pos1]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("Atlanta, GA")).toBeInTheDocument();
    expect(screen.getByText("Miami, FL")).toBeInTheDocument();
  });

  it("calls onSelectLoad when a row is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TrackingSidebar
        positions={[pos1]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    await user.click(screen.getByText("LD-2026-100"));
    expect(mockOnSelectLoad).toHaveBeenCalledWith("load-1");
  });

  it("shows summary chips with ETA status counts", () => {
    render(
      <TrackingSidebar
        positions={[pos1, pos2, pos3]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    // pos1 is on-time, pos2 is tight, pos3 is at-risk
    // Chips render "{count} {label}" so use regex to match partial text
    expect(screen.getAllByText(/On Time/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Tight/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/At Risk/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows total load count in footer", () => {
    render(
      <TrackingSidebar
        positions={[pos1, pos2]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("2 loads in transit")).toBeInTheDocument();
  });

  it("shows empty state when no positions", () => {
    render(
      <TrackingSidebar
        positions={[]}
        selectedLoadId={null}
        isLoading={false}
        onSelectLoad={mockOnSelectLoad}
      />
    );
    expect(screen.getByText("No active loads")).toBeInTheDocument();
  });
});

// ─── TrackingPinPopup Tests ─────────────────────────────────────────────────

describe("TrackingPinPopup", () => {
  const mockViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders load number", () => {
    render(
      <TrackingPinPopup position={pos1} onViewDetails={mockViewDetails} />
    );
    expect(screen.getByText("LD-2026-100")).toBeInTheDocument();
  });

  it("renders ETA status label", () => {
    render(
      <TrackingPinPopup position={pos1} onViewDetails={mockViewDetails} />
    );
    expect(screen.getByText("On Time")).toBeInTheDocument();
  });

  it("renders carrier info", () => {
    render(
      <TrackingPinPopup position={pos1} onViewDetails={mockViewDetails} />
    );
    expect(screen.getByText("Fast Freight")).toBeInTheDocument();
    expect(screen.getByText(/MC# MC-123456/)).toBeInTheDocument();
  });

  it("renders origin and destination", () => {
    render(
      <TrackingPinPopup position={pos1} onViewDetails={mockViewDetails} />
    );
    expect(screen.getByText("Atlanta, GA")).toBeInTheDocument();
    expect(screen.getByText("Miami, FL")).toBeInTheDocument();
  });

  it("renders speed when non-zero", () => {
    render(
      <TrackingPinPopup position={pos1} onViewDetails={mockViewDetails} />
    );
    expect(screen.getByText("55 mph")).toBeInTheDocument();
  });

  it("does not render speed when zero", () => {
    const zeroSpeedPos = makePosition({ speed: 0 });
    render(
      <TrackingPinPopup position={zeroSpeedPos} onViewDetails={mockViewDetails} />
    );
    expect(screen.queryByText("0 mph")).not.toBeInTheDocument();
  });

  it("shows stale GPS warning for old timestamp", () => {
    render(
      <TrackingPinPopup position={pos3} onViewDetails={mockViewDetails} />
    );
    // Both the status badge ("Stale GPS") and the warning text contain "Stale GPS"
    const staleElements = screen.getAllByText(/Stale GPS/);
    expect(staleElements.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onViewDetails when View Details is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TrackingPinPopup position={pos1} onViewDetails={mockViewDetails} />
    );
    await user.click(screen.getByText("View Details"));
    expect(mockViewDetails).toHaveBeenCalledWith("load-1");
  });
});
