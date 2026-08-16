"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, ApiError } from "@/lib/auth-context";
import { FieldError } from "@/components/ui/input";
import { NetworkDiagram } from "./network-diagram";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, status } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      router.replace("/dashboard");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Brand panel — the navy gradient + branch network illustration from the real design */}
      <div
        className="relative hidden shrink-0 flex-col justify-between overflow-hidden p-14 text-white lg:flex lg:w-[46%]"
        style={{
          backgroundImage: "linear-gradient(165deg, #0B2545 0%, #0E3868 55%, #123E78 100%)",
        }}
      >
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-blue-500 font-display text-lg font-semibold text-white">
            M
          </div>
          <span
            className="font-mono text-[15px] font-medium"
            style={{ letterSpacing: "0.6px", color: "#AFC6EC" }}
          >
            MANPOWERERP
          </span>
        </div>

        <div className="relative max-w-[460px]">
          <NetworkDiagram />
          <p
            className="font-display text-[34px] font-medium"
            style={{ color: "#F3F7FF", lineHeight: "42.5px" }}
          >
            One console.
            <br />
            Every tenant.
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Provision manpower companies, manage subscriptions, and keep every tenant&apos;s
            workforce data isolated and accountable — from a single control room.
          </p>
        </div>

        <p className="relative text-[13px]" style={{ color: "#6E8FC2" }}>
          © 2026 ManpowerERP · Super Admin Console
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-mist-50 px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-blue-500 font-display text-base font-semibold text-white">
              M
            </div>
            <span
              className="font-mono text-sm font-medium"
              style={{ letterSpacing: "0.6px", color: "#0B2545" }}
            >
              MANPOWERERP
            </span>
          </div>

          <p
            className="font-mono text-[13px] font-medium"
            style={{ letterSpacing: "0.65px", color: "#2F6FED" }}
          >
            SUPER ADMIN
          </p>
          <h1 className="font-display mt-2 text-[28px] font-medium" style={{ color: "#0B2545" }}>
            Sign in to the console
          </h1>
          <p className="mt-2 mb-8 text-sm" style={{ color: "#64748B" }}>
            Restricted to platform administrators.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: "#334155" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@manpowererp.com"
                className="h-[46px] w-full rounded-[9px] border px-3.5 text-[15px] outline-none transition-colors focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-blue-500"
                style={{ borderColor: "#D6DEEA", color: "#0B2545" }}
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: "#334155" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-[46px] w-full rounded-[9px] border px-3.5 text-[15px] outline-none transition-colors focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-blue-500"
                style={{ borderColor: "#D6DEEA", color: "#0B2545" }}
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm" style={{ color: "#334155" }}>
                <input
                  type="checkbox"
                  name="keepSignedIn"
                  className="h-4 w-4 rounded"
                  style={{ accentColor: "#2F6FED" }}
                />
                Keep me signed in
              </label>
              <a
                href="#"
                className="text-[13px] font-medium hover:underline"
                style={{ color: "#2F6FED" }}
              >
                Forgot password?
              </a>
            </div>

            {serverError && (
              <p className="rounded-[9px] bg-coral-100 px-3 py-2 text-sm text-coral-500">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-[9px] text-[15px] font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-60"
              style={{
                backgroundColor: "#2F6FED",
                boxShadow: "0 8px 20px -8px rgba(47,111,237,0.6)",
              }}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              SSO
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E2E8F0" }} />
          </div>

          <button
            type="button"
            className="h-12 w-full rounded-[9px] border text-sm font-medium transition-colors hover:bg-mist-50 focus-visible:outline-2 focus-visible:outline-blue-500"
            style={{ borderColor: "#D6DEEA", color: "#334155" }}
          >
            Continue with SAML
          </button>
        </div>
      </div>
    </div>
  );
}
