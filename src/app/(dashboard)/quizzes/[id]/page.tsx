import { notFound } from "next/navigation";
import { getQuiz } from "@/features/quiz/actions/quiz-actions";
import { QuizPlayer } from "@/features/quiz/components/quiz-player";
import type { Question } from "@/features/quiz/actions/quiz-actions";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuiz(id);

  if (!quiz || quiz.status !== "ready") notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{quiz.title}</h1>
        <p className="mt-1 text-sm text-white/50 capitalize">
          {quiz.difficulty} · {quiz.questionCount} questions
        </p>
      </div>
      <hr className="border-white/10" />
      <QuizPlayer
        quizId={quiz.id}
        title={quiz.title}
        questions={quiz.questions as Question[]}
      />
    </div>
  );
}
