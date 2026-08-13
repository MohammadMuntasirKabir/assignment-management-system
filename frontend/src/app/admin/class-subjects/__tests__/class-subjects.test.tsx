import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminClassSubjectsPage from "@/app/admin/class-subjects/page";

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();
const mockSetSession = jest.fn();
const mockLogout = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/admin/class-subjects",
}));

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

const classes = [
  { id: "c1", name: "Class 6", description: "", createdAt: "2026-01-01T00:00:00Z" },
  { id: "c2", name: "Class 7", description: "", createdAt: "2026-01-01T00:00:00Z" },
];

const subjects = [
  { id: "s1", name: "English", description: "", createdAt: "2026-01-01T00:00:00Z" },
  { id: "s2", name: "Math", description: "", createdAt: "2026-01-01T00:00:00Z" },
];

const links = [
  { id: "cs1", classId: "c1", className: "Class 6", subjectId: "s1", subjectName: "English" },
  { id: "cs2", classId: "c2", className: "Class 7", subjectId: "s2", subjectName: "Math" },
];

describe("AdminClassSubjectsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/admin/class-subjects") return Promise.resolve({ data: links });
      if (url === "/api/admin/classes") return Promise.resolve({ data: classes });
      return Promise.resolve({ data: subjects });
    });
    mockPut.mockResolvedValue({ data: links[0] });
    mockPost.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({});
  });

  it("renders class-subject links", async () => {
    render(<AdminClassSubjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Class 6")).toBeInTheDocument();
    });
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Class 7")).toBeInTheDocument();
    expect(screen.getByText("Math")).toBeInTheDocument();
  });

  it("links a new class and subject", async () => {
    render(<AdminClassSubjectsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Link Class & Subject" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Link Class & Subject" }));
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "c2" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "s2" } });
    fireEvent.click(screen.getByRole("button", { name: "Link" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/admin/class-subjects", {
        classId: "c2",
        subjectId: "s2",
      });
    });
  });

  it("edits an existing class-subject link", async () => {
    render(<AdminClassSubjectsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Class 6 – English" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit Class 6 – English" }));
    expect(screen.getByText("Edit Class–Subject Link")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "c2" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "s2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/api/admin/class-subjects/cs1", {
        classId: "c2",
        subjectId: "s2",
      });
    });
  });

  it("unlinks a class-subject link", async () => {
    render(<AdminClassSubjectsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Unlink Class 6 – English" })).toBeInTheDocument();
    });

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Unlink Class 6 – English" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/admin/class-subjects/cs1");
    });
    confirmSpy.mockRestore();
  });
});
