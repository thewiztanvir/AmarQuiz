import type { Metadata } from "next";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AmarQuiz account to continue learning.",
};

export default function SignInPage() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-white/50">
          Sign in to continue your learning journey.
        </p>
      </div>

      {/* Form — wrapped in Suspense for useSearchParams() in SignInForm */}
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-xl bg-white/5" />
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
