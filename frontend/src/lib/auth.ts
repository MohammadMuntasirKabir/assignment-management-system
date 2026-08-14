import Cookies from "js-cookie";
import { AuthResponse, User, UserRole } from "./types";

// The JWT is stored in an HttpOnly cookie (set by the backend) and is not
// readable from JavaScript. Only the non-sensitive user profile is kept in a
// JS-readable cookie, purely to hydrate the UI.
export const USER_COOKIE = "user";

export function saveAuthData(response: AuthResponse): void {
  const maxAgeDays = 1;
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

export function roleNumberToRole(roleNum: number): UserRole {
  if (roleNum === 0) return "Admin";
  if (roleNum === 1) return "Teacher";
  if (roleNum === 2) return "Student";
  throw new Error(`Unknown role number: ${roleNum}`);
}

export function roleToNumber(role: UserRole): number {
  return role === "Admin" ? 0 : role === "Teacher" ? 1 : 2;
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}
