import { render, screen, fireEvent } from "@/test/utils";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("shows title and message", () => {
    render(<ErrorState title="Oops" message="Failed" />);

    expect(screen.getByText("Oops")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("calls retry handler", () => {
    let retried = false;
    const onRetry = () => { retried = true; };
    render(<ErrorState title="Oops" message="Failed" retry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(retried).toBe(true);
  });
});
