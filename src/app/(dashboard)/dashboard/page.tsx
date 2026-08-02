import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpen, Target, BrainCircuit, Activity } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  description: "Your personalized learning dashboard.",
};

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { name } = session.user;
  const firstName = name.split(" ")[0];

  const stats = [
    { label: "Quizzes Taken", value: "0", icon: BookOpen, color: "text-violet-400" },
    { label: "Average Score", value: "0%", icon: Target, color: "text-cyan-400" },
    { label: "Flashcards Mastered", value: "0", icon: BrainCircuit, color: "text-emerald-400" },
    { label: "Learning Streak", value: "0 Days", icon: Activity, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-white/60">
          Ready to continue mastering your topics?
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="col-span-2 rounded-xl border border-white/10 bg-[#0d0d14] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/5">
            <div className="text-center">
              <p className="text-sm text-white/50">No recent activity found.</p>
              <button className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500">
                Generate a Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Recommended topics */}
        <div className="rounded-xl border border-white/10 bg-[#0d0d14] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recommended</h2>
          <div className="space-y-3">
            {[
              "React Hooks Deep Dive",
              "Advanced TypeScript",
              "Next.js App Router",
            ].map((topic, i) => (
              <div
                key={i}
                className="group flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-violet-500/30 hover:bg-white/10"
              >
                <span className="text-sm font-medium text-white/80 group-hover:text-white">
                  {topic}
                </span>
                <BookOpen className="h-4 w-4 text-white/30 group-hover:text-violet-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
