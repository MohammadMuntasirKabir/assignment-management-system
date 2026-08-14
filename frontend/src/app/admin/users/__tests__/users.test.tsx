import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@/test-utils/mocks";
import { mockGet, mockPut, mockPost, mockDelete, mockSetSession, mockLogout } from "@/test-utils/mocks";
import AdminUsersPage from "@/app/admin/users/page";


jest.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: mockLogout,
    setSession: mockSetSession,
    user: { id: "u3", name: "Charlie", email: "admin@example.com", role: "Admin", createdAt: "2026-01-01T00:00:00Z" },
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
  { id: "u1", name: "Alice", email: "alice@example.com", role: 1, createdAt: "2026-01-01T00:00:00Z" },
  { id: "u2", name: "Bob", email: "bob@example.com", role: 2, createdAt: "2026-01-01T00:00:00Z" },
  { id: "u3", name: "Charlie", email: "admin@example.com", role: 0, createdAt: "2026-01-01T00:00:00Z" },
];

const pagedUsers = { items: users, total: users.length, page: 1, pageSize: 20 };

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: pagedUsers });
  });

  it("renders role names as plain text instead of numeric boxes", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Teacher")).toBeInTheDocument();
    });
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).queryByText(/^[0-2]$/)).not.toBeInTheDocument();
  });

  it("shows only the role in the role column", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Teacher")).toBeInTheDocument();
    });
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
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

  it("sends the edited role on save", async () => {
    mockPut.mockResolvedValue({ status: 204 });
    mockGet.mockResolvedValueOnce({ data: pagedUsers }).mockResolvedValueOnce({ data: users });

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
      });
    });
  });

  it("disables role control for your own account", async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Charlie" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit Charlie" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toBeDisabled();
    });
  });

  it("transfers admin and demotes self when promoting to Admin", async () => {
    mockPost.mockResolvedValue({
      data: {
        currentSession: {
          userId: "u3",
          name: "Charlie",
          email: "admin@example.com",
          role: 1,
          token: "t1",
          expiresAt: "2026-08-08T00:00:00Z",
        },
        deletedSelf: false,
      },
    });
    mockGet.mockResolvedValueOnce({ data: pagedUsers });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Bob" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit Bob" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toHaveValue("2");
    });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "0" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Your new role")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText("Your new role"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/admin/transfer-admin", {
        targetUserId: "u2",
        selfRole: 1,
        deleteSelf: false,
      });
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(/Admin role transferred to Bob/);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalled();
    });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("deletes own account when transferring admin", async () => {
    mockPost.mockResolvedValue({ data: { currentSession: null, deletedSelf: true } });
    mockGet.mockResolvedValueOnce({ data: pagedUsers });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Bob" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit Bob" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toHaveValue("2");
    });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "0" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Your new role")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/Delete my account/));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/admin/transfer-admin", {
        targetUserId: "u2",
        selfRole: undefined,
        deleteSelf: true,
      });
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(/signed out/);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("disables save until a self role or deletion is chosen when transferring admin", async () => {
    mockGet.mockResolvedValueOnce({ data: pagedUsers });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Bob" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit Bob" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toHaveValue("2");
    });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "0" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Your new role")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(screen.getByText(/Pick your new role or delete your account/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Your new role"), { target: { value: "1" } });
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("navigates pages and refetches with the requested page", async () => {
    const firstPage = { items: users, total: 21, page: 1, pageSize: 20 };
    const page2 = {
      items: [
        { id: "u9", name: "Dana", email: "dana@example.com", role: 2, createdAt: "2026-01-01T00:00:00Z" },
      ],
      total: 21,
      page: 2,
      pageSize: 20,
    };
    mockGet.mockResolvedValueOnce({ data: firstPage }).mockResolvedValueOnce({ data: page2 });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
    expect(screen.getByText("Showing 1–20 of 21")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "/api/admin/users",
        { params: { page: 2, pageSize: 20 } }
      );
    });
    expect(await screen.findByText("Dana")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });
});
