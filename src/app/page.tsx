import Link from "next/link";
import { ArrowRight, Sparkles, Shield, BrainCircuit, LineChart } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  const features = [
    {
      title: "AI-Powered Generation",
      description: "Create high-quality quizzes instantly from any topic, text, or document using advanced AI models.",
      icon: Sparkles,
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Encrypted API Vault",
      description: "Bring your own keys safely. Your AI API keys are encrypted and never exposed to the client.",
      icon: Shield,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Spaced Repetition",
      description: "Review mistakes with AI explanations and master difficult concepts using intelligent flashcards.",
      icon: BrainCircuit,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Progress Analytics",
      description: "Track your learning journey with detailed insights, scores, and personalized recommendations.",
      icon: LineChart,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% -20%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(circle at 100% 50%, rgba(6,182,212,0.1) 0%, transparent 40%)",
        }}
      />

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
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
          <span className="text-xl font-bold text-white">
            Amar<span className="text-violet-400">Quiz</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 pb-20 pt-32 text-center lg:px-12 lg:pt-40">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 backdrop-blur-sm mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AmarQuiz 2.0 is here</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Master any subject with{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              }}
            >
              AI-powered learning
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50 sm:text-xl">
            Generate quizzes, understand your mistakes with AI explanations, and build long-term retention through intelligent practice.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white transition-all hover:shadow-[0_0_32px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-100"
            >
              Start Learning for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-white/10 hover:border-white/20"
            >
              View Features
            </a>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-6 py-24 lg:px-12 bg-[#0d0d14]/50 border-t border-white/5 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Everything you need to learn faster
              </h2>
              <p className="mt-4 text-white/50">
                A complete platform designed to help you understand, practice, and master concepts.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 hover:border-white/20"
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        <p>© {new Date().getFullYear()} AmarQuiz. Built for modern learners.</p>
      </footer>
    </div>
  );
}
