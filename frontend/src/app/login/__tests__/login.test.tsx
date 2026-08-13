import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";

const mockLogin = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn(),
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("does not show demo credentials", () => {
    render(<LoginPage />);
    expect(screen.queryByText("Demo Credentials:")).not.toBeInTheDocument();
    expect(screen.queryByText(/admin@example.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/teacher1@example.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/student1@example.com/)).not.toBeInTheDocument();
  });

  it("renders required form fields", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it("calls login with correct credentials on submit", async () => {
    mockLogin.mockResolvedValueOnce({
      userId: "1",
      name: "Admin",
      email: "admin@example.com",
      role: 0,
      token: "fake-token",
      expiresAt: "2026-08-04T15:22:08Z",
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "admin123");
    });
  });
});
