import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminUsersPage from "@/app/admin/users/page";

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/admin/users",
}));

jest.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    user: { id: "u3", name: "Charlie", email: "admin@example.com", role: "Admin", isActive: true, createdAt: "2026-01-01T00:00:00Z" },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ProtectedRoute", () => {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { __esModule: true, default: ProtectedRoute };
});

jest.mock("@/components/DashboardLayout", () => {
  const DashboardLayout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { __esModule: true, default: DashboardLayout };
});

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getErrorMessage: (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback,
}));

const users = [
  { id: "u1", name: "Alice", email: "alice@example.com", role: 1, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "u2", name: "Bob", email: "bob@example.com", role: 2, isActive: false, createdAt: "2026-01-01T00:00:00Z" },
  { id: "u3", name: "Charlie", email: "admin@example.com", role: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
];

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: users });
  });

  it("renders role names as stamps instead of numeric boxes", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Teacher")).toBeInTheDocument();
    });
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.queryByText(/^[0-2]$/)).not.toBeInTheDocument();
  });

  it("shows active and inactive status for each account", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Active")).toHaveLength(2);
    });
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("prefills the correct role when editing a user", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Alice" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit Bob" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toHaveValue("2");
    });
  });

  it("sends the edited role and active state on save", async () => {
    mockPut.mockResolvedValue({ status: 204 });
    mockGet.mockResolvedValueOnce({ data: users }).mockResolvedValueOnce({ data: users });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Bob" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit Bob" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toHaveValue("2");
    });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/api/admin/users/u2", {
        name: "Bob",
        email: "bob@example.com",
        role: 1,
        isActive: false,
      });
    });
  });

  it("disables role and active controls for your own account", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Charlie" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit Charlie" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toBeDisabled();
      expect(screen.getByLabelText("Active account")).toBeDisabled();
    });
  });
});
