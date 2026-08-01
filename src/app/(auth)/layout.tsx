import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | AmarQuiz",
    default: "Authentication | AmarQuiz",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f]">
      <div className="flex min-h-screen">
        {/* ── Left panel — branding ─────────────────────────────────── */}
        <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 50%), #0d0d14",
            }}
          />

          {/* Animated orb */}
          <div
            className="absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              animation: "pulse 4s ease-in-out infinite",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Amar<span className="text-violet-400">Quiz</span>
            </span>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Your AI-powered
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                  }}
                >
                  learning platform
                </span>
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                Generate quizzes, track progress, master any topic — all powered by AI.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                "AI quiz generation from any topic or document",
                "Flashcards, bookmarks & progress tracking",
                "Secure encrypted API key vault",
                "Personalized learning recommendations",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/60">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="relative z-10">
            <blockquote className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm text-white/70 leading-relaxed">
                &ldquo;AmarQuiz transformed how I study. I went from cramming to actually understanding — the AI explanations are incredible.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
                <div>
                  <p className="text-xs font-semibold text-white/80">Tanvir Ahmed</p>
                  <p className="text-xs text-white/40">Software Engineer</p>
                </div>
              </div>
            </blockquote>
          </div>
        </div>

        {/* ── Right panel — auth card ────────────────────────────────── */}
        <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-base font-bold text-white">
              Amar<span className="text-violet-400">Quiz</span>
            </span>
          </div>

          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
