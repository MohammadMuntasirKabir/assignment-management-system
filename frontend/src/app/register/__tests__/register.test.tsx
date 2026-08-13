import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "@/app/register/page";

const mockRegister = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the registration form", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  it("calls register with correct credentials on valid submit", async () => {
    mockRegister.mockResolvedValueOnce({
      userId: "1",
      name: "Arifa Rahman",
      email: "arifa@example.com",
      role: 2,
      token: "fake-token",
      expiresAt: "2026-08-04T15:22:08Z",
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Arifa Rahman" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "arifa@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret6" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "secret6" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("Arifa Rahman", "arifa@example.com", "secret6");
    });
  });

  it("shows validation errors for empty required fields", async () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows an error for mismatched passwords", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Arifa Rahman" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "arifa@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret6" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows an error for short passwords", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Arifa Rahman" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "arifa@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
