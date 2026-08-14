import {
  saveAuthData,
  clearAuthData,
  getStoredUser,
  roleNumberToRole,
  roleToNumber,
  isAuthenticated,
  USER_COOKIE,
} from "@/lib/auth";
import { AuthResponse, User } from "@/lib/types";

describe("auth helpers", () => {
  beforeEach(() => {
    document.cookie = `${USER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  describe("roleNumberToRole", () => {
    it("maps 0 to Admin", () => {
      expect(roleNumberToRole(0)).toBe("Admin");
    });

    it("maps 1 to Teacher", () => {
      expect(roleNumberToRole(1)).toBe("Teacher");
    });

    it("maps 2 to Student", () => {
      expect(roleNumberToRole(2)).toBe("Student");
    });

    it("throws for an unknown role number (fail-closed)", () => {
      expect(() => roleNumberToRole(99)).toThrow();
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
    it("stores only the user profile, not the token", () => {
      const response: AuthResponse = {
        userId: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: 1,
        token: "abc123",
        expiresAt: "2026-08-08T00:00:00Z",
      };

      saveAuthData(response);

      // The token lives in an HttpOnly cookie set by the backend; JS never sees it.
      expect(document.cookie).not.toContain("token");
      expect(getStoredUser()).toEqual({
        id: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: "Teacher",
        createdAt: expect.any(String),
      });
    });

    it("returns null when no user is stored", () => {
      expect(getStoredUser()).toBeNull();
    });

    it("returns null for malformed user JSON", () => {
      document.cookie = `${USER_COOKIE}=not-json; path=/`;
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("clearAuthData", () => {
    it("removes the stored user cookie", () => {
      saveAuthData({
        userId: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: 0,
        token: "abc123",
        expiresAt: "2026-08-08T00:00:00Z",
      });

      clearAuthData();

      expect(getStoredUser()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns true when a user profile is stored", () => {
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

    it("returns false when no user profile is stored", () => {
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
