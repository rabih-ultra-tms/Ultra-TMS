import { render, screen } from "@/test/utils";
import { PageHeader } from "./PageHeader";
import { Button } from "./button";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Carriers" />);
    expect(screen.getByText("Carriers")).toBeInTheDocument();
  });

  it("renders subtitle and actions", () => {
    render(<PageHeader title="Carriers" subtitle="Manage carriers" actions={<Button>Action</Button>} />);

    expect(screen.getByText("Manage carriers")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
