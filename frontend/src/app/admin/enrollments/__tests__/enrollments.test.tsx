import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@/test-utils/mocks";
import { mockGet, mockPost, mockPut, mockDelete } from "@/test-utils/mocks";
import AdminEnrollmentsPage from "@/app/admin/enrollments/page";


jest.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    setSession: jest.fn(),
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
  { id: "u3", name: "Charlie", email: "charlie@example.com", role: 0, createdAt: "2026-01-01T00:00:00Z" },
];

const classes = [
  { id: "c1", name: "Class 6", description: "", createdAt: "2026-01-01T00:00:00Z" },
  { id: "c2", name: "Class 7", description: "", createdAt: "2026-01-01T00:00:00Z" },
];

const enrollments = [
  { id: "e1", studentId: "u2", studentName: "Bob", classId: "c1", className: "Class 6", createdAt: "2026-01-01T00:00:00Z" },
];

describe("AdminEnrollmentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/admin/enrollments") return Promise.resolve({ data: enrollments });
      if (url === "/api/admin/users") return Promise.resolve({ data: { items: users, total: users.length } });
      return Promise.resolve({ data: classes });
    });
    mockPost.mockResolvedValue({ data: {} });
    mockPut.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({});
  });

  it("renders enrollments", async () => {
    render(<AdminEnrollmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
    expect(screen.getByText("Class 6")).toBeInTheDocument();
  });

  it("lists only student accounts in the enroll modal", async () => {
    render(<AdminEnrollmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Enroll Student" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Enroll Student" }));

    const studentSelect = screen.getByLabelText("Student") as HTMLSelectElement;
    const options = Array.from(studentSelect.options).map((o) => o.value);
    expect(options).toContain("u2");
    expect(options).not.toContain("u1");
    expect(options).not.toContain("u3");
  });

  it("enrolls a student in a class", async () => {
    render(<AdminEnrollmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Enroll Student" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Enroll Student" }));
    fireEvent.change(screen.getByLabelText("Student"), { target: { value: "u2" } });
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "c2" } });
    fireEvent.click(screen.getByRole("button", { name: "Enroll" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/admin/enroll-student", {
        studentId: "u2",
        classId: "c2",
      });
    });
  });

  it("edits an enrollment", async () => {
    render(<AdminEnrollmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Bob in Class 6" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit Bob in Class 6" }));
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "c2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/api/admin/enrollments/e1", {
        studentId: "u2",
        classId: "c2",
      });
    });
  });

  it("removes an enrollment", async () => {
    render(<AdminEnrollmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Remove Bob from Class 6" })).toBeInTheDocument();
    });

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Remove Bob from Class 6" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/admin/enrollments/e1");
    });
    confirmSpy.mockRestore();
  });
});
