import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free AmarQuiz account and start your AI-powered learning journey.",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-sm text-white/50">
          Free forever. No credit card required.
        </p>
      </div>

      {/* Form */}
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl bg-white/5" />
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  );
}
