import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/sidebar";
import { SignOutButton } from "./_components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("Checking session in dashboard layout...");
  const { data: session, error } = await auth.getSession();
  console.log("Session result:", session ? "Found user" : "No user", error);

  if (!session?.user) {
    redirect("/sign-in");
  }


  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar user={session.user} />

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
            <SignOutButton />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
