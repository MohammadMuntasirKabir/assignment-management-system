import Cookies from "js-cookie";
import { AuthResponse, User, UserRole } from "./types";

export const TOKEN_COOKIE = "token";
export const USER_COOKIE = "user";

export function saveAuthData(response: AuthResponse): void {
  const maxAgeDays = 1;
  Cookies.set(TOKEN_COOKIE, response.token, { expires: maxAgeDays, sameSite: "strict" });
  const user: User = {
    id: response.userId,
    name: response.name,
    email: response.email,
    role: roleNumberToRole(response.role),
    createdAt: new Date().toISOString(),
  };
  Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: maxAgeDays, sameSite: "strict" });
}

export function clearAuthData(): void {
  Cookies.remove(TOKEN_COOKIE);
  Cookies.remove(USER_COOKIE);
}

export function getStoredUser(): User | null {
  const userStr = Cookies.get(USER_COOKIE);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return Cookies.get(TOKEN_COOKIE) ?? null;
}

export function roleNumberToRole(roleNum: number): UserRole {
  return roleNum === 0 ? "Admin" : roleNum === 1 ? "Teacher" : "Student";
}

export function roleToNumber(role: UserRole): number {
  return role === "Admin" ? 0 : role === "Teacher" ? 1 : 2;
}

export function isAuthenticated(): boolean {
  const token = getStoredToken();
  if (!token) return false;
  return true;
}
