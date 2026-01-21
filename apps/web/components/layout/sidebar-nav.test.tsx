import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import type { NavGroup } from "@/lib/types/navigation";
import { LayoutDashboard, Users } from "lucide-react";

const mockGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Users", href: "/users", icon: Users },
    ],
  },
];

jest.unstable_mockModule("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

let SidebarNav: typeof import("./sidebar-nav").SidebarNav;

beforeAll(async () => {
  ({ SidebarNav } = await import("./sidebar-nav"));
});

describe("SidebarNav", () => {
  it("renders navigation groups and items", () => {
    render(<SidebarNav groups={mockGroups} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("highlights active item based on pathname", () => {
    render(<SidebarNav groups={mockGroups} />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveClass("bg-accent");
  });

  it("hides group titles when collapsed", () => {
    render(<SidebarNav groups={mockGroups} collapsed />);

    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
  });

  it("calls onItemClick when item is clicked", async () => {
    const onItemClick = jest.fn();
    const user = userEvent.setup();

    render(<SidebarNav groups={mockGroups} onItemClick={onItemClick} />);

    await user.click(screen.getByRole("link", { name: /dashboard/i }));
    expect(onItemClick).toHaveBeenCalled();
  });
});
