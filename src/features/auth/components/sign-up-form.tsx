"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas/auth-schemas";
import { signUp, signIn } from "@/lib/auth-client";
import { SocialButton } from "./social-button";
import { cn } from "@/lib/utils";

export function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const passwordValue = watch("password", "");

  // Password strength indicators
  const passwordChecks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    digit: /\d/.test(passwordValue),
  };

  // ── Email + Password sign-up ─────────────────────────────────────────────
  const onSubmit = async (values: SignUpValues) => {
    setServerError(null);
    try {
      const { error } = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });
      if (error) {
        setServerError(error.message ?? "Failed to create account. Please try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  // ── Social sign-up ───────────────────────────────────────────────────────
  const handleSocial = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch {
      setServerError("OAuth sign-up failed. Please try again.");
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
            or register with email
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
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="text-sm font-medium text-white/70">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            {...register("name")}
            className={cn(
              "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200",
              "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
              errors.name
                ? "border-red-500/50"
                : "border-white/10 hover:border-white/20"
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="text-sm font-medium text-white/70">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={cn(
              "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200",
              "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
              errors.email
                ? "border-red-500/50"
                : "border-white/10 hover:border-white/20"
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="text-sm font-medium text-white/70">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              className={cn(
                "w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all duration-200",
                "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
                errors.password
                  ? "border-red-500/50"
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

          {/* Password strength */}
          {passwordValue && (
            <div className="grid grid-cols-2 gap-1 pt-1">
              {[
                { key: "length", label: "8+ characters" },
                { key: "upper", label: "Uppercase" },
                { key: "lower", label: "Lowercase" },
                { key: "digit", label: "Number" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      passwordChecks[key as keyof typeof passwordChecks]
                        ? "text-emerald-400"
                        : "text-white/20"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      passwordChecks[key as keyof typeof passwordChecks]
                        ? "text-emerald-400"
                        : "text-white/30"
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-confirm" className="text-sm font-medium text-white/70">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              {...register("confirmPassword")}
              className={cn(
                "w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all duration-200",
                "focus:border-violet-500/60 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20",
                errors.confirmPassword
                  ? "border-red-500/50"
                  : "border-white/10 hover:border-white/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
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
              Creating account…
            </span>
          ) : (
            "Create free account"
          )}
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-white/30 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-white/40">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
