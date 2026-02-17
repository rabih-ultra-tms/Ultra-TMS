import { render, screen } from "@/test/utils";
import { jest } from "@jest/globals";

import { RateConPreview } from "@/components/tms/documents/rate-con-preview";

// ─── RateConPreview Tests ────────────────────────────────────────────────────

describe("RateConPreview — Loading State", () => {
  it("shows loading spinner and message", () => {
    render(<RateConPreview pdfUrl={null} isLoading={true} />);
    expect(
      screen.getByText("Generating rate confirmation...")
    ).toBeInTheDocument();
  });
});

describe("RateConPreview — Error State", () => {
  it("shows error message", () => {
    const error = new Error("Server error: 500");
    render(<RateConPreview pdfUrl={null} isLoading={false} error={error} />);
    expect(
      screen.getByText("Failed to generate rate confirmation")
    ).toBeInTheDocument();
    expect(screen.getByText("Server error: 500")).toBeInTheDocument();
  });
});

describe("RateConPreview — Empty State", () => {
  it("shows prompt to generate PDF", () => {
    render(<RateConPreview pdfUrl={null} isLoading={false} />);
    expect(
      screen.getByText(/Click .* to create the rate confirmation/)
    ).toBeInTheDocument();
  });
});

describe("RateConPreview — PDF Loaded", () => {
  it("renders iframe with PDF URL", () => {
    const url = "blob:http://localhost/test-pdf";
    render(<RateConPreview pdfUrl={url} isLoading={false} />);
    const iframe = screen.getByTitle("Rate Confirmation Preview");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", url);
  });

  it("applies custom className", () => {
    const url = "blob:http://localhost/test-pdf";
    const { container } = render(
      <RateConPreview pdfUrl={url} isLoading={false} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("RateConPreview — State Priority", () => {
  it("loading takes priority over error", () => {
    const error = new Error("Network error");
    render(<RateConPreview pdfUrl={null} isLoading={true} error={error} />);
    expect(
      screen.getByText("Generating rate confirmation...")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Failed to generate rate confirmation")
    ).not.toBeInTheDocument();
  });

  it("error takes priority over empty state", () => {
    const error = new Error("Unauthorized");
    render(<RateConPreview pdfUrl={null} isLoading={false} error={error} />);
    expect(
      screen.getByText("Failed to generate rate confirmation")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Click .* to create the rate confirmation/)
    ).not.toBeInTheDocument();
  });
});
