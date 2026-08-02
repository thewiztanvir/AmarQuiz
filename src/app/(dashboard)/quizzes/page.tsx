import { Metadata } from "next";
import Link from "next/link";
import { getQuizzes } from "@/features/quiz/actions/quiz-actions";
import { Sparkles, Plus, BookOpen, Clock, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "My Quizzes | AmarQuiz",
  description: "View and manage your generated quizzes.",
};

export const dynamic = "force-dynamic";

const difficultyColors: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  hard: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Quizzes</h1>
          <p className="mt-2 text-white/60">All your generated quizzes in one place.</p>
        </div>
        <Link
          href="/quizzes/generate"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-cyan-500"
        >
          <Plus className="h-4 w-4" />
          New Quiz
        </Link>
      </div>

      <hr className="border-white/10" />

      {quizzes.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10">
          <Sparkles className="h-12 w-12 text-white/20" />
          <div className="text-center">
            <p className="font-medium text-white/60">No quizzes yet</p>
            <p className="mt-1 text-sm text-white/30">Generate your first AI quiz to get started.</p>
          </div>
          <Link
            href="/quizzes/generate"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" /> Generate Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/quizzes/${quiz.id}`}
              className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-violet-500/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                  <BookOpen className="h-5 w-5 text-violet-400" />
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyColors[quiz.difficulty]}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white line-clamp-2 group-hover:text-violet-300 transition-colors">
                  {quiz.title}
                </h3>
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> {quiz.questionCount} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
