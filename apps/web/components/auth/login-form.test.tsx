import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";
import LoginPage from "@/app/(auth)/login/page";

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}));

describe("LoginPage", () => {
  it("renders login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("has link to forgot password", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });
});
