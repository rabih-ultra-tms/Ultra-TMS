import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import type { UserNav as UserNavType } from "./user-nav";

const jestMock = jest as typeof jest & { unstable_mockModule: typeof jest.mock };

jestMock.unstable_mockModule("@/lib/hooks/use-auth", () => ({
  useCurrentUser: () => ({
    data: {
      id: "1",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      avatarUrl: null,
    },
    isLoading: false,
  }),
}));

let UserNav: typeof UserNavType;

beforeAll(async () => {
  ({ UserNav } = await import("./user-nav"));
});

describe("UserNav", () => {
  it("renders user avatar with initials", () => {
    render(<UserNav />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("shows dropdown menu on click", async () => {
    const user = userEvent.setup();
    render(<UserNav />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "menu");
    });

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("has profile and settings links", async () => {
    const user = userEvent.setup();
    render(<UserNav />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "menu");
    });

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: /settings/i })).toBeInTheDocument();
    });
  });

  it("has logout option", async () => {
    const user = userEvent.setup();
    render(<UserNav />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "menu");
    });

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /log out/i })).toBeInTheDocument();
    });
  });
});
