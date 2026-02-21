import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";
import ViewMainPageButton from "./view-mainpage";
import ContentEditor, { type PortfolioContentRow } from "./content-editor";
import { Orbitron, Rajdhani } from "next/font/google";

const headingFont = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function SeanAdminPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/sean-login");
  }

  const { data: contentRow } = await supabase
    .from("portfolio_content")
    .select("id, profile, projects")
    .eq("id", "main")
    .maybeSingle<PortfolioContentRow>();

  const userEmail = userData.user.email ?? "unknown";

  return (
    <main className={`relative min-h-screen overflow-hidden px-4 py-8 text-cyan-50 sm:px-6 sm:py-10 ${bodyFont.className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_52%_at_12%_18%,rgba(34,211,238,0.22),transparent_60%),radial-gradient(52%_38%_at_88%_86%,rgba(251,146,60,0.2),transparent_62%),linear-gradient(160deg,#04060e_8%,#091528_48%,#05050b_97%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.075)_1px,transparent_1px)] bg-size-[44px_44px] opacity-65" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.035)_0_1px,transparent_1px_4px)] mix-blend-soft-light opacity-35" />
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-orange-400/15 blur-3xl animate-pulse" />

      <section className="relative z-10 mx-auto max-w-5xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-cyan-300/35 bg-[#050a16]/82 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_28px_70px_rgba(0,0,0,0.5),0_0_28px_rgba(34,211,238,0.18)] sm:p-8">
          <div className="pointer-events-none absolute -inset-x-12 top-0 h-20 bg-linear-to-r from-transparent via-cyan-300/10 to-transparent blur-xl" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[0.67rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Admin Core
              </p>
              <h1 className={`mt-3 text-3xl font-semibold uppercase tracking-[0.08em] text-cyan-100 sm:text-4xl ${headingFont.className}`}>
                Welcome, Master Sean!
              </h1>
              <p className="mt-3 text-base text-cyan-100/80 sm:text-lg">
                Signed in as <span className="font-semibold text-cyan-100">{userEmail}</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ViewMainPageButton />
              <SignOutButton />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/5 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-cyan-300">Realtime</p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">Active Stream</p>
            </div>
            <div className="rounded-xl border border-orange-300/25 bg-orange-400/5 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-orange-300">Editor Node</p>
              <p className="mt-1 text-sm font-semibold text-orange-100">Profile Patch Ready</p>
            </div>
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/5 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-emerald-300">Auth Gate</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">Secure Session</p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="rounded-2xl border border-cyan-300/25 bg-[#050a16]/72 p-2 shadow-[0_0_0_1px_rgba(34,211,238,0.1),0_20px_50px_rgba(0,0,0,0.45)]">
            <ContentEditor initialRow={contentRow ?? { id: "main", profile: {}, projects: [] }} />
          </div>

          <article className="rounded-2xl border border-fuchsia-300/25 bg-[#120818]/78 p-5 shadow-[0_0_0_1px_rgba(217,70,239,0.12),0_18px_45px_rgba(0,0,0,0.4)]">
            <h2 className={`text-lg font-semibold uppercase tracking-[0.08em] text-fuchsia-100 ${headingFont.className}`}>
              Security Status
            </h2>
            <p className="mt-2 text-base text-fuchsia-100/80">
              Route protection is active. Dashboard requires authenticated login via Supabase Auth.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
