import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";

jest.unstable_mockModule("@/lib/stores/ui-store", () => ({
  useUIStore: () => ({
    toggleSidebar: jest.fn(),
    toggleSidebarCollapsed: jest.fn(),
    sidebarCollapsed: false,
  }),
}));

jest.unstable_mockModule("./user-nav", () => ({
  UserNav: () => <div data-testid="user-nav">UserNav</div>,
}));

let AppHeader: typeof import("./app-header").AppHeader;

beforeAll(async () => {
  ({ AppHeader } = await import("./app-header"));
});

describe("AppHeader", () => {
  it("renders search input on desktop", () => {
    render(<AppHeader />);

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders menu toggle buttons", () => {
    render(<AppHeader />);

    expect(screen.getByRole("button", { name: /toggle navigation menu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
  });

  it("renders notifications button", () => {
    render(<AppHeader />);

    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });

  it("renders user nav", () => {
    render(<AppHeader />);

    expect(screen.getByTestId("user-nav")).toBeInTheDocument();
  });
});
