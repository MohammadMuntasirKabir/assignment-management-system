import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { getStoredUser, getStoredToken } from "@/lib/auth";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockPost = api.post as jest.Mock;

function TestComponent() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.email : "null"}</div>
      <button onClick={() => login("a@b.com", "secret")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  it("starts with no user and finishes loading", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toBe("null");
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
  });

  it("restores the user from stored cookies on mount", async () => {
    const user = {
      id: "1",
      name: "Alice",
      email: "alice@example.com",
      role: "Admin",
      createdAt: "2026-08-07T10:00:00Z",
    };
    document.cookie = `token=abc; path=/`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/`;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("alice@example.com");
    });
  });

  it("logs in, stores the token and user, and updates state", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        userId: "2",
        name: "Bob",
        email: "bob@example.com",
        role: 2,
        token: "tok-123",
        expiresAt: "2026-08-08T00:00:00Z",
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/auth/login", {
        email: "a@b.com",
        password: "secret",
      });
    });
    expect(getStoredToken()).toBe("tok-123");
    expect(getStoredUser()?.role).toBe("Student");
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("bob@example.com");
    });
  });

  it("clears stored data and user state on logout", async () => {
    const user = {
      id: "1",
      name: "Alice",
      email: "alice@example.com",
      role: "Admin",
      createdAt: "2026-08-07T10:00:00Z",
    };
    document.cookie = `token=abc; path=/`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/`;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("alice@example.com");
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    });

    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(screen.getByTestId("user").textContent).toBe("null");
  });
});
