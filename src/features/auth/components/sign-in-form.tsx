"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signInSchema, type SignInValues } from "@/features/auth/schemas/auth-schemas";
import { signIn } from "@/lib/auth-client";
import { SocialButton } from "./social-button";
import { cn } from "@/lib/utils";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  // ── Email + Password sign-in ─────────────────────────────────────────────
  const onSubmit = async (values: SignInValues) => {
    setServerError(null);
    try {
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: callbackUrl,
      });
      if (error) {
        setServerError(error.message ?? "Invalid email or password. Please try again.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  // ── Social sign-in ───────────────────────────────────────────────────────
  const handleSocial = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch {
      setServerError("OAuth sign-in failed. Please try again.");
      setSocialLoading(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Social buttons */}
      <div className="space-y-3">
        <SocialButton
          provider="google"
          onClick={() => handleSocial("google")}
          isLoading={socialLoading === "google"}
        />
        <SocialButton
          provider="github"
          onClick={() => handleSocial("github")}
          isLoading={socialLoading === "github"}
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0d0d14] px-3 text-white/40 uppercase tracking-widest">
            or continue with email
          </span>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="signin-email" className="text-sm font-medium text-white/70">
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={cn(
              "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200",
              "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
              errors.email
                ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
                : "border-white/10 hover:border-white/20"
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className="text-sm font-medium text-white/70">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={cn(
                "w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all duration-200",
                "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
                errors.password
                  ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
                  : "border-white/10 hover:border-white/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white",
            "transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]",
            "disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}
