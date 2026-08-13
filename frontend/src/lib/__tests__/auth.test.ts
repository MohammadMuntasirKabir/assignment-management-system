import {
  saveAuthData,
  clearAuthData,
  getStoredUser,
  getStoredToken,
  roleNumberToRole,
  roleToNumber,
  isAuthenticated,
  TOKEN_COOKIE,
  USER_COOKIE,
} from "@/lib/auth";
import { AuthResponse, User } from "@/lib/types";

describe("auth helpers", () => {
  beforeEach(() => {
    document.cookie = `${TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${USER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  describe("roleNumberToRole", () => {
    it("maps 0 to Admin", () => {
      expect(roleNumberToRole(0)).toBe("Admin");
    });

    it("maps 1 to Teacher", () => {
      expect(roleNumberToRole(1)).toBe("Teacher");
    });

    it("maps any other number to Student", () => {
      expect(roleNumberToRole(2)).toBe("Student");
      expect(roleNumberToRole(99)).toBe("Student");
    });
  });

  describe("roleToNumber", () => {
    it("maps Admin to 0", () => {
      expect(roleToNumber("Admin")).toBe(0);
    });

    it("maps Teacher to 1", () => {
      expect(roleToNumber("Teacher")).toBe(1);
    });

    it("maps Student to 2", () => {
      expect(roleToNumber("Student")).toBe(2);
    });
  });

  describe("saveAuthData and getters", () => {
    it("saves token and user data", () => {
      const response: AuthResponse = {
        userId: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: 1,
        token: "abc123",
        expiresAt: "2026-08-08T00:00:00Z",
      };

      saveAuthData(response);

      expect(getStoredToken()).toBe("abc123");
      expect(getStoredUser()).toEqual({
        id: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: "Teacher",
        isActive: true,
        createdAt: expect.any(String),
      });
    });

    it("returns null when no user is stored", () => {
      expect(getStoredUser()).toBeNull();
      expect(getStoredToken()).toBeNull();
    });

    it("returns null for malformed user JSON", () => {
      document.cookie = `${USER_COOKIE}=not-json; path=/`;
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("clearAuthData", () => {
    it("removes token and user cookies", () => {
      saveAuthData({
        userId: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: 0,
        token: "abc123",
        expiresAt: "2026-08-08T00:00:00Z",
      });

      clearAuthData();

      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when a token exists", () => {
      saveAuthData({
        userId: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: 0,
        token: "abc123",
        expiresAt: "2026-08-08T00:00:00Z",
      });
      expect(isAuthenticated()).toBe(true);
    });

    it("returns false when no token exists", () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("stored user round-trip", () => {
    it("persists a full user object via cookie", () => {
      const user: User = {
        id: "u2",
        name: "Bob",
        email: "bob@example.com",
        role: "Student",
        createdAt: "2026-08-07T10:00:00Z",
      };
      document.cookie = `${USER_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/`;

      expect(getStoredUser()).toEqual(user);
    });
  });
});
