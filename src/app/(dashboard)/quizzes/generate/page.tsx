import { Metadata } from "next";
import { Suspense } from "react";
import { QuizGeneratorClient } from "@/features/quiz/components/quiz-generator-client";
import { Sparkles } from "lucide-react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Generate Quiz | AmarQuiz",
  description: "Generate an AI-powered quiz from your documents or any topic.",
};

export const dynamic = "force-dynamic";

export default function GenerateQuizPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Generate Quiz
          </h1>
          <p className="mt-2 text-white/60">
            Use AI to create a personalised quiz from your documents or any topic.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <Sparkles className="h-6 w-6 text-violet-400" />
        </div>
      </div>

      <hr className="border-white/10" />

      <Suspense fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      }>
        <QuizGeneratorClient />
      </Suspense>
    </div>
  );
}
