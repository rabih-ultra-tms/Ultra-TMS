import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import {
  checkCallsReturn,
  createCheckCallReturn,
} from "@/test/mocks/hooks-tms-checkcalls";

import { CheckCallTimeline } from "@/components/tms/checkcalls/check-call-timeline";
import { CheckCallForm } from "@/components/tms/checkcalls/check-call-form";

const mockCheckCalls = [
  {
    id: "cc-1",
    loadId: "load-1",
    type: "CHECK_CALL" as const,
    calledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    city: "Springfield",
    state: "IL",
    locationDescription: "I-55 south, mile marker 142",
    gpsSource: "GPS" as const,
    etaToNextStop: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    notes: "Driver reports smooth traffic",
    calledBy: { id: "user-1", name: "John Dispatcher" },
    source: "PHONE",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cc-2",
    loadId: "load-1",
    type: "ARRIVAL" as const,
    calledAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    city: "Chicago",
    state: "IL",
    locationDescription: "Arrived at warehouse",
    gpsSource: "MANUAL" as const,
    notes: "Arrived on time",
    calledBy: { id: "user-1", name: "John Dispatcher" },
    source: "PHONE",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// ----- CheckCallTimeline Tests -----

describe("CheckCallTimeline — Data Loaded", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkCallsReturn.data = mockCheckCalls;
    checkCallsReturn.isLoading = false;
    checkCallsReturn.error = null;
  });

  it("renders check call cards", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("Springfield, IL")).toBeInTheDocument();
    expect(screen.getByText("Chicago, IL")).toBeInTheDocument();
  });

  it("displays check call type badges", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("Check Call")).toBeInTheDocument();
    expect(screen.getByText("Arrival")).toBeInTheDocument();
  });

  it("shows GPS badge for GPS-sourced check calls", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("GPS")).toBeInTheDocument();
  });

  it("displays notes text", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("Driver reports smooth traffic")).toBeInTheDocument();
  });

  it("shows caller name", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    const callerElements = screen.getAllByText("John Dispatcher");
    expect(callerElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows source badge", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    const phoneElements = screen.getAllByText("PHONE");
    expect(phoneElements.length).toBeGreaterThanOrEqual(1);
  });
});

describe("CheckCallTimeline — Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkCallsReturn.data = undefined;
    checkCallsReturn.isLoading = true;
    checkCallsReturn.error = null;
  });

  it("shows loading skeletons", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.queryByText("Springfield, IL")).not.toBeInTheDocument();
  });
});

describe("CheckCallTimeline — Error State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkCallsReturn.data = undefined;
    checkCallsReturn.isLoading = false;
    checkCallsReturn.error = new Error("Failed to load check calls");
  });

  it("shows error message", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("Failed to load check calls")).toBeInTheDocument();
  });
});

describe("CheckCallTimeline — Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkCallsReturn.data = [];
    checkCallsReturn.isLoading = false;
    checkCallsReturn.error = null;
  });

  it("shows empty state message", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("No check calls logged yet")).toBeInTheDocument();
  });

  it("shows guidance about check calls", () => {
    render(<CheckCallTimeline loadId="load-1" />);
    expect(
      screen.getByText(/check calls record driver status updates/i)
    ).toBeInTheDocument();
  });
});

describe("CheckCallTimeline — Overdue Warning", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkCallsReturn.isLoading = false;
    checkCallsReturn.error = null;
  });

  it("shows overdue warning when last check call > 4 hours", () => {
    checkCallsReturn.data = [
      {
        id: "cc-old",
        loadId: "load-1",
        type: "CHECK_CALL" as const,
        calledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        city: "Dallas",
        state: "TX",
        calledBy: { id: "user-1", name: "Admin" },
        source: "PHONE",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ];
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.getByText("Check Call Overdue")).toBeInTheDocument();
  });

  it("does not show overdue warning when last check call < 4 hours", () => {
    checkCallsReturn.data = [
      {
        id: "cc-recent",
        loadId: "load-1",
        type: "CHECK_CALL" as const,
        calledAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        city: "Dallas",
        state: "TX",
        calledBy: { id: "user-1", name: "Admin" },
        source: "PHONE",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ];
    render(<CheckCallTimeline loadId="load-1" />);
    expect(screen.queryByText("Check Call Overdue")).not.toBeInTheDocument();
  });
});

// ----- CheckCallForm Tests -----

describe("CheckCallForm — Rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createCheckCallReturn.isPending = false;
    createCheckCallReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ id: "cc-new" });
  });

  it("renders the form title", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByText("Add Check Call")).toBeInTheDocument();
  });

  it("renders the Type select", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByText("Type")).toBeInTheDocument();
  });

  it("renders the City input", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByLabelText(/City/)).toBeInTheDocument();
  });

  it("renders the State select", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByText("State")).toBeInTheDocument();
  });

  it("renders the Notes textarea", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("renders Save Check Call button", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByText("Save Check Call")).toBeInTheDocument();
  });

  it("renders Clear button", () => {
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });
});

describe("CheckCallForm — Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createCheckCallReturn.isPending = false;
    createCheckCallReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ id: "cc-new" });
  });

  it("shows error when submitting without required fields", async () => {
    const user = userEvent.setup();
    render(<CheckCallForm loadId="load-1" />);

    // Fill city to bypass HTML required, but leave state empty for JS validation
    const cityInput = screen.getByLabelText(/City/);
    await user.type(cityInput, "Dallas");

    await user.click(screen.getByText("Save Check Call"));

    await waitFor(() => {
      expect(
        screen.getByText(/please fill in all required fields/i)
      ).toBeInTheDocument();
    });
  });
});

describe("CheckCallForm — Submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createCheckCallReturn.isPending = false;
    createCheckCallReturn.mutateAsync = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue({ id: "cc-new" });
  });

  it("disables Save button when submission is pending", () => {
    createCheckCallReturn.isPending = true;
    render(<CheckCallForm loadId="load-1" />);
    expect(screen.getByText("Save Check Call").closest("button")).toBeDisabled();
  });

  it("shows character count for notes", async () => {
    const user = userEvent.setup();
    render(<CheckCallForm loadId="load-1" />);

    const notesInput = screen.getByLabelText("Notes");
    await user.type(notesInput, "Hello");

    expect(screen.getByText("5/500 characters")).toBeInTheDocument();
  });
});
