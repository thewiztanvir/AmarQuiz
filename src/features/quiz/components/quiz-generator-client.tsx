"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateQuiz } from "@/features/quiz/actions/quiz-actions";
import { getDocuments } from "@/features/library/actions/document-actions";
import { getConfiguredProviders } from "@/features/settings/actions/api-key-actions";
import { Loader2, Sparkles, AlertCircle, BookOpen, PenLine } from "lucide-react";

type Provider = "gemini" | "openai" | "claude";
type Difficulty = "easy" | "medium" | "hard";
type Document = { id: string; name: string; status: string };

const providerLabels: Record<Provider, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI GPT",
  claude: "Anthropic Claude",
};

export function QuizGeneratorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDocId = searchParams.get("docId") || "";

  const [docs, setDocs] = useState<Document[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"document" | "topic">(preselectedDocId ? "document" : "document");
  const [docId, setDocId] = useState(preselectedDocId);
  const [topic, setTopic] = useState("");
  const [provider, setProvider] = useState<Provider | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(10);

  useEffect(() => {
    async function load() {
      const [d, p] = await Promise.all([getDocuments(), getConfiguredProviders()]);
      setDocs((d as any[]).filter((doc: any) => doc.status === "ready"));
      setProviders(p as Provider[]);
      if (p.length > 0) setProvider(p[0] as Provider);
      setLoading(false);
    }
    load();
  }, []);

  const handleGenerate = async () => {
    setError("");
    if (!provider) return setError("Please select an AI provider.");
    if (mode === "document" && !docId) return setError("Please select a document.");
    if (mode === "topic" && !topic.trim()) return setError("Please enter a topic.");

    setGenerating(true);
    const result = await generateQuiz({
      documentId: mode === "document" ? docId : undefined,
      customTopic: mode === "topic" ? topic : undefined,
      questionCount: count,
      difficulty,
      provider: provider as Provider,
    });

    if (result.error) {
      setError(result.error);
      setGenerating(false);
    } else {
      router.push(`/quizzes/${result.quizId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {providers.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            No AI provider configured.{" "}
            <a href="/settings" className="underline hover:text-amber-300">
              Add an API key in Settings
            </a>{" "}
            to generate quizzes.
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div>
        <p className="mb-3 text-sm font-medium text-white/70">Generate from</p>
        <div className="flex gap-3">
          {[
            { id: "document", label: "Document", icon: BookOpen },
            { id: "topic", label: "Custom Topic", icon: PenLine },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id as any)}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${
                mode === id
                  ? "border-violet-500 bg-violet-500/10 text-violet-400"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Source */}
      {mode === "document" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Select Document</label>
          {docs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
              No ready documents.{" "}
              <a href="/library" className="text-violet-400 underline hover:text-violet-300">Upload one first.</a>
            </div>
          ) : (
            <select
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="">-- Choose a document --</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Topic</label>
          <input
            type="text"
            placeholder="e.g. Quantum Computing, World War II, React Hooks..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-violet-500 focus:outline-none"
          />
        </div>
      )}

      {/* Options row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Provider */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">AI Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none"
          >
            {providers.length === 0 && <option value="">None configured</option>}
            {providers.map((p) => (
              <option key={p} value={p}>{providerLabels[p]}</option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Question count */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Questions ({count})</label>
          <input
            type="range"
            min={3}
            max={30}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-3 w-full accent-violet-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating || providers.length === 0}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-cyan-500 hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating your quiz…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate Quiz
          </>
        )}
      </button>
    </div>
  );
}
