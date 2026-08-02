"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/features/quiz/actions/quiz-actions";
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Home, Lightbulb } from "lucide-react";

type Props = {
  quizId: string;
  title: string;
  questions: Question[];
};

type Phase = "answering" | "reviewing" | "finished";

const LETTERS = ["A", "B", "C", "D"];

export function QuizPlayer({ quizId, title, questions }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [phase, setPhase] = useState<Phase>("answering");
  const [showExplanation, setShowExplanation] = useState(false);

  const q = questions[current];
  const isAnswered = answers[current] !== null;
  const isCorrect = answers[current] === q.correctIndex;
  const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const pct = Math.round((score / questions.length) * 100);

  const handleSelect = (i: number) => {
    if (isAnswered) return;
    const updated = [...answers];
    updated[current] = i;
    setAnswers(updated);
    setSelected(i);
    setShowExplanation(false);
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setPhase("finished");
    }
  };

  if (phase === "finished") {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
        <div className={`flex h-32 w-32 items-center justify-center rounded-full text-4xl font-black ${pct >= 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {pct}%
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Quiz Complete!</h2>
          <p className="mt-2 text-white/60">{score} of {questions.length} correct</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setCurrent(0); setAnswers(new Array(questions.length).fill(null)); setSelected(null); setPhase("answering"); }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" /> Retake
          </button>
          <button
            onClick={() => router.push("/quizzes")}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Home className="h-4 w-4" /> All Quizzes
          </button>
        </div>
        {/* Review wrong answers */}
        <div className="w-full max-w-2xl text-left space-y-3">
          <h3 className="text-lg font-semibold text-white">Review</h3>
          {questions.map((qItem, i) => {
            const correct = answers[i] === qItem.correctIndex;
            return (
              <div key={i} className={`rounded-xl border p-4 ${correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <p className="text-sm font-medium text-white">{i + 1}. {qItem.question}</p>
                <p className={`mt-2 text-sm ${correct ? "text-emerald-400" : "text-red-400"}`}>
                  {correct ? "✓ Correct" : `✗ Your answer: ${answers[i] !== null ? LETTERS[answers[i]!] : "None"} — Correct: ${LETTERS[qItem.correctIndex]}`}
                </p>
                <p className="mt-1 text-xs text-white/50">{qItem.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{Math.round(((current) / questions.length) * 100)}% done</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-8">
        <p className="text-lg font-semibold leading-relaxed text-white">{q.question}</p>

        <div className="mt-6 space-y-3">
          {q.options.map((opt, i) => {
            let cls = "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10";
            if (isAnswered) {
              if (i === q.correctIndex) cls = "border-emerald-500/60 bg-emerald-500/10 text-emerald-400";
              else if (i === answers[current]) cls = "border-red-500/60 bg-red-500/10 text-red-400";
              else cls = "border-white/5 bg-white/5 text-white/30";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-sm text-left transition-all ${cls} ${!isAnswered ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isAnswered && i === q.correctIndex ? "bg-emerald-500/20" :
                  isAnswered && i === answers[current] && i !== q.correctIndex ? "bg-red-500/20" :
                  "bg-white/10"
                }`}>
                  {LETTERS[i]}
                </span>
                {opt}
                {isAnswered && i === q.correctIndex && <CheckCircle className="ml-auto h-5 w-5 text-emerald-400 shrink-0" />}
                {isAnswered && i === answers[current] && i !== q.correctIndex && <XCircle className="ml-auto h-5 w-5 text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className="mt-4">
            {!showExplanation ? (
              <button
                onClick={() => setShowExplanation(true)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <Lightbulb className="h-4 w-4" /> Show explanation
              </button>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="font-medium text-white/90 mb-1">💡 Explanation</p>
                {q.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-cyan-500"
        >
          {current + 1 < questions.length ? "Next Question" : "See Results"}
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
