"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/sean-portfolio");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-xl border border-green-300/45 bg-green-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-green-100 shadow-[0_0_0_1px_rgba(251,146,60,0.18)] transition hover:bg-green-400/20 hover:shadow-[0_0_18px_rgba(251,146,60,0.3)] disabled:cursor-wait disabled:opacity-80"
    >
      View Main Page
    </button>
  );
}
