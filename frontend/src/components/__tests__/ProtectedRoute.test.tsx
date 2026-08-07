import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUseAuth = useAuth as jest.Mock;

describe("ProtectedRoute", () => {
  it("renders loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders children when user is authenticated and role is allowed", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test", email: "test@test.com", role: "Admin", createdAt: "" },
      loading: false,
    });

    render(
      <ProtectedRoute allowedRoles={["Admin"]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders nothing when user role is not allowed", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test", email: "test@test.com", role: "Student", createdAt: "" },
      loading: false,
    });

    render(
      <ProtectedRoute allowedRoles={["Admin"]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders nothing when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
