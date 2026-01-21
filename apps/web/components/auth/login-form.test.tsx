import { jest } from "@jest/globals";
import { render, screen } from "@/test/utils";
import LoginPage from "@/app/(auth)/login/page";

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}));

describe("LoginPage", () => {
  it("renders login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("has links to forgot password and register", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
