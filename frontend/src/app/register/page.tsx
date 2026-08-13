"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { roleNumberToRole } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";
import { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validate = (): string | null => {
    if (!name.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);

    try {
      const response = await register(name.trim(), email.trim(), password);
      const role = roleNumberToRole(response.role);
      const rolePath = role.toLowerCase() as Lowercase<UserRole>;
      router.replace(`/${rolePath}`);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-sheet">
        <div className="auth-brand">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 64 64" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
              <rect x="3" y="3" width="58" height="58" rx="4" fill="#f4f1ea" stroke="#1b2430" strokeWidth="2" />
              <path d="M3 3v6M3 3h6M61 61v-6M61 61h-6" stroke="#1b2430" strokeWidth="2" fill="none" />
              <circle cx="32" cy="32" r="9" fill="none" stroke="#2050c9" strokeWidth="2" />
              <circle cx="32" cy="32" r="3.5" fill="#2050c9" />
            </svg>
            <span className="brand-name">OnnoRokom Projukti</span>
          </span>
          <span className="brand-rev">ASM · REG</span>
        </div>

        <div className="auth-body">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">
            New accounts open as <span className="font-semibold text-[var(--blue-ink)]">Student</span>.{" "}
            An administrator can change your role later.
          </p>

          {error && (
            <div className="notice notice-error mb-5" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g. Arifa Rahman"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@institution.edu"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? (
                <>
                  <span className="spinner border-white/40 border-t-white" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <div className="auth-link">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
