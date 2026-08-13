"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { roleNumberToRole } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";
import { UserRole } from "@/lib/types";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your full name."),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });
  const { register: registerAuth } = useAuth();
  const router = useRouter();

  const onSubmit = async ({ name, email, password }: RegisterFormData) => {
    setError("");
    setLoading(true);

    try {
      const response = await registerAuth(name, email, password);
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className="input"
                placeholder="e.g. Arifa Rahman"
                required
                {...register("name")}
              />
              {errors.name && <p className="field-error" role="alert">{errors.name.message}</p>}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className="input"
                placeholder="you@institution.edu"
                required
                {...register("email")}
              />
              {errors.email && <p className="field-error" role="alert">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="input"
                  placeholder="Min. 6 characters"
                  required
                  {...register("password")}
                />
                {errors.password && <p className="field-error" role="alert">{errors.password.message}</p>}
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirm}
                  className="input"
                  placeholder="Repeat password"
                  required
                  {...register("confirm")}
                />
                {errors.confirm && <p className="field-error" role="alert">{errors.confirm.message}</p>}
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
