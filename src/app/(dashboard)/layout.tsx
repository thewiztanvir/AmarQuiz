import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Library, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Library", href: "/library", icon: Library },
    { label: "Quizzes", href: "/quizzes", icon: BookOpen },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0d0d14] lg:flex">
        {/* Brand */}
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
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
            <span className="font-bold">
              Amar<span className="text-violet-400">Quiz</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Active state placeholder logic — expand when routing is fully implemented
            const isActive = item.href === "/dashboard";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold uppercase text-white">
              {session.user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-white/50">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0f] px-6">
          <div className="flex items-center gap-4 lg:hidden">
            {/* Mobile menu button placeholder */}
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
          </div>
          <div className="flex flex-1 justify-end">
            {/* Sign out button placeholder (client action required) */}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
