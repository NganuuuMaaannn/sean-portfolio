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

type ProjectShape = {
  title: string;
  description: string;
  image: string;
  tech: string[];
  liveUrl?: string;
  type?: "app" | "web";
  private?: boolean;
};

type ProjectLinkMode = "live" | "repo" | "private";

type NewProjectForm = {
  title: string;
  description: string;
  link: string;
  techStack: string;
  linkMode: ProjectLinkMode;
};

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  tone: "success" | "error";
};

type ProjectDecisionAction =
  | { kind: "submit" }
  | { kind: "delete"; index: number }
  | { kind: "reset" };

type ProjectDecisionState = {
  open: boolean;
  title: string;
  message: string;
  action: ProjectDecisionAction | null;
};

function toProfileShape(value: unknown): ProfileShape {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as ProfileShape;
  }

  return {};
}

function toProjectShapeList(value: unknown): ProjectShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): ProjectShape | null => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const description = typeof record.description === "string" ? record.description.trim() : "";
      const image = typeof record.image === "string" ? record.image.trim() : "";
      const tech = Array.isArray(record.tech)
        ? record.tech
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
        : [];

      if (!title || !description || !image || tech.length === 0) {
        return null;
      }

      const liveUrl =
        typeof record.liveUrl === "string" && record.liveUrl.trim()
          ? record.liveUrl.trim()
          : undefined;
      const type = record.type === "app" || record.type === "web" ? record.type : undefined;
      const isPrivate = typeof record.private === "boolean" ? record.private : undefined;

      const normalizedProject: ProjectShape = {
        title,
        description,
        image,
        tech,
      };

      if (liveUrl) {
        normalizedProject.liveUrl = liveUrl;
      }

      if (type) {
        normalizedProject.type = type;
      }

      if (isPrivate !== undefined) {
        normalizedProject.private = isPrivate;
      }

      return normalizedProject;
    })
    .filter((entry): entry is ProjectShape => entry !== null);
}

function normalizeTechStack(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function getProjectLinkLabel(project: ProjectShape): string {
  if (project.private) {
    return "Private Repository";
  }

  return project.type === "app" ? "Check Repository" : "Check Live Screen";
}

function getProjectLinkMode(project: ProjectShape): ProjectLinkMode {
  if (project.private) {
    return "private";
  }

  return project.type === "app" ? "repo" : "live";
}

const emptyProjectForm: NewProjectForm = {
  title: "",
  description: "",
  link: "",
  techStack: "",
  linkMode: "live",
};

const defaultAboutText =
  "Hi! I'm Sean, a 23-year-old Front-End Developer passionate about modern design, smooth interactions, and responsive user interfaces.";
const defaultAboutImage = "/image/Sean.jpg";
const fallbackProjectImage = "/image/portfolio.png";
const defaultProjects: ProjectShape[] = [
  {
    title: "BayadBox",
    description: "An Automated Fare Collection System Using IoT for PUV.",
    image: "/image/bayadbox.png",
    tech: ["React Native", "TypeScript", "Supabase"],
    liveUrl: "https://github.com/NganuuuMaaannn/bayadBox",
    type: "app",
  },
  {
    title: "Think A Goal",
    description: "A Goal Management Application using Expo CLI.",
    image: "/image/think-a-goal.png",
    tech: ["React Native", "JavaScript", "Firebase"],
    liveUrl: "https://github.com/NganuuuMaaannn/think-a-goal",
    type: "app",
  },
  {
    title: "Love, Davao",
    description:
      "A web project showcasing Davao City's culture, attractions, and the 11 Indigenous Tribes of Davao.",
    image: "/image/love-davao.png",
    tech: ["Next.js", "Tailwind CSS", "TypeScript"],
    liveUrl: "https://love-davao.vercel.app",
    type: "web",
  },
  {
    title: "HCDC ITS Online Membership System",
    description:
      "Online Membership Fee Management System with Attendance Monitoring for ITS Organization.",
    image: "/image/onlinememfee.png",
    tech: ["Next.js", "Tailwind CSS", "PostgreSQL"],
    liveUrl: "https://hcdc-itsociety.vercel.app",
    type: "web",
  },
  {
    title: "HCDC Comelec Voting System",
    description:
      "Online Voting System for HCDC Comelec Elections with secure authentication and real-time results.",
    image: "/image/hcdc-comelec.png",
    tech: ["Next.js", "Tailwind CSS", "PostgreSQL"],
    liveUrl: "https://github.com/NganuuuMaaannn/HCDC-Comelec-2025",
    private: true,
  },
  {
    title: "Portfolio Website",
    description:
      "A modern, responsive portfolio built with Next.js, Tailwind CSS, and TypeScript to showcase my front-end and UI/UX skills.",
    image: "/image/portfolio.png",
    tech: ["Next.js", "Tailwind CSS", "TypeScript"],
    liveUrl: "https://seanmichaeldoinog.vercel.app/sean-portfolio",
    type: "web",
  },
];
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "portfolio-images";

export default function ContentEditor({ initialRow }: { initialRow: PortfolioContentRow }) {
  const [supabase] = useState(() => createClient());
  const initialProfile = useMemo(() => toProfileShape(initialRow.profile), [initialRow.profile]);
  const initialProjects = useMemo(() => {
    const parsedProjects = toProjectShapeList(initialRow.projects);
    return parsedProjects.length > 0 ? parsedProjects : defaultProjects;
  }, [initialRow.projects]);
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
  const [projects, setProjects] = useState<ProjectShape[]>(initialProjects);
  const [isSavingProjects, setIsSavingProjects] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<"add" | "edit">("add");
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>(emptyProjectForm);
  const [newProjectImageFile, setNewProjectImageFile] = useState<File | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectDecisionState, setProjectDecisionState] = useState<ProjectDecisionState>({
    open: false,
    title: "",
    message: "",
    action: null,
  });
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
          const nextRow = payload.new as { profile?: unknown; projects?: unknown } | null;
          if (!nextRow) {
            return;
          }

          if (Object.prototype.hasOwnProperty.call(nextRow, "profile")) {
            const nextProfile = toProfileShape(nextRow.profile);

            if (typeof nextProfile.aboutText === "string" && nextProfile.aboutText.trim()) {
              setAboutText(nextProfile.aboutText);
            }

            if (typeof nextProfile.aboutImage === "string" && nextProfile.aboutImage.trim()) {
              setAboutImage(nextProfile.aboutImage);
            }
          }

          if (Object.prototype.hasOwnProperty.call(nextRow, "projects")) {
            const nextProjects = toProjectShapeList(nextRow.projects);
            setProjects(nextProjects.length > 0 ? nextProjects : defaultProjects);
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

  const saveProjectsPatch = async (projectsPatch: ProjectShape[]) => {
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
    const { data: savedRow, error: saveError } = await supabase
      .from("portfolio_content")
      .upsert(
        {
          id: "main",
          profile: latestProfile,
          projects: projectsPatch,
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

  const askProjectDecision = (
    title: string,
    message: string,
    action: ProjectDecisionAction,
  ) => {
    if (isAddingProject || isSavingProjects) {
      return;
    }

    setProjectDecisionState({
      open: true,
      title,
      message,
      action,
    });
  };

  const handleOpenAddProjectModal = () => {
    setProjectModalMode("add");
    setEditingProjectIndex(null);
    setNewProjectForm(emptyProjectForm);
    setNewProjectImageFile(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProjectModal = (projectIndex: number) => {
    const projectToEdit = projects[projectIndex];
    if (!projectToEdit) {
      return;
    }

    setProjectModalMode("edit");
    setEditingProjectIndex(projectIndex);
    setNewProjectForm({
      title: projectToEdit.title,
      description: projectToEdit.description,
      link: projectToEdit.liveUrl ?? "",
      techStack: projectToEdit.tech.join(", "),
      linkMode: getProjectLinkMode(projectToEdit),
    });
    setNewProjectImageFile(null);
    setIsProjectModalOpen(true);
  };

  const handleCloseAddProjectModal = () => {
    if (isAddingProject || isSavingProjects) {
      return;
    }

    setProjectModalMode("add");
    setEditingProjectIndex(null);
    setIsProjectModalOpen(false);
  };

  const handleRequestProjectSubmit = () => {
    askProjectDecision(
      projectModalMode === "edit" ? "Confirm Edit" : "Confirm Add",
      projectModalMode === "edit"
        ? "Are you sure you want to save changes to this project?"
        : "Are you sure you want to add this project?",
      { kind: "submit" },
    );
  };

  const handleAddProject = async () => {
    const isEditingProject = projectModalMode === "edit" && editingProjectIndex !== null;
    const currentEditingProject = isEditingProject ? projects[editingProjectIndex] : null;
    const title = newProjectForm.title.trim();
    const description = newProjectForm.description.trim();
    const link = newProjectForm.link.trim();
    const tech = normalizeTechStack(newProjectForm.techStack);

    if (isEditingProject && !currentEditingProject) {
      const message = "Selected project no longer exists. Reopen the editor and try again.";
      setStatusText(message);
      showModal("error", "Edit Error", message);
      return;
    }

    if (!newProjectImageFile && !currentEditingProject) {
      const message = "Select a project image before adding the tile.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    if (!title || !description || tech.length === 0) {
      const message = "Project name, description, and tech stack are required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    if (newProjectForm.linkMode !== "private" && !link) {
      const message = "Link is required for Check Live Screen and Check Repository.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    setIsAddingProject(true);
    setStatusText(
      newProjectImageFile
        ? "Uploading project picture..."
        : isEditingProject
          ? "Updating project tile..."
          : "Adding project tile...",
    );

    let imageUrl = currentEditingProject?.image ?? "";
    if (newProjectImageFile) {
      const extension = newProjectImageFile.name.includes(".")
        ? newProjectImageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
        : "jpg";
      const sanitizedExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${sanitizedExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, newProjectImageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setIsAddingProject(false);
        const message = `Upload failed. ${uploadError.message}`;
        setStatusText(message);
        showModal("error", "Upload Failed", message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
      imageUrl = publicUrlData.publicUrl;
    }

    if (!imageUrl) {
      setIsAddingProject(false);
      const message = "Project image is required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    const nextProject: ProjectShape = {
      title,
      description,
      image: imageUrl,
      tech,
      ...(newProjectForm.linkMode === "private"
        ? { private: true }
        : {
          liveUrl: link,
          type: newProjectForm.linkMode === "repo" ? "app" : "web",
        }),
    };

    const nextProjects =
      isEditingProject && editingProjectIndex !== null
        ? projects.map((project, index) => (index === editingProjectIndex ? nextProject : project))
        : [...projects, nextProject];

    setIsSavingProjects(true);
    setStatusText(isEditingProject ? "Saving project changes..." : "Saving new project...");
    const saveResult = await saveProjectsPatch(nextProjects);
    setIsSavingProjects(false);
    setIsAddingProject(false);

    if (!saveResult.ok) {
      setStatusText(saveResult.message);
      showModal("error", "Save Failed", saveResult.message);
      return;
    }

    const savedProjects = toProjectShapeList(saveResult.row.projects);
    setProjects(savedProjects.length > 0 ? savedProjects : defaultProjects);

    setIsProjectModalOpen(false);
    setProjectModalMode("add");
    setEditingProjectIndex(null);
    setNewProjectForm(emptyProjectForm);
    setNewProjectImageFile(null);
    if (isEditingProject) {
      setStatusText("Project tile updated and saved.");
      showModal(
        "success",
        "Project Updated",
        "Project tile updated successfully.",
      );
      return;
    }

    setStatusText("Project tile added and saved.");
    showModal(
      "success",
      "Project Added",
      "Project tile added successfully.",
    );
  };

  const handleRequestDeleteProject = (indexToRemove: number) => {
    const targetProject = projects[indexToRemove];
    if (!targetProject) {
      return;
    }

    askProjectDecision(
      "Confirm Delete",
      `Are you sure you want to remove \"${targetProject.title}\"?`,
      { kind: "delete", index: indexToRemove },
    );
  };

  const handleRemoveProject = async (indexToRemove: number) => {
    const nextProjects = projects.filter((_, index) => index !== indexToRemove);
    setIsSavingProjects(true);
    setStatusText("Removing project tile...");
    const result = await saveProjectsPatch(nextProjects);
    setIsSavingProjects(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProjects = toProjectShapeList(result.row.projects);
    setProjects(savedProjects.length > 0 ? savedProjects : defaultProjects);
    setStatusText("Project tile removed and saved.");
    showModal("success", "Project Removed", "Project tile removed successfully.");
  };

  const handleRequestResetProjects = () => {
    askProjectDecision(
      "Confirm Reset",
      "Are you sure you want to reset all project tiles to default?",
      { kind: "reset" },
    );
  };

  const handleResetProjectsToDefault = async () => {
    setIsSavingProjects(true);
    setStatusText("Resetting projects to default...");
    const result = await saveProjectsPatch(defaultProjects);
    setIsSavingProjects(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProjects = toProjectShapeList(result.row.projects);
    setProjects(savedProjects.length > 0 ? savedProjects : defaultProjects);
    setStatusText("Projects reset to default and saved.");
    showModal("success", "Projects Reset", "Default project tiles restored.");
  };

  const handleConfirmProjectDecision = async () => {
    const action = projectDecisionState.action;
    if (!action) {
      return;
    }

    setProjectDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });

    if (action.kind === "submit") {
      await handleAddProject();
      return;
    }

    if (action.kind === "delete") {
      await handleRemoveProject(action.index);
      return;
    }

    await handleResetProjectsToDefault();
  };

  const handleCancelProjectDecision = () => {
    if (isAddingProject || isSavingProjects) {
      return;
    }

    setProjectDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });
  };

  const isProjectActionBusy = isAddingProject || isSavingProjects;

  return (
    <div className="space-y-4 ">
      <h1 className="text-4xl md:text-5xl font-bold text-center mt-20 text-cyan-100">
        About Me
      </h1>
      <div className="space-y-4">
        <section className="rounded-2xl border border-cyan-300/25 bg-[#051227]/72 p-4 sm:p-5">
          <div className="space-y-4">
            <section className="rounded-xl border border-cyan-300/20 bg-[#071021]/75 p-4 sm:p-5">
              <label className="mb-2 block text-md font-semibold uppercase tracking-[0.18em] text-cyan-200/85">
                About Text
              </label>
              <textarea
                value={aboutText}
                onChange={(event) => setAboutText(event.target.value)}
                className="h-44 w-full rounded-lg border border-cyan-300/25 bg-[#050b18] p-3 text-sm md:text-base text-cyan-50 outline-none shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)] transition focus:border-cyan-300/55 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.16)]"
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
              <label className="mb-2 block text-md font-semibold uppercase tracking-[0.18em] text-orange-200/85">
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
              <p className="mb-2 text-md font-semibold uppercase tracking-[0.18em] text-fuchsia-200/85">
                Upload Picture File
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setSelectedImageFile(event.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-fuchsia-300/25 bg-[#1a0c24] p-2 text-sm text-fuchsia-50 file:mr-3 file:rounded file:border-0 file:bg-fuchsia-500/25 file:px-3 file:py-2 file:text-[0.68rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-fuchsia-100 hover:file:bg-fuchsia-500/35"
              />
              <p className="mt-2 text-sm text-fuchsia-100/70">
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
              <p className="mb-3 text-md font-semibold uppercase tracking-[0.18em] text-cyan-200/85">
                Live Preview
              </p>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center cursor-default">
                <div className="h-52 overflow-y-auto rounded-xl border border-cyan-300/25 bg-[#050b18] p-3 text-sm md:text-base leading-relaxed text-cyan-100/90 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]">
                  {aboutText}
                </div>
                <div className="relative h-52 w-52 overflow-hidden rounded-xl border border-cyan-300/25 shadow-[0_0_18px_rgba(34,211,238,0.12)] md:justify-self-end">
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
              </div>
            </section>
          </div>
        </section>
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-20 text-cyan-100">
          My Project
        </h1>
        <section className="rounded-2xl border border-indigo-300/25 bg-[#0c1226]/74 p-4 sm:p-5">
          <section className="rounded-xl border border-indigo-300/20 bg-[#101327]/78 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold uppercase tracking-[0.18em] text-indigo-200/90">
                  My Projects Tiles
                </p>
                <p className="mt-1 text-sm text-indigo-100/70">
                  Manage every tile shown in `My Projects`.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRequestResetProjects}
                  disabled={isProjectActionBusy}
                  className="rounded-lg border border-indigo-300/45 bg-indigo-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100 transition hover:bg-indigo-500/25 hover:shadow-[0_0_18px_rgba(129,140,248,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  Reset to Default
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddProjectModal}
                  disabled={isProjectActionBusy}
                  className="rounded-lg border border-cyan-300/45 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/25 hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  + Add Project
                </button>
              </div>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {projects.map((project, index) => (
                  <article
                    key={`${project.title}-${index}`}
                    className="overflow-hidden rounded-xl border border-indigo-300/25 bg-[#0a1122]/80 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                  >
                    <div className="relative h-32 w-full overflow-hidden border-b border-indigo-300/15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = fallbackProjectImage;
                        }}
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProjectModal(index)}
                          disabled={isProjectActionBusy}
                          className="rounded-md border border-cyan-300/45 bg-cyan-500/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteProject(index)}
                          disabled={isProjectActionBusy}
                          className="rounded-md border border-rose-300/45 bg-rose-500/85 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-indigo-100">
                        {project.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-indigo-100/75">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map((tag, techIndex) => (
                          <span
                            key={`${tag}-${techIndex}`}
                            className="rounded border border-indigo-300/30 bg-indigo-500/10 px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-indigo-100/90"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p
                        className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${project.private ? "text-rose-300" : "text-emerald-200"
                          }`}
                      >
                        {getProjectLinkLabel(project)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-indigo-300/20 bg-[#070b18]/80 px-3 py-4 text-xs text-indigo-100/70">
                No project tiles yet. Click `+ Add Project` to create one.
              </p>
            )}

          </section>
        </section>

      </div>

      {isProjectModalOpen ? (
        <div className="fixed inset-0 z-95 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-indigo-300/40 bg-[#080f1f] p-5 shadow-[0_0_45px_rgba(79,70,229,0.32)] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-indigo-200/85">
                  {projectModalMode === "edit" ? "Edit Project Tile" : "New Project Tile"}
                </p>
                <h3 className="mt-1 text-lg font-semibold uppercase tracking-[0.06em] text-indigo-100">
                  {projectModalMode === "edit" ? "Edit Project" : "Add Project"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseAddProjectModal}
                disabled={isProjectActionBusy}
                className="rounded-md border border-indigo-300/45 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100 transition hover:bg-indigo-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
                  Picture Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewProjectImageFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-lg border border-indigo-300/25 bg-[#0d1527] p-2 text-sm text-indigo-50 file:mr-3 file:rounded file:border-0 file:bg-indigo-500/30 file:px-3 file:py-2 file:text-[0.68rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-indigo-100 hover:file:bg-indigo-500/40"
                />
                {projectModalMode === "edit" ? (
                  <p className="mt-1 text-[0.66rem] text-indigo-100/70">
                    Optional: leave empty to keep the current image.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectForm.title}
                  onChange={(event) =>
                    setNewProjectForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="My Project"
                  className="w-full rounded-lg border border-indigo-300/25 bg-[#0d1527] p-3 text-sm text-indigo-50 outline-none placeholder:text-indigo-100/35 focus:border-indigo-300/55 focus:shadow-[0_0_0_2px_rgba(129,140,248,0.16)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
                  Dropdown Action
                </label>
                <select
                  value={newProjectForm.linkMode}
                  onChange={(event) =>
                    setNewProjectForm((current) => ({
                      ...current,
                      linkMode: event.target.value as ProjectLinkMode,
                    }))
                  }
                  className="w-full rounded-lg border border-indigo-300/25 bg-[#0d1527] p-3 text-sm text-indigo-50 outline-none focus:border-indigo-300/55 focus:shadow-[0_0_0_2px_rgba(129,140,248,0.16)]"
                >
                  <option value="live">Check Live Screen</option>
                  <option value="repo">Check Repository</option>
                  <option value="private">Private Repository</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
                  Description
                </label>
                <textarea
                  value={newProjectForm.description}
                  onChange={(event) =>
                    setNewProjectForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={3}
                  placeholder="Project description"
                  className="w-full rounded-lg border border-indigo-300/25 bg-[#0d1527] p-3 text-sm text-indigo-50 outline-none placeholder:text-indigo-100/35 focus:border-indigo-300/55 focus:shadow-[0_0_0_2px_rgba(129,140,248,0.16)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
                  Link
                </label>
                <input
                  type="url"
                  value={newProjectForm.link}
                  onChange={(event) =>
                    setNewProjectForm((current) => ({ ...current, link: event.target.value }))
                  }
                  placeholder={
                    newProjectForm.linkMode === "private"
                      ? "Optional for private repository"
                      : "https://example.com"
                  }
                  className="w-full rounded-lg border border-indigo-300/25 bg-[#0d1527] p-3 text-sm text-indigo-50 outline-none placeholder:text-indigo-100/35 focus:border-indigo-300/55 focus:shadow-[0_0_0_2px_rgba(129,140,248,0.16)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-indigo-200/80">
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={newProjectForm.techStack}
                  onChange={(event) =>
                    setNewProjectForm((current) => ({ ...current, techStack: event.target.value }))
                  }
                  placeholder="Next.js, TypeScript, Tailwind CSS"
                  className="w-full rounded-lg border border-indigo-300/25 bg-[#0d1527] p-3 text-sm text-indigo-50 outline-none placeholder:text-indigo-100/35 focus:border-indigo-300/55 focus:shadow-[0_0_0_2px_rgba(129,140,248,0.16)]"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRequestProjectSubmit}
                disabled={isProjectActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                {isAddingProject
                  ? projectModalMode === "edit"
                    ? "Updating..."
                    : "Adding..."
                  : projectModalMode === "edit"
                    ? "Save Changes"
                    : "Add Tile"}
              </button>
              <button
                type="button"
                onClick={handleCloseAddProjectModal}
                disabled={isProjectActionBusy}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {projectDecisionState.open ? (
        <div className="fixed inset-0 z-98 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-orange-300/45 bg-[#140d08] p-5 shadow-[0_0_35px_rgba(251,146,60,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              Confirm Action
            </p>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-[0.06em] text-orange-100">
              {projectDecisionState.title}
            </h3>
            <p className="mt-2 text-sm text-orange-100/85">{projectDecisionState.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmProjectDecision}
                disabled={isProjectActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelProjectDecision}
                disabled={isProjectActionBusy}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalState.open ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border p-5 shadow-[0_0_35px_rgba(34,211,238,0.18)] ${modalState.tone === "success"
              ? "border-emerald-300/45 bg-[#041810]"
              : "border-rose-300/45 bg-[#1b0912]"
              }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-r from-transparent via-cyan-200/10 to-transparent" />
            <p
              className={`relative text-xs font-semibold uppercase tracking-[0.2em] ${modalState.tone === "success" ? "text-emerald-300" : "text-rose-300"
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
    </div>
  );
}
