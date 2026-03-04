import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";
import ViewMainPageButton from "./view-mainpage";
import ContentEditor, { type PortfolioContentRow } from "./content-editor";
import { Orbitron, Rajdhani } from "next/font/google";

type PortfolioProfileDbRow = {
  id: string;
  about_text: string | null;
  about_image: string | null;
};

type PortfolioProjectDbRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  image: string;
  tech: unknown;
  live_url: string | null;
  project_type: "app" | "web" | null;
  is_private: boolean;
  sort_order: number;
};

type PortfolioFigmaProjectDbRow = {
  id: string;
  owner_id: string;
  title: string;
  src: string;
  sort_order: number;
};

type PortfolioTechStackDbRow = {
  id: string;
  owner_id: string;
  name: string;
  category: "tech" | "tool";
  logo_url: string | null;
  sort_order: number;
};

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

  const { data: profileRow } = await supabase
    .from("portfolio_profile")
    .select("id, about_text, about_image")
    .eq("id", "main")
    .maybeSingle<PortfolioProfileDbRow>();

  const { data: projectRows } = await supabase
    .from("portfolio_projects")
    .select("id, owner_id, title, description, image, tech, live_url, project_type, is_private, sort_order")
    .eq("owner_id", "main")
    .order("sort_order", { ascending: true })
    .returns<PortfolioProjectDbRow[]>();

  const { data: figmaRows } = await supabase
    .from("portfolio_figma_projects")
    .select("id, owner_id, title, src, sort_order")
    .eq("owner_id", "main")
    .order("sort_order", { ascending: true })
    .returns<PortfolioFigmaProjectDbRow[]>();

  const { data: techStackRows } = await supabase
    .from("portfolio_tech_stack_items")
    .select("id, owner_id, name, category, logo_url, sort_order")
    .eq("owner_id", "main")
    .order("sort_order", { ascending: true })
    .returns<PortfolioTechStackDbRow[]>();

  const initialProfile = {
    aboutText: profileRow?.about_text ?? "",
    aboutImage: profileRow?.about_image ?? "",
    figmaProjects: (figmaRows ?? []).map((row) => ({
      title: row.title,
      src: row.src,
    })),
  };

  const initialProjects = (projectRows ?? []).map((row) => ({
    title: row.title,
    description: row.description,
    image: row.image,
    tech: row.tech,
    liveUrl: row.live_url ?? undefined,
    type: row.project_type ?? undefined,
    private: row.is_private ? true : undefined,
  }));

  const initialRow: PortfolioContentRow = {
    id: "main",
    profile: initialProfile,
    projects: initialProjects,
    figmaProjects: initialProfile.figmaProjects,
    techStackItems: (techStackRows ?? []).map((row) => ({
      name: row.name,
      category: row.category,
      logoUrl: row.logo_url ?? undefined,
    })),
  };

  const userEmail = userData.user.email ?? "unknown";

  return (
    <main className={`cyber-portfolio relative font-sans cursor-default overflow-hidden ${bodyFont.className}`}>
      <div className="bg-layer bg-gradient" />
      <div className="bg-layer bg-grid" />
      <div className="bg-layer bg-scanlines" />
      <div className="orb orb-left" />
      <div className="orb orb-right" />


      <section className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-3 pb-8 sm:px-6 sm:pt-4 sm:pb-10">
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
                Signed in as <span className="font-semibold text-cyan-100">{userEmail}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ViewMainPageButton />
              <SignOutButton />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/5 px-4 py-3">
              <p className="text-md uppercase tracking-[0.16em] text-cyan-300">Realtime</p>
              <p className="mt-2 text-sm font-semibold text-cyan-100 animate-pulse">Active Stream</p>
            </div>
            <div className="rounded-xl border border-orange-300/25 bg-orange-400/5 px-4 py-3">
              <p className="text-md uppercase tracking-[0.16em] text-orange-300">Editor Node</p>
              <p className="mt-2 text-sm font-semibold text-orange-100">Profile Patch Ready</p>
            </div>
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/5 px-4 py-3">
              <p className="text-md uppercase tracking-[0.16em] text-emerald-300">Auth Gate</p>
              <p className="mt-2 text-sm font-semibold text-emerald-100">Secure Session</p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
        
          <ContentEditor initialRow={initialRow} />

          <article className="mt-10 rounded-2xl border border-fuchsia-300/25 bg-[#120818]/78 p-5 shadow-[0_0_0_1px_rgba(217,70,239,0.12),0_18px_45px_rgba(0,0,0,0.4)]">
            <h2 className={`text-lg font-semibold uppercase tracking-[0.08em] text-fuchsia-100 ${headingFont.className}`}>
              Security Status
            </h2>
            <p className="mt-2 text-base text-fuchsia-100/80">
              Route protection is active. Dashboard requires authenticated login via Supabase Auth.
            </p>
          </article>
        </section>
      </section>
    </main >
  );
}
