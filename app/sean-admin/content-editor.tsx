"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type PortfolioContentRow = {
  id: string;
  profile: unknown;
  projects: unknown;
};

type ProfileShape = {
  aboutText?: string;
  aboutImage?: string;
  [key: string]: unknown;
};

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  tone: "success" | "error";
};

function toProfileShape(value: unknown): ProfileShape {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as ProfileShape;
  }

  return {};
}

const defaultAboutText =
  "Hi! I'm Sean, a 23-year-old Front-End Developer passionate about modern design, smooth interactions, and responsive user interfaces.";
const defaultAboutImage = "/image/Sean.jpg";
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "portfolio-images";

export default function ContentEditor({ initialRow }: { initialRow: PortfolioContentRow }) {
  const [supabase] = useState(() => createClient());
  const initialProfile = useMemo(() => toProfileShape(initialRow.profile), [initialRow.profile]);
  const [aboutText, setAboutText] = useState(
    typeof initialProfile.aboutText === "string" && initialProfile.aboutText.trim()
      ? initialProfile.aboutText
      : defaultAboutText,
  );
  const [aboutImage, setAboutImage] = useState(
    typeof initialProfile.aboutImage === "string" && initialProfile.aboutImage.trim()
      ? initialProfile.aboutImage
      : defaultAboutImage,
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSavingText, setIsSavingText] = useState(false);
  const [isSavingImageUrl, setIsSavingImageUrl] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [statusText, setStatusText] = useState("Realtime sync active.");
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    title: "",
    message: "",
    tone: "success",
  });

  useEffect(() => {
    if (!modalState.open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setModalState((current) => ({ ...current, open: false }));
    }, 2600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalState.open]);

  useEffect(() => {
    const channel = supabase
      .channel("portfolio-content-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_content",
          filter: "id=eq.main",
        },
        (payload) => {
          const nextProfile = toProfileShape((payload.new as { profile?: unknown } | null)?.profile);

          if (typeof nextProfile.aboutText === "string" && nextProfile.aboutText.trim()) {
            setAboutText(nextProfile.aboutText);
          }

          if (typeof nextProfile.aboutImage === "string" && nextProfile.aboutImage.trim()) {
            setAboutImage(nextProfile.aboutImage);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const showModal = (tone: "success" | "error", title: string, message: string) => {
    setModalState({
      open: true,
      tone,
      title,
      message,
    });
  };

  const saveProfilePatch = async (patch: Partial<ProfileShape>) => {
    const { data: latestRow, error: readError } = await supabase
      .from("portfolio_content")
      .select("id, profile, projects")
      .eq("id", "main")
      .maybeSingle<PortfolioContentRow>();

    if (readError) {
      return {
        ok: false as const,
        message: `Read failed. ${readError.message}`,
      };
    }

    const latestProfile = toProfileShape(latestRow?.profile);
    const nextProfile: ProfileShape = {
      ...latestProfile,
      ...patch,
    };

    const { data: savedRow, error: saveError } = await supabase
      .from("portfolio_content")
      .upsert(
        {
          id: "main",
          profile: nextProfile,
          projects: latestRow?.projects ?? initialRow.projects ?? [],
        },
        { onConflict: "id" },
      )
      .select("id, profile, projects")
      .single<PortfolioContentRow>();

    if (saveError || !savedRow) {
      return {
        ok: false as const,
        message: `Save failed. ${saveError?.message ?? "Unknown error"}`,
      };
    }

    return {
      ok: true as const,
      row: savedRow,
    };
  };

  const handleSaveAboutText = async () => {
    setIsSavingText(true);
    setStatusText("Saving About text...");

    const result = await saveProfilePatch({ aboutText });
    setIsSavingText(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProfile = toProfileShape(result.row.profile);
    setAboutText(
      typeof savedProfile.aboutText === "string" && savedProfile.aboutText.trim()
        ? savedProfile.aboutText
        : defaultAboutText,
    );
    setStatusText("About text saved.");
    showModal("success", "Saved", "About text updated successfully.");
  };

  const handleSaveImageUrl = async () => {
    if (!aboutImage.trim()) {
      const message = "Image URL/path cannot be empty.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    setIsSavingImageUrl(true);
    setStatusText("Saving About image URL...");

    const result = await saveProfilePatch({ aboutImage: aboutImage.trim() });
    setIsSavingImageUrl(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProfile = toProfileShape(result.row.profile);
    setAboutImage(
      typeof savedProfile.aboutImage === "string" && savedProfile.aboutImage.trim()
        ? savedProfile.aboutImage
        : defaultAboutImage,
    );
    setStatusText("About image URL saved.");
    showModal("success", "Saved", "About image URL updated successfully.");
  };

  const handleUploadImageFile = async () => {
    if (!selectedImageFile) {
      const message = "Select an image file first.";
      setStatusText(message);
      showModal("error", "Upload Error", message);
      return;
    }

    setIsUploadingImage(true);
    setStatusText("Uploading image file...");

    const extension = selectedImageFile.name.includes(".")
      ? selectedImageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : "jpg";
    const sanitizedExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `about/${Date.now()}-${Math.random().toString(36).slice(2)}.${sanitizedExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, selectedImageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setIsUploadingImage(false);
      const message = `Upload failed. ${uploadError.message}`;
      setStatusText(message);
      showModal("error", "Upload Failed", message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;
    setAboutImage(publicUrl);

    const result = await saveProfilePatch({ aboutImage: publicUrl });
    setIsUploadingImage(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProfile = toProfileShape(result.row.profile);
    setAboutImage(
      typeof savedProfile.aboutImage === "string" && savedProfile.aboutImage.trim()
        ? savedProfile.aboutImage
        : defaultAboutImage,
    );
    setStatusText("Image uploaded and saved.");
    setSelectedImageFile(null);
    showModal("success", "Upload Complete", "Image uploaded and About picture updated.");
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#041022]/82 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_20px_50px_rgba(0,0,0,0.5)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_45%_at_6%_6%,rgba(34,211,238,0.12),transparent_58%),radial-gradient(58%_36%_at_95%_96%,rgba(251,146,60,0.12),transparent_62%)]" />

      <header className="relative z-10 mb-5 space-y-3">
        <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Profile Node :: About
        </p>
        <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-cyan-100 sm:text-2xl">
          About Me Editor
        </h2>
        <p className="text-sm text-cyan-100/75">
          Save your About text and picture URL into `portfolio_content.profile` on row `id =
          &quot;main&quot;`.
        </p>
        <p className="inline-flex rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">
          {statusText}
        </p>
      </header>

      <div className="relative z-10 space-y-4">
        <section className="rounded-xl border border-cyan-300/20 bg-[#071021]/75 p-4 sm:p-5">
          <label className="mb-2 block text-[0.69rem] font-semibold uppercase tracking-[0.18em] text-cyan-200/85">
            About Text
          </label>
          <textarea
            value={aboutText}
            onChange={(event) => setAboutText(event.target.value)}
            className="h-44 w-full rounded-lg border border-cyan-300/25 bg-[#050b18] p-3 text-sm text-cyan-50 outline-none shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)] transition focus:border-cyan-300/55 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.16)]"
          />
          <button
            type="button"
            onClick={handleSaveAboutText}
            disabled={isSavingText}
            className="mt-3 rounded-lg border border-emerald-300/45 bg-emerald-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/25 hover:shadow-[0_0_18px_rgba(16,185,129,0.28)] disabled:cursor-wait disabled:opacity-75"
          >
            {isSavingText ? "Saving..." : "Save About Text"}
          </button>
        </section>

        <section className="rounded-xl border border-orange-300/20 bg-[#111019]/75 p-4 sm:p-5">
          <label className="mb-2 block text-[0.69rem] font-semibold uppercase tracking-[0.18em] text-orange-200/85">
            About Picture URL or Path
          </label>
          <input
            type="text"
            value={aboutImage}
            onChange={(event) => setAboutImage(event.target.value)}
            placeholder="/image/Sean.jpg or https://..."
            className="w-full rounded-lg border border-orange-300/25 bg-[#0d0812] p-3 text-sm text-orange-50 outline-none placeholder:text-orange-200/35 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.07)] transition focus:border-orange-300/55 focus:shadow-[0_0_0_2px_rgba(251,146,60,0.16)]"
          />
          <p className="mt-2 text-xs text-orange-100/70">
            Use `/image/your-file.jpg` for files inside `public/image`, or a full HTTPS image URL.
          </p>
          <button
            type="button"
            onClick={handleSaveImageUrl}
            disabled={isSavingImageUrl}
            className="mt-3 rounded-lg border border-orange-300/45 bg-orange-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-100 transition hover:bg-orange-500/25 hover:shadow-[0_0_18px_rgba(251,146,60,0.26)] disabled:cursor-wait disabled:opacity-75"
          >
            {isSavingImageUrl ? "Saving..." : "Save Image URL"}
          </button>
        </section>

        <section className="rounded-xl border border-fuchsia-300/20 bg-[#14091b]/75 p-4 sm:p-5">
          <p className="mb-2 text-[0.69rem] font-semibold uppercase tracking-[0.18em] text-fuchsia-200/85">
            Upload Picture File
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setSelectedImageFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-lg border border-fuchsia-300/25 bg-[#1a0c24] p-2 text-sm text-fuchsia-50 file:mr-3 file:rounded file:border-0 file:bg-fuchsia-500/25 file:px-3 file:py-2 file:text-[0.68rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-fuchsia-100 hover:file:bg-fuchsia-500/35"
          />
          <p className="mt-2 text-xs text-fuchsia-100/70">
            Bucket: <span className="font-semibold">{storageBucket}</span>
          </p>
          <button
            type="button"
            onClick={handleUploadImageFile}
            disabled={isUploadingImage}
            className="mt-3 rounded-lg border border-fuchsia-300/45 bg-fuchsia-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:bg-fuchsia-500/25 hover:shadow-[0_0_18px_rgba(217,70,239,0.3)] disabled:cursor-wait disabled:opacity-75"
          >
            {isUploadingImage ? "Uploading..." : "Upload + Save Picture"}
          </button>
        </section>

        <section className="rounded-xl border border-cyan-300/20 bg-[#071021]/75 p-4 sm:p-5">
          <p className="mb-3 text-[0.69rem] font-semibold uppercase tracking-[0.18em] text-cyan-200/85">
            Live Preview
          </p>
          <div className="relative h-52 w-52 overflow-hidden rounded-xl border border-cyan-300/25 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aboutImage || defaultAboutImage}
              alt="About preview"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = defaultAboutImage;
              }}
            />
          </div>
        </section>
      </div>

      {modalState.open ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border p-5 shadow-[0_0_35px_rgba(34,211,238,0.18)] ${
              modalState.tone === "success"
                ? "border-emerald-300/45 bg-[#041810]"
                : "border-rose-300/45 bg-[#1b0912]"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-r from-transparent via-cyan-200/10 to-transparent" />
            <p
              className={`relative text-xs font-semibold uppercase tracking-[0.2em] ${
                modalState.tone === "success" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {modalState.tone === "success" ? "Cyberpunk Success" : "Cyberpunk Error"}
            </p>
            <h3 className="relative mt-2 text-lg font-semibold uppercase tracking-[0.06em] text-cyan-100">
              {modalState.title}
            </h3>
            <p className="relative mt-2 text-sm text-cyan-100/85">{modalState.message}</p>
            <div className="relative mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setModalState((current) => ({ ...current, open: false }))}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
