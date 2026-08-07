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
    expect(screen.getByText("Assignment Management System")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows demo credentials", () => {
    render(<LoginPage />);
    expect(screen.getByText("Demo Credentials:")).toBeInTheDocument();
    expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/teacher1@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/student1@example.com/)).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@example.com", "admin123");
    });
  });
});
