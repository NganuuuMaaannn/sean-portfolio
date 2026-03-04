"use client";

import { type ReactElement, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiFigma,
  SiGit,
  SiGithub,
  SiVercel,
  SiAdobephotoshop,
  SiAdobepremierepro,
} from "react-icons/si";
import { IoLogoJavascript } from "react-icons/io5";
import { FaHtml5, FaCss3Alt, FaBootstrap, FaCode, FaToolbox } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";

export type PortfolioContentRow = {
  id: string;
  profile: unknown;
  projects: unknown;
  figmaProjects?: unknown;
  techStackItems?: unknown;
  certificates?: unknown;
};

type ProfileShape = {
  aboutText?: string;
  aboutImage?: string;
  contactTagline?: string;
  contactEmails?: string[];
  contactPhones?: string[];
  contactEmail?: string;
  contactPhone?: string;
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

type FigmaProjectShape = {
  title: string;
  src: string;
};

type CertificateShape = {
  title: string;
  issuer: string;
  image: string;
  verifyUrl?: string;
};

type TechStackCategory = "tech" | "tool";

type TechStackItemShape = {
  name: string;
  category: TechStackCategory;
  logoUrl?: string;
};

type ProjectLinkMode = "live" | "repo" | "private";

type NewProjectForm = {
  title: string;
  description: string;
  link: string;
  techStack: string;
  linkMode: ProjectLinkMode;
};

type NewFigmaProjectForm = {
  title: string;
  src: string;
};

type NewCertificateForm = {
  title: string;
  issuer: string;
  verifyUrl: string;
};

type TechStackForm = {
  name: string;
  category: TechStackCategory;
  logoUrl: string;
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

type FigmaDecisionAction =
  | { kind: "submit" }
  | { kind: "delete"; index: number }
  | { kind: "reset" };

type FigmaDecisionState = {
  open: boolean;
  title: string;
  message: string;
  action: FigmaDecisionAction | null;
};

type CertificateDecisionAction =
  | { kind: "submit" }
  | { kind: "delete"; index: number }
  | { kind: "reset" };

type CertificateDecisionState = {
  open: boolean;
  title: string;
  message: string;
  action: CertificateDecisionAction | null;
};

type TechStackDecisionAction = { kind: "delete"; index: number };

type TechStackDecisionState = {
  open: boolean;
  title: string;
  message: string;
  action: TechStackDecisionAction | null;
};

type PortfolioProfileDbRow = {
  id: string;
  about_text: string | null;
  about_image: string | null;
  contact_tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
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
  category: TechStackCategory;
  logo_url: string | null;
  sort_order: number;
};

type PortfolioCertificateDbRow = {
  id: string;
  owner_id: string;
  title: string;
  issuer: string;
  image: string;
  verify_url: string | null;
  sort_order: number;
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

function toFigmaProjectShapeList(value: unknown): FigmaProjectShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): FigmaProjectShape | null => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const src = typeof record.src === "string" ? record.src.trim() : "";

      if (!title || !src) {
        return null;
      }

      return {
        title,
        src,
      };
    })
    .filter((entry): entry is FigmaProjectShape => entry !== null);
}

function toCertificateShapeList(value: unknown): CertificateShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): CertificateShape | null => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const issuer = typeof record.issuer === "string" ? record.issuer.trim() : "";
      const image = typeof record.image === "string" ? record.image.trim() : "";
      const verifyUrl =
        typeof record.verifyUrl === "string" && record.verifyUrl.trim()
          ? record.verifyUrl.trim()
          : undefined;

      if (!title || !issuer || !image) {
        return null;
      }

      return {
        title,
        issuer,
        image,
        ...(verifyUrl ? { verifyUrl } : {}),
      };
    })
    .filter((entry): entry is CertificateShape => entry !== null);
}

function toTechStackItemShapeList(value: unknown): TechStackItemShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): TechStackItemShape | null => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const category =
        record.category === "tech" || record.category === "tool"
          ? record.category
          : null;
      const logoUrl =
        typeof record.logoUrl === "string" && record.logoUrl.trim()
          ? record.logoUrl.trim()
          : undefined;

      if (!name || !category) {
        return null;
      }

      return {
        name,
        category,
        ...(logoUrl ? { logoUrl } : {}),
      };
    })
    .filter((entry): entry is TechStackItemShape => entry !== null);
}

function normalizeTechStack(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeContactEntries(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/g)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}

function resolveContactEntries(value: unknown, fallback: string): string[] {
  const entries = normalizeContactEntries(value);
  return entries.length > 0 ? entries : [fallback];
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

const emptyFigmaForm: NewFigmaProjectForm = {
  title: "",
  src: "",
};

const emptyCertificateForm: NewCertificateForm = {
  title: "",
  issuer: "",
  verifyUrl: "",
};

const defaultAboutText =
  "Hi! I'm Sean, a 23-year-old Front-End Developer passionate about modern design, smooth interactions, and responsive user interfaces.";
const defaultAboutImage = "/image/Sean.jpg";
const defaultContactTagline = "Let's build something together!";
const defaultContactEmail = "ronniedoinog12@gmail.com";
const defaultContactPhone = "+63 938 646 7629";
const fallbackProjectImage = "/image/portfolio.png";
const fallbackCertificateImage = "/image/c4.png";
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
const defaultFigmaProjects: FigmaProjectShape[] = [
  {
    title: "BayadBox",
    src: "https://embed.figma.com/proto/3KLXXroJN0EesN8sAyrSBY/BayadBox?scaling=scale-down&content-scaling=fixed&page-id=0%3A1&node-id=222-622&starting-point-node-id=222%3A622&show-proto-sidebar=0&embed-host=share",
  },
  {
    title: "Riane's Violet Studio Cafe",
    src: "https://embed.figma.com/proto/YyMdjt2ij2eQVJtHT7KXH0/Doinog_ButtonDesignActivity?node-id=1-2&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2&show-proto-sidebar=0&embed-host=share",
  },
];
const defaultCertificates: CertificateShape[] = [
  {
    title: "Introduction to SQL",
    issuer: "Simplilearn.com",
    image: "/image/c4.png",
    verifyUrl: "https://simpli-web.app.link/e/to8hHyEEUYb",
  },
  {
    title: "Learn PHP and MySQL for Web Application and Web Development",
    issuer: "Udemy.com",
    image: "/image/c1.png",
    verifyUrl: "https://www.udemy.com/certificate/UC-f76db58f-516f-4f99-8f3c-d2576d67e376/",
  },
  {
    title: "Build Complete CMS Blog in PHP MySQL Bootstrap & PDO",
    issuer: "Udemy.com",
    image: "/image/c2.png",
    verifyUrl: "https://www.udemy.com/certificate/UC-91aa504c-ec8b-4db6-be7c-874db03ca056/",
  },
  {
    title: "PHP with MySQL: Build 8 PHP and MySQL Projects",
    issuer: "Udemy.com",
    image: "/image/c3.png",
    verifyUrl: "https://www.udemy.com/certificate/UC-3abfc85e-4724-4f5f-90b9-7548919bfd32/",
  },
];
const defaultTechStackItems: TechStackItemShape[] = [
  { name: "React Native", category: "tech" },
  { name: "React JS", category: "tech" },
  { name: "Next.js", category: "tech" },
  { name: "TypeScript", category: "tech" },
  { name: "JavaScript", category: "tech" },
  { name: "Tailwind CSS", category: "tech" },
  { name: "Node.js", category: "tech" },
  { name: "HTML", category: "tech" },
  { name: "CSS", category: "tech" },
  { name: "Bootstrap", category: "tech" },
  { name: "Visual Studio Code", category: "tool" },
  { name: "Vercel", category: "tool" },
  { name: "Figma", category: "tool" },
  { name: "GitHub", category: "tool" },
  { name: "Git", category: "tool" },
  { name: "Photoshop", category: "tool" },
  { name: "Premiere Pro", category: "tool" },
];

const techIconByName: Record<string, ReactElement> = {
  "react native": <SiReact className="text-sky-400" />,
  "react js": <SiReact className="text-sky-400" />,
  "next.js": <SiNextdotjs />,
  typescript: <SiTypescript className="text-blue-500" />,
  javascript: <IoLogoJavascript className="text-yellow-500" />,
  "tailwind css": <SiTailwindcss className="text-cyan-400" />,
  "node.js": <SiNodedotjs className="text-green-500" />,
  html: <FaHtml5 className="text-orange-500" />,
  css: <FaCss3Alt className="text-blue-500" />,
  bootstrap: <FaBootstrap className="text-purple-500" />,
};

const toolIconByName: Record<string, ReactElement> = {
  "visual studio code": <VscVscode className="text-blue-500" />,
  vercel: <SiVercel />,
  figma: <SiFigma className="text-pink-500" />,
  github: <SiGithub />,
  git: <SiGit className="text-orange-500" />,
  photoshop: <SiAdobephotoshop className="text-blue-500" />,
  "premiere pro": <SiAdobepremierepro className="text-blue-500" />,
};

function getTechStackItemIconByName(name: string, category: TechStackCategory) {
  const normalizedName = name.trim().toLowerCase();

  if (category === "tool") {
    return toolIconByName[normalizedName] ?? <FaToolbox className="text-amber-400" />;
  }

  return techIconByName[normalizedName] ?? <FaCode className="text-cyan-300" />;
}

function TechStackItemVisual({
  item,
  imageClassName,
}: {
  item: TechStackItemShape;
  imageClassName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (item.logoUrl && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.logoUrl}
        alt={`${item.name} logo`}
        className={imageClassName}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return getTechStackItemIconByName(item.name, item.category);
}

const emptyTechStackForm: TechStackForm = {
  name: "",
  category: "tech",
  logoUrl: "",
};

const profileId = "main";
const ownerId = "main";
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "portfolio-images";

export default function ContentEditor({ initialRow }: { initialRow: PortfolioContentRow }) {
  const [supabase] = useState(() => createClient());
  const initialProfile = useMemo(() => toProfileShape(initialRow.profile), [initialRow.profile]);
  const initialProjects = useMemo(() => {
    const parsedProjects = toProjectShapeList(initialRow.projects);
    return parsedProjects.length > 0 ? parsedProjects : defaultProjects;
  }, [initialRow.projects]);
  const initialFigmaProjects = useMemo(() => {
    const parsedFigmaProjects = toFigmaProjectShapeList(initialProfile.figmaProjects);
    return parsedFigmaProjects.length > 0 ? parsedFigmaProjects : defaultFigmaProjects;
  }, [initialProfile.figmaProjects]);
  const initialCertificates = useMemo(() => {
    const parsedCertificates = toCertificateShapeList(initialRow.certificates);
    return parsedCertificates.length > 0 ? parsedCertificates : defaultCertificates;
  }, [initialRow.certificates]);
  const initialTechStackItems = useMemo(() => {
    const parsedTechStackItems = toTechStackItemShapeList(initialRow.techStackItems);
    return parsedTechStackItems.length > 0 ? parsedTechStackItems : defaultTechStackItems;
  }, [initialRow.techStackItems]);
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
  const [contactTagline, setContactTagline] = useState(
    typeof initialProfile.contactTagline === "string" && initialProfile.contactTagline.trim()
      ? initialProfile.contactTagline
      : defaultContactTagline,
  );
  const [contactEmails, setContactEmails] = useState(() =>
    resolveContactEntries(
      initialProfile.contactEmails ?? initialProfile.contactEmail,
      defaultContactEmail,
    ),
  );
  const [contactPhones, setContactPhones] = useState(() =>
    resolveContactEntries(
      initialProfile.contactPhones ?? initialProfile.contactPhone,
      defaultContactPhone,
    ),
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSavingText, setIsSavingText] = useState(false);
  const [isSavingImageUrl, setIsSavingImageUrl] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [projects, setProjects] = useState<ProjectShape[]>(initialProjects);
  const [figmaProjects, setFigmaProjects] = useState<FigmaProjectShape[]>(initialFigmaProjects);
  const [certificates, setCertificates] = useState<CertificateShape[]>(initialCertificates);
  const [techStackItems, setTechStackItems] = useState<TechStackItemShape[]>(initialTechStackItems);
  const [isSavingProjects, setIsSavingProjects] = useState(false);
  const [isSavingFigmaProjects, setIsSavingFigmaProjects] = useState(false);
  const [isSavingCertificates, setIsSavingCertificates] = useState(false);
  const [isSavingTechStack, setIsSavingTechStack] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificateModalMode, setCertificateModalMode] = useState<"add" | "edit">("add");
  const [editingCertificateIndex, setEditingCertificateIndex] = useState<number | null>(null);
  const [newCertificateForm, setNewCertificateForm] = useState<NewCertificateForm>(emptyCertificateForm);
  const [newCertificateImageFile, setNewCertificateImageFile] = useState<File | null>(null);
  const [isSavingCertificate, setIsSavingCertificate] = useState(false);
  const [techStackLogoFile, setTechStackLogoFile] = useState<File | null>(null);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);
  const [techStackModalMode, setTechStackModalMode] = useState<"add" | "edit">("add");
  const [editingTechStackIndex, setEditingTechStackIndex] = useState<number | null>(null);
  const [techStackForm, setTechStackForm] = useState<TechStackForm>(emptyTechStackForm);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<"add" | "edit">("add");
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>(emptyProjectForm);
  const [newProjectImageFile, setNewProjectImageFile] = useState<File | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false);
  const [figmaModalMode, setFigmaModalMode] = useState<"add" | "edit">("add");
  const [editingFigmaIndex, setEditingFigmaIndex] = useState<number | null>(null);
  const [newFigmaForm, setNewFigmaForm] = useState<NewFigmaProjectForm>(emptyFigmaForm);
  const [isSavingFigmaProject, setIsSavingFigmaProject] = useState(false);
  const [projectDecisionState, setProjectDecisionState] = useState<ProjectDecisionState>({
    open: false,
    title: "",
    message: "",
    action: null,
  });
  const [figmaDecisionState, setFigmaDecisionState] = useState<FigmaDecisionState>({
    open: false,
    title: "",
    message: "",
    action: null,
  });
  const [certificateDecisionState, setCertificateDecisionState] = useState<CertificateDecisionState>({
    open: false,
    title: "",
    message: "",
    action: null,
  });
  const [techStackDecisionState, setTechStackDecisionState] = useState<TechStackDecisionState>({
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
    let active = true;
    let techStackReloadTimeout: number | null = null;

    const syncProfileFromDatabase = async () => {
      const { data, error } = await supabase
        .from("portfolio_profile")
        .select("id, about_text, about_image, contact_tagline, contact_email, contact_phone")
        .eq("id", profileId)
        .maybeSingle<PortfolioProfileDbRow>();

      if (error || !active) {
        return;
      }

      setAboutText(
        typeof data?.about_text === "string" && data.about_text.trim()
          ? data.about_text
          : defaultAboutText,
      );
      setAboutImage(
        typeof data?.about_image === "string" && data.about_image.trim()
          ? data.about_image
          : defaultAboutImage,
      );
      setContactTagline(
        typeof data?.contact_tagline === "string" && data.contact_tagline.trim()
          ? data.contact_tagline
          : defaultContactTagline,
      );
      setContactEmails(resolveContactEntries(data?.contact_email, defaultContactEmail));
      setContactPhones(resolveContactEntries(data?.contact_phone, defaultContactPhone));
    };

    const syncProjectsFromDatabase = async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select(
          "id, owner_id, title, description, image, tech, live_url, project_type, is_private, sort_order",
        )
        .eq("owner_id", ownerId)
        .order("sort_order", { ascending: true })
        .returns<PortfolioProjectDbRow[]>();

      if (error || !active) {
        return;
      }

      const projectPayload = (data ?? []).map((row) => ({
        title: row.title,
        description: row.description,
        image: row.image,
        tech: row.tech,
        liveUrl: row.live_url ?? undefined,
        type: row.project_type ?? undefined,
        private: row.is_private ? true : undefined,
      }));
      const nextProjects = toProjectShapeList(projectPayload);
      setProjects(nextProjects.length > 0 ? nextProjects : defaultProjects);
    };

    const syncFigmaProjectsFromDatabase = async () => {
      const { data, error } = await supabase
        .from("portfolio_figma_projects")
        .select("id, owner_id, title, src, sort_order")
        .eq("owner_id", ownerId)
        .order("sort_order", { ascending: true })
        .returns<PortfolioFigmaProjectDbRow[]>();

      if (error || !active) {
        return;
      }

      const nextFigmaProjects = toFigmaProjectShapeList(data ?? []);
      setFigmaProjects(nextFigmaProjects.length > 0 ? nextFigmaProjects : defaultFigmaProjects);
    };

    const syncCertificatesFromDatabase = async () => {
      const { data, error } = await supabase
        .from("portfolio_certificates")
        .select("id, owner_id, title, issuer, image, verify_url, sort_order")
        .eq("owner_id", ownerId)
        .order("sort_order", { ascending: true })
        .returns<PortfolioCertificateDbRow[]>();

      if (error || !active) {
        return;
      }

      const certificatesPayload = (data ?? []).map((row) => ({
        title: row.title,
        issuer: row.issuer,
        image: row.image,
        verifyUrl: row.verify_url ?? undefined,
      }));
      const nextCertificates = toCertificateShapeList(certificatesPayload);
      setCertificates(nextCertificates.length > 0 ? nextCertificates : defaultCertificates);
    };

    const syncTechStackFromDatabase = async () => {
      const { data, error } = await supabase
        .from("portfolio_tech_stack_items")
        .select("id, owner_id, name, category, logo_url, sort_order")
        .eq("owner_id", ownerId)
        .order("sort_order", { ascending: true })
        .returns<PortfolioTechStackDbRow[]>();

      if (error || !active) {
        return;
      }

      const techStackPayload = (data ?? []).map((row) => ({
        name: row.name,
        category: row.category,
        logoUrl: row.logo_url ?? undefined,
      }));
      const nextTechStackItems = toTechStackItemShapeList(techStackPayload);
      if (nextTechStackItems.length > 0) {
        setTechStackItems(nextTechStackItems);
        return;
      }

      // Avoid flashing defaults during multi-step saves (upsert/delete) while preserving first-load fallback.
      setTechStackItems((current) =>
        current.length > 0 ? current : defaultTechStackItems,
      );
    };

    const scheduleTechStackSync = () => {
      if (techStackReloadTimeout !== null) {
        window.clearTimeout(techStackReloadTimeout);
      }

      techStackReloadTimeout = window.setTimeout(() => {
        techStackReloadTimeout = null;
        void syncTechStackFromDatabase();
      }, 140);
    };

    void syncProfileFromDatabase();
    void syncProjectsFromDatabase();
    void syncFigmaProjectsFromDatabase();
    void syncCertificatesFromDatabase();
    void syncTechStackFromDatabase();

    const profileChannel = supabase
      .channel("portfolio-profile-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_profile",
          filter: `id=eq.${profileId}`,
        },
        () => {
          void syncProfileFromDatabase();
        },
      )
      .subscribe();

    const projectsChannel = supabase
      .channel("portfolio-projects-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_projects",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => {
          void syncProjectsFromDatabase();
        },
      )
      .subscribe();

    const figmaChannel = supabase
      .channel("portfolio-figma-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_figma_projects",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => {
          void syncFigmaProjectsFromDatabase();
        },
      )
      .subscribe();

    const certificatesChannel = supabase
      .channel("portfolio-certificates-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_certificates",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => {
          void syncCertificatesFromDatabase();
        },
      )
      .subscribe();

    const techStackChannel = supabase
      .channel("portfolio-tech-stack-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_tech_stack_items",
          filter: `owner_id=eq.${ownerId}`,
        },
        () => {
          scheduleTechStackSync();
        },
      )
      .subscribe();

    return () => {
      active = false;
      if (techStackReloadTimeout !== null) {
        window.clearTimeout(techStackReloadTimeout);
      }
      void supabase.removeChannel(profileChannel);
      void supabase.removeChannel(projectsChannel);
      void supabase.removeChannel(figmaChannel);
      void supabase.removeChannel(certificatesChannel);
      void supabase.removeChannel(techStackChannel);
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

  const notifyTechStackUpdated = (items: TechStackItemShape[]) => {
    const timestamp = Date.now().toString();

    try {
      window.localStorage.setItem("portfolio-tech-stack-items", JSON.stringify(items));
      window.localStorage.setItem("portfolio-tech-stack-updated-at", timestamp);
    } catch {
      // Ignore storage write issues and continue with other channels.
    }

    try {
      const channel = new BroadcastChannel("portfolio-tech-stack-updates");
      channel.postMessage({ type: "updated", at: timestamp, items });
      channel.close();
    } catch {
      // Ignore environments that do not support BroadcastChannel.
    }
  };

  const notifyCertificatesUpdated = (items: CertificateShape[]) => {
    const timestamp = Date.now().toString();

    try {
      window.localStorage.setItem("portfolio-certificates-items", JSON.stringify(items));
      window.localStorage.setItem("portfolio-certificates-updated-at", timestamp);
    } catch {
      // Ignore storage write issues and continue with other channels.
    }

    try {
      const channel = new BroadcastChannel("portfolio-certificates-updates");
      channel.postMessage({ type: "updated", at: timestamp, items });
      channel.close();
    } catch {
      // Ignore environments that do not support BroadcastChannel.
    }
  };

  const notifyContactUpdated = (tagline: string, emails: string[], phones: string[]) => {
    const timestamp = Date.now().toString();
    const resolvedEmails = resolveContactEntries(emails, defaultContactEmail);
    const resolvedPhones = resolveContactEntries(phones, defaultContactPhone);
    const resolvedTagline = tagline.trim() || defaultContactTagline;

    try {
      window.localStorage.setItem(
        "portfolio-contact-info",
        JSON.stringify({
          contactTagline: resolvedTagline,
          contactEmails: resolvedEmails,
          contactPhones: resolvedPhones,
          contactEmail: resolvedEmails[0] ?? defaultContactEmail,
          contactPhone: resolvedPhones[0] ?? defaultContactPhone,
        }),
      );
      window.localStorage.setItem("portfolio-contact-updated-at", timestamp);
    } catch {
      // Ignore storage write issues and continue with other channels.
    }

    try {
      const channel = new BroadcastChannel("portfolio-contact-updates");
      channel.postMessage({
        type: "updated",
        at: timestamp,
        contact: {
          contactTagline: resolvedTagline,
          contactEmails: resolvedEmails,
          contactPhones: resolvedPhones,
          contactEmail: resolvedEmails[0] ?? defaultContactEmail,
          contactPhone: resolvedPhones[0] ?? defaultContactPhone,
        },
      });
      channel.close();
    } catch {
      // Ignore environments that do not support BroadcastChannel.
    }
  };

  const saveProfilePatch = async (patch: Partial<ProfileShape>) => {
    const { data: latestProfile, error: profileReadError } = await supabase
      .from("portfolio_profile")
      .select("id, about_text, about_image, contact_tagline, contact_email, contact_phone")
      .eq("id", profileId)
      .maybeSingle<PortfolioProfileDbRow>();

    if (profileReadError) {
      return {
        ok: false as const,
        message: `Read failed. ${profileReadError.message}`,
      };
    }

    const nextAboutText =
      typeof patch.aboutText === "string"
        ? patch.aboutText
        : latestProfile?.about_text ?? aboutText;
    const nextAboutImage =
      typeof patch.aboutImage === "string"
        ? patch.aboutImage
        : latestProfile?.about_image ?? aboutImage;
    const nextContactTagline =
      typeof patch.contactTagline === "string"
        ? patch.contactTagline.trim() || defaultContactTagline
        : typeof latestProfile?.contact_tagline === "string" && latestProfile.contact_tagline.trim()
          ? latestProfile.contact_tagline
          : contactTagline;
    const nextContactEmails = Object.prototype.hasOwnProperty.call(patch, "contactEmails")
      ? resolveContactEntries(
        (patch as { contactEmails?: unknown }).contactEmails,
        defaultContactEmail,
      )
      : Object.prototype.hasOwnProperty.call(patch, "contactEmail")
        ? resolveContactEntries(
          (patch as { contactEmail?: unknown }).contactEmail,
          defaultContactEmail,
        )
        : latestProfile
          ? resolveContactEntries(latestProfile.contact_email, defaultContactEmail)
          : resolveContactEntries(contactEmails, defaultContactEmail);
    const nextContactPhones = Object.prototype.hasOwnProperty.call(patch, "contactPhones")
      ? resolveContactEntries(
        (patch as { contactPhones?: unknown }).contactPhones,
        defaultContactPhone,
      )
      : Object.prototype.hasOwnProperty.call(patch, "contactPhone")
        ? resolveContactEntries(
          (patch as { contactPhone?: unknown }).contactPhone,
          defaultContactPhone,
        )
        : latestProfile
          ? resolveContactEntries(latestProfile.contact_phone, defaultContactPhone)
          : resolveContactEntries(contactPhones, defaultContactPhone);
    const nextContactEmail = nextContactEmails.join("\n");
    const nextContactPhone = nextContactPhones.join("\n");

    const { data: savedProfile, error: profileSaveError } = await supabase
      .from("portfolio_profile")
      .upsert(
        {
          id: profileId,
          about_text: nextAboutText,
          about_image: nextAboutImage,
          contact_tagline: nextContactTagline,
          contact_email: nextContactEmail,
          contact_phone: nextContactPhone,
        },
        { onConflict: "id" },
      )
      .select("id, about_text, about_image, contact_tagline, contact_email, contact_phone")
      .single<PortfolioProfileDbRow>();

    if (profileSaveError || !savedProfile) {
      return {
        ok: false as const,
        message: `Save failed. ${profileSaveError?.message ?? "Unknown error"}`,
      };
    }

    let nextFigmaProjects = figmaProjects;
    if (Object.prototype.hasOwnProperty.call(patch, "figmaProjects")) {
      nextFigmaProjects = toFigmaProjectShapeList(
        (patch as { figmaProjects?: unknown }).figmaProjects,
      );

      const { error: deleteFigmaError } = await supabase
        .from("portfolio_figma_projects")
        .delete()
        .eq("owner_id", ownerId);

      if (deleteFigmaError) {
        return {
          ok: false as const,
          message: `Save failed. ${deleteFigmaError.message}`,
        };
      }

      if (nextFigmaProjects.length > 0) {
        const figmaInsertPayload = nextFigmaProjects.map((project, index) => ({
          owner_id: ownerId,
          title: project.title,
          src: project.src,
          sort_order: index,
        }));
        const { error: figmaInsertError } = await supabase
          .from("portfolio_figma_projects")
          .insert(figmaInsertPayload);

        if (figmaInsertError) {
          return {
            ok: false as const,
            message: `Save failed. ${figmaInsertError.message}`,
          };
        }
      }
    }

    const profilePayload: ProfileShape = {
      aboutText:
        typeof savedProfile.about_text === "string" && savedProfile.about_text.trim()
          ? savedProfile.about_text
          : defaultAboutText,
      aboutImage:
        typeof savedProfile.about_image === "string" && savedProfile.about_image.trim()
          ? savedProfile.about_image
          : defaultAboutImage,
      contactTagline:
        typeof savedProfile.contact_tagline === "string" && savedProfile.contact_tagline.trim()
          ? savedProfile.contact_tagline
          : defaultContactTagline,
      contactEmails: resolveContactEntries(savedProfile.contact_email, defaultContactEmail),
      contactPhones: resolveContactEntries(savedProfile.contact_phone, defaultContactPhone),
      contactEmail:
        resolveContactEntries(savedProfile.contact_email, defaultContactEmail)[0] ??
        defaultContactEmail,
      contactPhone:
        resolveContactEntries(savedProfile.contact_phone, defaultContactPhone)[0] ??
        defaultContactPhone,
      figmaProjects: nextFigmaProjects,
    };

    const row: PortfolioContentRow = {
      id: profileId,
      profile: profilePayload,
      projects,
      figmaProjects: nextFigmaProjects,
      techStackItems,
      certificates,
    };

    return {
      ok: true as const,
      row,
    };
  };

  const saveProjectsPatch = async (projectsPatch: ProjectShape[]) => {
    const { error: deleteProjectsError } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("owner_id", ownerId);

    if (deleteProjectsError) {
      return {
        ok: false as const,
        message: `Save failed. ${deleteProjectsError.message}`,
      };
    }

    if (projectsPatch.length > 0) {
      const projectsInsertPayload = projectsPatch.map((project, index) => ({
        owner_id: ownerId,
        title: project.title,
        description: project.description,
        image: project.image,
        tech: project.tech,
        live_url: project.liveUrl ?? null,
        project_type: project.type ?? null,
        is_private: project.private ?? false,
        sort_order: index,
      }));
      const { error: insertProjectsError } = await supabase
        .from("portfolio_projects")
        .insert(projectsInsertPayload);

      if (insertProjectsError) {
        return {
          ok: false as const,
          message: `Save failed. ${insertProjectsError.message}`,
        };
      }
    }

    const { data: savedProjectRows, error: readProjectsError } = await supabase
      .from("portfolio_projects")
      .select(
        "id, owner_id, title, description, image, tech, live_url, project_type, is_private, sort_order",
      )
      .eq("owner_id", ownerId)
      .order("sort_order", { ascending: true })
      .returns<PortfolioProjectDbRow[]>();

    if (readProjectsError) {
      return {
        ok: false as const,
        message: `Read failed. ${readProjectsError.message}`,
      };
    }

    const projectsPayload = (savedProjectRows ?? []).map((row) => ({
      title: row.title,
      description: row.description,
      image: row.image,
      tech: row.tech,
      liveUrl: row.live_url ?? undefined,
      type: row.project_type ?? undefined,
      private: row.is_private ? true : undefined,
    }));
    const savedProjects = toProjectShapeList(projectsPayload);
    const profilePayload: ProfileShape = {
      aboutText,
      aboutImage,
      contactTagline,
      contactEmails,
      contactPhones,
      contactEmail: contactEmails[0] ?? defaultContactEmail,
      contactPhone: contactPhones[0] ?? defaultContactPhone,
      figmaProjects,
    };

    const row: PortfolioContentRow = {
      id: profileId,
      profile: profilePayload,
      projects: savedProjects,
      figmaProjects,
      techStackItems,
      certificates,
    };

    return {
      ok: true as const,
      row,
    };
  };

  const saveCertificatesPatch = async (certificatesPatch: CertificateShape[]) => {
    const { error: deleteCertificatesError } = await supabase
      .from("portfolio_certificates")
      .delete()
      .eq("owner_id", ownerId);

    if (deleteCertificatesError) {
      return {
        ok: false as const,
        message: `Save failed. ${deleteCertificatesError.message}`,
      };
    }

    if (certificatesPatch.length > 0) {
      const certificatesInsertPayload = certificatesPatch.map((certificate, index) => ({
        owner_id: ownerId,
        title: certificate.title,
        issuer: certificate.issuer,
        image: certificate.image,
        verify_url: certificate.verifyUrl ?? null,
        sort_order: index,
      }));
      const { error: insertCertificatesError } = await supabase
        .from("portfolio_certificates")
        .insert(certificatesInsertPayload);

      if (insertCertificatesError) {
        return {
          ok: false as const,
          message: `Save failed. ${insertCertificatesError.message}`,
        };
      }
    }

    const { data: savedCertificateRows, error: readCertificatesError } = await supabase
      .from("portfolio_certificates")
      .select("id, owner_id, title, issuer, image, verify_url, sort_order")
      .eq("owner_id", ownerId)
      .order("sort_order", { ascending: true })
      .returns<PortfolioCertificateDbRow[]>();

    if (readCertificatesError) {
      return {
        ok: false as const,
        message: `Read failed. ${readCertificatesError.message}`,
      };
    }

    const certificatesPayload = (savedCertificateRows ?? []).map((row) => ({
      title: row.title,
      issuer: row.issuer,
      image: row.image,
      verifyUrl: row.verify_url ?? undefined,
    }));
    const savedCertificates = toCertificateShapeList(certificatesPayload);
    const profilePayload: ProfileShape = {
      aboutText,
      aboutImage,
      contactTagline,
      contactEmails,
      contactPhones,
      contactEmail: contactEmails[0] ?? defaultContactEmail,
      contactPhone: contactPhones[0] ?? defaultContactPhone,
      figmaProjects,
    };

    const row: PortfolioContentRow = {
      id: profileId,
      profile: profilePayload,
      projects,
      figmaProjects,
      techStackItems,
      certificates: savedCertificates,
    };

    return {
      ok: true as const,
      row,
    };
  };

  const saveTechStackPatch = async (techStackPatch: TechStackItemShape[]) => {
    let usedUpsertFlow = true;

    if (techStackPatch.length > 0) {
      const techStackUpsertPayload = techStackPatch.map((item, index) => ({
        owner_id: ownerId,
        name: item.name,
        category: item.category,
        logo_url: item.logoUrl ?? null,
        sort_order: index,
      }));
      const { error: upsertTechStackError } = await supabase
        .from("portfolio_tech_stack_items")
        .upsert(techStackUpsertPayload, { onConflict: "owner_id,sort_order" });

      if (upsertTechStackError) {
        const shouldFallback =
          upsertTechStackError.message.includes("no unique or exclusion constraint") ||
          upsertTechStackError.message.includes("ON CONFLICT specification");

        if (!shouldFallback) {
          return {
            ok: false as const,
            message: `Save failed. ${upsertTechStackError.message}`,
          };
        }

        usedUpsertFlow = false;

        const { error: deleteTechStackError } = await supabase
          .from("portfolio_tech_stack_items")
          .delete()
          .eq("owner_id", ownerId);

        if (deleteTechStackError) {
          return {
            ok: false as const,
            message: `Save failed. ${deleteTechStackError.message}`,
          };
        }

        const { error: insertTechStackError } = await supabase
          .from("portfolio_tech_stack_items")
          .insert(techStackUpsertPayload);

        if (insertTechStackError) {
          return {
            ok: false as const,
            message: `Save failed. ${insertTechStackError.message}`,
          };
        }
      }
    }

    let pruneTechStackError: { message: string } | null = null;
    if (usedUpsertFlow) {
      const { error } = await supabase
        .from("portfolio_tech_stack_items")
        .delete()
        .eq("owner_id", ownerId)
        .gte("sort_order", techStackPatch.length);
      pruneTechStackError = error ? { message: error.message } : null;
    }

    if (pruneTechStackError) {
      return {
        ok: false as const,
        message: `Save failed. ${pruneTechStackError.message}`,
      };
    }

    const { data: savedTechStackRows, error: readTechStackError } = await supabase
      .from("portfolio_tech_stack_items")
      .select("id, owner_id, name, category, logo_url, sort_order")
      .eq("owner_id", ownerId)
      .order("sort_order", { ascending: true })
      .returns<PortfolioTechStackDbRow[]>();

    if (readTechStackError) {
      return {
        ok: false as const,
        message: `Read failed. ${readTechStackError.message}`,
      };
    }

    const techStackPayload = (savedTechStackRows ?? []).map((row) => ({
      name: row.name,
      category: row.category,
      logoUrl: row.logo_url ?? undefined,
    }));
    const savedTechStackItems = toTechStackItemShapeList(techStackPayload);
    const profilePayload: ProfileShape = {
      aboutText,
      aboutImage,
      contactTagline,
      contactEmails,
      contactPhones,
      contactEmail: contactEmails[0] ?? defaultContactEmail,
      contactPhone: contactPhones[0] ?? defaultContactPhone,
      figmaProjects,
    };

    const row: PortfolioContentRow = {
      id: profileId,
      profile: profilePayload,
      projects,
      figmaProjects,
      techStackItems: savedTechStackItems,
      certificates,
    };

    return {
      ok: true as const,
      row,
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

  const handleContactEmailChange = (index: number, value: string) => {
    setContactEmails((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? value : entry)),
    );
  };

  const handleContactPhoneChange = (index: number, value: string) => {
    setContactPhones((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? value : entry)),
    );
  };

  const handleAddContactEmailField = () => {
    setContactEmails((current) => [...current, ""]);
  };

  const handleAddContactPhoneField = () => {
    setContactPhones((current) => [...current, ""]);
  };

  const handleRemoveContactEmailField = (index: number) => {
    setContactEmails((current) => {
      const next = current.filter((_, entryIndex) => entryIndex !== index);
      return next.length > 0 ? next : [""];
    });
  };

  const handleRemoveContactPhoneField = (index: number) => {
    setContactPhones((current) => {
      const next = current.filter((_, entryIndex) => entryIndex !== index);
      return next.length > 0 ? next : [""];
    });
  };

  const handleSaveContactInfo = async () => {
    const trimmedTagline = contactTagline.trim();
    const trimmedEmails = normalizeContactEntries(contactEmails);
    const trimmedPhones = normalizeContactEntries(contactPhones);

    if (!trimmedTagline) {
      const message = "Contact intro text is required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    if (trimmedEmails.length === 0 || trimmedPhones.length === 0) {
      const message = "At least one contact email and one contact phone are required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    if (trimmedEmails.length !== trimmedPhones.length) {
      const message = "Emails and phones count must match so each row has one email and one number.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    const invalidEmail = trimmedEmails.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidEmail) {
      const message = `Invalid contact email: ${invalidEmail}`;
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    setIsSavingContact(true);
    setStatusText("Saving contact info...");
    const result = await saveProfilePatch({
      contactTagline: trimmedTagline,
      contactEmails: trimmedEmails,
      contactPhones: trimmedPhones,
    });
    setIsSavingContact(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProfile = toProfileShape(result.row.profile);
    const resolvedEmails = resolveContactEntries(
      savedProfile.contactEmails ?? savedProfile.contactEmail,
      defaultContactEmail,
    );
    const resolvedPhones = resolveContactEntries(
      savedProfile.contactPhones ?? savedProfile.contactPhone,
      defaultContactPhone,
    );
    const resolvedTagline =
      typeof savedProfile.contactTagline === "string" && savedProfile.contactTagline.trim()
        ? savedProfile.contactTagline
        : defaultContactTagline;

    setContactTagline(resolvedTagline);
    setContactEmails(resolvedEmails);
    setContactPhones(resolvedPhones);
    notifyContactUpdated(resolvedTagline, resolvedEmails, resolvedPhones);
    setStatusText("Contact info saved.");
    showModal("success", "Saved", "Contact details updated successfully.");
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

  const askFigmaDecision = (
    title: string,
    message: string,
    action: FigmaDecisionAction,
  ) => {
    if (isSavingFigmaProject || isSavingFigmaProjects) {
      return;
    }

    setFigmaDecisionState({
      open: true,
      title,
      message,
      action,
    });
  };

  const handleOpenAddFigmaModal = () => {
    setFigmaModalMode("add");
    setEditingFigmaIndex(null);
    setNewFigmaForm(emptyFigmaForm);
    setIsFigmaModalOpen(true);
  };

  const handleOpenEditFigmaModal = (figmaIndex: number) => {
    const figmaProjectToEdit = figmaProjects[figmaIndex];
    if (!figmaProjectToEdit) {
      return;
    }

    setFigmaModalMode("edit");
    setEditingFigmaIndex(figmaIndex);
    setNewFigmaForm({
      title: figmaProjectToEdit.title,
      src: figmaProjectToEdit.src,
    });
    setIsFigmaModalOpen(true);
  };

  const handleCloseFigmaModal = () => {
    if (isSavingFigmaProject || isSavingFigmaProjects) {
      return;
    }

    setFigmaModalMode("add");
    setEditingFigmaIndex(null);
    setNewFigmaForm(emptyFigmaForm);
    setIsFigmaModalOpen(false);
  };

  const handleRequestFigmaSubmit = () => {
    askFigmaDecision(
      figmaModalMode === "edit" ? "Confirm Edit" : "Confirm Add",
      figmaModalMode === "edit"
        ? "Are you sure you want to save changes to this Figma tile?"
        : "Are you sure you want to add this Figma tile?",
      { kind: "submit" },
    );
  };

  const handleSaveFigmaProject = async () => {
    const isEditingFigmaProject = figmaModalMode === "edit" && editingFigmaIndex !== null;
    const title = newFigmaForm.title.trim();
    const src = newFigmaForm.src.trim();

    if (!title || !src) {
      const message = "Figma project title and embed URL are required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    try {
      // Ensure users don't save invalid or incomplete iframe URLs.
      new URL(src);
    } catch {
      const message = "Figma embed URL is invalid.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    setIsSavingFigmaProject(true);
    setStatusText(
      isEditingFigmaProject ? "Updating Figma tile..." : "Adding Figma tile...",
    );

    const nextFigmaProject: FigmaProjectShape = {
      title,
      src,
    };

    const nextFigmaProjects =
      isEditingFigmaProject && editingFigmaIndex !== null
        ? figmaProjects.map((project, index) =>
          index === editingFigmaIndex ? nextFigmaProject : project,
        )
        : [...figmaProjects, nextFigmaProject];

    setIsSavingFigmaProjects(true);
    const saveResult = await saveProfilePatch({ figmaProjects: nextFigmaProjects });
    setIsSavingFigmaProjects(false);
    setIsSavingFigmaProject(false);

    if (!saveResult.ok) {
      setStatusText(saveResult.message);
      showModal("error", "Save Failed", saveResult.message);
      return;
    }

    const savedProfile = toProfileShape(saveResult.row.profile);
    const savedFigmaProjects = toFigmaProjectShapeList(savedProfile.figmaProjects);
    setFigmaProjects(savedFigmaProjects.length > 0 ? savedFigmaProjects : defaultFigmaProjects);

    setIsFigmaModalOpen(false);
    setFigmaModalMode("add");
    setEditingFigmaIndex(null);
    setNewFigmaForm(emptyFigmaForm);
    if (isEditingFigmaProject) {
      setStatusText("Figma tile updated and saved.");
      showModal("success", "Figma Updated", "Figma tile updated successfully.");
      return;
    }

    setStatusText("Figma tile added and saved.");
    showModal("success", "Figma Added", "Figma tile added successfully.");
  };

  const handleRequestDeleteFigmaProject = (indexToRemove: number) => {
    const targetFigmaProject = figmaProjects[indexToRemove];
    if (!targetFigmaProject) {
      return;
    }

    askFigmaDecision(
      "Confirm Delete",
      `Are you sure you want to remove \"${targetFigmaProject.title}\"?`,
      { kind: "delete", index: indexToRemove },
    );
  };

  const handleRemoveFigmaProject = async (indexToRemove: number) => {
    const nextFigmaProjects = figmaProjects.filter((_, index) => index !== indexToRemove);
    setIsSavingFigmaProjects(true);
    setStatusText("Removing Figma tile...");
    const result = await saveProfilePatch({ figmaProjects: nextFigmaProjects });
    setIsSavingFigmaProjects(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProfile = toProfileShape(result.row.profile);
    const savedFigmaProjects = toFigmaProjectShapeList(savedProfile.figmaProjects);
    setFigmaProjects(savedFigmaProjects.length > 0 ? savedFigmaProjects : defaultFigmaProjects);
    setStatusText("Figma tile removed and saved.");
    showModal("success", "Figma Removed", "Figma tile removed successfully.");
  };

  const handleRequestResetFigmaProjects = () => {
    askFigmaDecision(
      "Confirm Reset",
      "Are you sure you want to reset all Figma tiles to default?",
      { kind: "reset" },
    );
  };

  const handleResetFigmaProjectsToDefault = async () => {
    setIsSavingFigmaProjects(true);
    setStatusText("Resetting Figma projects to default...");
    const result = await saveProfilePatch({ figmaProjects: defaultFigmaProjects });
    setIsSavingFigmaProjects(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedProfile = toProfileShape(result.row.profile);
    const savedFigmaProjects = toFigmaProjectShapeList(savedProfile.figmaProjects);
    setFigmaProjects(savedFigmaProjects.length > 0 ? savedFigmaProjects : defaultFigmaProjects);
    setStatusText("Figma projects reset to default and saved.");
    showModal("success", "Figma Reset", "Default Figma tiles restored.");
  };

  const handleConfirmFigmaDecision = async () => {
    const action = figmaDecisionState.action;
    if (!action) {
      return;
    }

    setFigmaDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });

    if (action.kind === "submit") {
      await handleSaveFigmaProject();
      return;
    }

    if (action.kind === "delete") {
      await handleRemoveFigmaProject(action.index);
      return;
    }

    await handleResetFigmaProjectsToDefault();
  };

  const handleCancelFigmaDecision = () => {
    if (isSavingFigmaProject || isSavingFigmaProjects) {
      return;
    }

    setFigmaDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });
  };

  const askCertificateDecision = (
    title: string,
    message: string,
    action: CertificateDecisionAction,
  ) => {
    if (isSavingCertificate || isSavingCertificates) {
      return;
    }

    setCertificateDecisionState({
      open: true,
      title,
      message,
      action,
    });
  };

  const handleOpenAddCertificateModal = () => {
    setCertificateModalMode("add");
    setEditingCertificateIndex(null);
    setNewCertificateForm(emptyCertificateForm);
    setNewCertificateImageFile(null);
    setIsCertificateModalOpen(true);
  };

  const handleOpenEditCertificateModal = (certificateIndex: number) => {
    const certificateToEdit = certificates[certificateIndex];
    if (!certificateToEdit) {
      return;
    }

    setCertificateModalMode("edit");
    setEditingCertificateIndex(certificateIndex);
    setNewCertificateForm({
      title: certificateToEdit.title,
      issuer: certificateToEdit.issuer,
      verifyUrl: certificateToEdit.verifyUrl ?? "",
    });
    setNewCertificateImageFile(null);
    setIsCertificateModalOpen(true);
  };

  const handleCloseCertificateModal = () => {
    if (isSavingCertificate || isSavingCertificates) {
      return;
    }

    setCertificateModalMode("add");
    setEditingCertificateIndex(null);
    setNewCertificateForm(emptyCertificateForm);
    setNewCertificateImageFile(null);
    setIsCertificateModalOpen(false);
  };

  const handleRequestCertificateSubmit = () => {
    askCertificateDecision(
      certificateModalMode === "edit" ? "Confirm Edit" : "Confirm Add",
      certificateModalMode === "edit"
        ? "Are you sure you want to save changes to this certificate?"
        : "Are you sure you want to add this certificate?",
      { kind: "submit" },
    );
  };

  const handleSaveCertificate = async () => {
    const isEditingCertificate =
      certificateModalMode === "edit" && editingCertificateIndex !== null;
    const currentEditingCertificate = isEditingCertificate
      ? certificates[editingCertificateIndex]
      : null;
    const title = newCertificateForm.title.trim();
    const issuer = newCertificateForm.issuer.trim();
    const verifyUrl = newCertificateForm.verifyUrl.trim();

    if (isEditingCertificate && !currentEditingCertificate) {
      const message = "Selected certificate no longer exists. Reopen the editor and try again.";
      setStatusText(message);
      showModal("error", "Edit Error", message);
      return;
    }

    if (!newCertificateImageFile && !currentEditingCertificate) {
      const message = "Select a certificate image before adding the tile.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    if (!title || !issuer) {
      const message = "Certificate title and issuer are required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    if (verifyUrl) {
      try {
        new URL(verifyUrl);
      } catch {
        const message = "Certificate verify URL is invalid.";
        setStatusText(message);
        showModal("error", "Validation Error", message);
        return;
      }
    }

    setIsSavingCertificate(true);
    setStatusText(
      newCertificateImageFile
        ? "Uploading certificate image..."
        : isEditingCertificate
          ? "Updating certificate tile..."
          : "Adding certificate tile...",
    );

    let imageUrl = currentEditingCertificate?.image ?? "";
    if (newCertificateImageFile) {
      const extension = newCertificateImageFile.name.includes(".")
        ? newCertificateImageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
        : "jpg";
      const sanitizedExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `certificates/${Date.now()}-${Math.random().toString(36).slice(2)}.${sanitizedExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, newCertificateImageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setIsSavingCertificate(false);
        const message = `Upload failed. ${uploadError.message}`;
        setStatusText(message);
        showModal("error", "Upload Failed", message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
      imageUrl = publicUrlData.publicUrl;
    }

    if (!imageUrl) {
      setIsSavingCertificate(false);
      const message = "Certificate image is required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    const nextCertificate: CertificateShape = {
      title,
      issuer,
      image: imageUrl,
      ...(verifyUrl ? { verifyUrl } : {}),
    };

    const nextCertificates =
      isEditingCertificate && editingCertificateIndex !== null
        ? certificates.map((certificate, index) =>
          index === editingCertificateIndex ? nextCertificate : certificate,
        )
        : [...certificates, nextCertificate];

    setIsSavingCertificates(true);
    setStatusText(isEditingCertificate ? "Saving certificate changes..." : "Saving new certificate...");
    const saveResult = await saveCertificatesPatch(nextCertificates);
    setIsSavingCertificates(false);
    setIsSavingCertificate(false);

    if (!saveResult.ok) {
      setStatusText(saveResult.message);
      showModal("error", "Save Failed", saveResult.message);
      return;
    }

    const savedCertificates = toCertificateShapeList(saveResult.row.certificates);
    const resolvedCertificates =
      savedCertificates.length > 0 ? savedCertificates : defaultCertificates;
    setCertificates(resolvedCertificates);
    notifyCertificatesUpdated(resolvedCertificates);
    setIsCertificateModalOpen(false);
    setCertificateModalMode("add");
    setEditingCertificateIndex(null);
    setNewCertificateForm(emptyCertificateForm);
    setNewCertificateImageFile(null);

    if (isEditingCertificate) {
      setStatusText("Certificate tile updated and saved.");
      showModal("success", "Certificate Updated", "Certificate tile updated successfully.");
      return;
    }

    setStatusText("Certificate tile added and saved.");
    showModal("success", "Certificate Added", "Certificate tile added successfully.");
  };

  const handleRequestDeleteCertificate = (indexToRemove: number) => {
    const targetCertificate = certificates[indexToRemove];
    if (!targetCertificate) {
      return;
    }

    askCertificateDecision(
      "Confirm Delete",
      `Are you sure you want to remove \"${targetCertificate.title}\"?`,
      { kind: "delete", index: indexToRemove },
    );
  };

  const handleRemoveCertificate = async (indexToRemove: number) => {
    const nextCertificates = certificates.filter((_, index) => index !== indexToRemove);
    setIsSavingCertificates(true);
    setStatusText("Removing certificate tile...");
    const result = await saveCertificatesPatch(nextCertificates);
    setIsSavingCertificates(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedCertificates = toCertificateShapeList(result.row.certificates);
    const resolvedCertificates =
      savedCertificates.length > 0 ? savedCertificates : defaultCertificates;
    setCertificates(resolvedCertificates);
    notifyCertificatesUpdated(resolvedCertificates);
    setStatusText("Certificate tile removed and saved.");
    showModal("success", "Certificate Removed", "Certificate tile removed successfully.");
  };

  const handleRequestResetCertificates = () => {
    askCertificateDecision(
      "Confirm Reset",
      "Are you sure you want to reset all certificate tiles to default?",
      { kind: "reset" },
    );
  };

  const handleResetCertificatesToDefault = async () => {
    setIsSavingCertificates(true);
    setStatusText("Resetting certificates to default...");
    const result = await saveCertificatesPatch(defaultCertificates);
    setIsSavingCertificates(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedCertificates = toCertificateShapeList(result.row.certificates);
    const resolvedCertificates =
      savedCertificates.length > 0 ? savedCertificates : defaultCertificates;
    setCertificates(resolvedCertificates);
    notifyCertificatesUpdated(resolvedCertificates);
    setStatusText("Certificates reset to default and saved.");
    showModal("success", "Certificates Reset", "Default certificate tiles restored.");
  };

  const handleConfirmCertificateDecision = async () => {
    const action = certificateDecisionState.action;
    if (!action) {
      return;
    }

    setCertificateDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });

    if (action.kind === "submit") {
      await handleSaveCertificate();
      return;
    }

    if (action.kind === "delete") {
      await handleRemoveCertificate(action.index);
      return;
    }

    await handleResetCertificatesToDefault();
  };

  const handleCancelCertificateDecision = () => {
    if (isSavingCertificate || isSavingCertificates) {
      return;
    }

    setCertificateDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });
  };

  const handleOpenAddTechStackModal = () => {
    if (isSavingTechStack) {
      return;
    }

    setTechStackModalMode("add");
    setEditingTechStackIndex(null);
    setTechStackForm(emptyTechStackForm);
    setTechStackLogoFile(null);
    setIsTechStackModalOpen(true);
  };

  const handleOpenEditTechStackModal = (indexToEdit: number) => {
    if (isSavingTechStack) {
      return;
    }

    const itemToEdit = techStackItems[indexToEdit];
    if (!itemToEdit) {
      return;
    }

    setTechStackModalMode("edit");
    setEditingTechStackIndex(indexToEdit);
    setTechStackForm({
      name: itemToEdit.name,
      category: itemToEdit.category,
      logoUrl: itemToEdit.logoUrl ?? "",
    });
    setTechStackLogoFile(null);
    setIsTechStackModalOpen(true);
  };

  const handleCloseTechStackModal = () => {
    if (isSavingTechStack) {
      return;
    }

    setTechStackModalMode("add");
    setEditingTechStackIndex(null);
    setTechStackForm(emptyTechStackForm);
    setTechStackLogoFile(null);
    setIsTechStackModalOpen(false);
  };

  const handleSaveTechStack = async () => {
    const isEditing = techStackModalMode === "edit" && editingTechStackIndex !== null;
    const currentEditingItem = isEditing ? techStackItems[editingTechStackIndex] : null;
    const name = techStackForm.name.trim();
    let logoUrl = techStackForm.logoUrl.trim();

    if (isEditing && !currentEditingItem) {
      const message = "Selected item no longer exists. Reopen the editor and try again.";
      setStatusText(message);
      showModal("error", "Edit Error", message);
      return;
    }

    if (!name) {
      const message = "Item name is required.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    const hasDuplicate = techStackItems.some(
      (item, index) =>
        (!isEditing || index !== editingTechStackIndex) &&
        item.name.trim().toLowerCase() === name.toLowerCase() &&
        item.category === techStackForm.category,
    );

    if (hasDuplicate) {
      const message = "This item already exists in the selected category.";
      setStatusText(message);
      showModal("error", "Validation Error", message);
      return;
    }

    setIsSavingTechStack(true);
    setStatusText(
      techStackLogoFile
        ? "Uploading logo..."
        : isEditing
          ? "Updating tech stack item..."
          : "Adding tech stack item...",
    );

    if (techStackLogoFile) {
      const extension = techStackLogoFile.name.includes(".")
        ? techStackLogoFile.name.split(".").pop()?.toLowerCase() ?? "png"
        : "png";
      const sanitizedExtension = extension.replace(/[^a-z0-9]/g, "") || "png";
      const filePath = `tech-stack/${Date.now()}-${Math.random().toString(36).slice(2)}.${sanitizedExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, techStackLogoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setIsSavingTechStack(false);
        const message = `Logo upload failed. ${uploadError.message}`;
        setStatusText(message);
        showModal("error", "Upload Failed", message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
      logoUrl = publicUrlData.publicUrl;
    }

    const nextItem: TechStackItemShape = {
      name,
      category: techStackForm.category,
      ...(logoUrl ? { logoUrl } : {}),
    };

    const nextTechStackItems =
      isEditing && editingTechStackIndex !== null
        ? techStackItems.map((item, index) => (index === editingTechStackIndex ? nextItem : item))
        : [...techStackItems, nextItem];

    const result = await saveTechStackPatch(nextTechStackItems);
    setIsSavingTechStack(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedTechStackItems = toTechStackItemShapeList(result.row.techStackItems);
    const resolvedTechStackItems =
      savedTechStackItems.length > 0 ? savedTechStackItems : defaultTechStackItems;

    setTechStackItems(resolvedTechStackItems);
    notifyTechStackUpdated(resolvedTechStackItems);
    setIsTechStackModalOpen(false);
    setTechStackModalMode("add");
    setEditingTechStackIndex(null);
    setTechStackForm(emptyTechStackForm);
    setTechStackLogoFile(null);

    if (isEditing) {
      setStatusText("Tech stack item updated and saved.");
      showModal("success", "Item Updated", "Tech stack item updated successfully.");
      return;
    }

    setStatusText("Tech stack item added and saved.");
    showModal("success", "Item Added", "Tech stack item added successfully.");
  };

  const askTechStackDecision = (
    title: string,
    message: string,
    action: TechStackDecisionAction,
  ) => {
    if (isSavingTechStack) {
      return;
    }

    setTechStackDecisionState({
      open: true,
      title,
      message,
      action,
    });
  };

  const handleRequestDeleteTechStackItem = (indexToRemove: number) => {
    const targetItem = techStackItems[indexToRemove];
    if (!targetItem) {
      return;
    }

    askTechStackDecision(
      "Confirm Delete",
      `Are you sure you want to remove \"${targetItem.name}\"?`,
      { kind: "delete", index: indexToRemove },
    );
  };

  const handleConfirmTechStackDecision = async () => {
    const action = techStackDecisionState.action;
    if (!action) {
      return;
    }

    setTechStackDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });

    await handleRemoveTechStackItem(action.index);
  };

  const handleCancelTechStackDecision = () => {
    if (isSavingTechStack) {
      return;
    }

    setTechStackDecisionState({
      open: false,
      title: "",
      message: "",
      action: null,
    });
  };

  const handleRemoveTechStackItem = async (indexToRemove: number) => {
    const targetItem = techStackItems[indexToRemove];
    if (!targetItem) {
      return;
    }

    const nextTechStackItems = techStackItems.filter((_, index) => index !== indexToRemove);
    setIsSavingTechStack(true);
    setStatusText("Removing tech stack item...");
    const result = await saveTechStackPatch(nextTechStackItems);
    setIsSavingTechStack(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedTechStackItems = toTechStackItemShapeList(result.row.techStackItems);
    const resolvedTechStackItems =
      savedTechStackItems.length > 0 ? savedTechStackItems : defaultTechStackItems;

    setTechStackItems(resolvedTechStackItems);
    notifyTechStackUpdated(resolvedTechStackItems);
    setStatusText("Tech stack item removed and saved.");
    showModal("success", "Item Removed", `Removed "${targetItem.name}".`);
  };

  const handleResetTechStack = async () => {
    setIsSavingTechStack(true);
    setStatusText("Resetting tech stack to default...");
    const result = await saveTechStackPatch(defaultTechStackItems);
    setIsSavingTechStack(false);

    if (!result.ok) {
      setStatusText(result.message);
      showModal("error", "Save Failed", result.message);
      return;
    }

    const savedTechStackItems = toTechStackItemShapeList(result.row.techStackItems);
    const resolvedTechStackItems =
      savedTechStackItems.length > 0 ? savedTechStackItems : defaultTechStackItems;

    setTechStackItems(resolvedTechStackItems);
    notifyTechStackUpdated(resolvedTechStackItems);
    setIsTechStackModalOpen(false);
    setTechStackModalMode("add");
    setEditingTechStackIndex(null);
    setTechStackForm(emptyTechStackForm);
    setTechStackLogoFile(null);
    setStatusText("Tech stack reset to default and saved.");
    showModal("success", "Tech Stack Reset", "Default tech stack restored.");
  };

  const isProjectActionBusy = isAddingProject || isSavingProjects;
  const isFigmaActionBusy = isSavingFigmaProject || isSavingFigmaProjects;
  const isCertificateActionBusy = isSavingCertificate || isSavingCertificates;
  const isTechStackActionBusy = isSavingTechStack;
  const techItemsPreview = techStackItems
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.category === "tech");
  const toolItemsPreview = techStackItems
    .map((item, index) => ({ ...item, index }))
    .filter((item) => item.category === "tool");

  return (
    <div className="space-y-4 ">






      {/* About Me */}
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





        {/* My Projects */}
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




        {/* Figma Projects */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-20 text-cyan-100">
          Figma Project
        </h1>
        <section className="rounded-2xl border border-indigo-300/25 bg-[#0c1226]/74 p-4 sm:p-5">
          <section className="rounded-xl border border-fuchsia-300/20 bg-[#1b0f2a]/78 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold uppercase tracking-[0.18em] text-fuchsia-200/90">
                  Figma Project Tiles
                </p>
                <p className="mt-1 text-sm text-fuchsia-100/70">
                  Manage every tile shown in `Figma Projects`.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRequestResetFigmaProjects}
                  disabled={isFigmaActionBusy}
                  className="rounded-lg border border-fuchsia-300/45 bg-fuchsia-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:bg-fuchsia-500/25 hover:shadow-[0_0_18px_rgba(217,70,239,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  Reset to Default
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddFigmaModal}
                  disabled={isFigmaActionBusy}
                  className="rounded-lg border border-cyan-300/45 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/25 hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  + Add Figma
                </button>
              </div>
            </div>

            {figmaProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {figmaProjects.map((figmaProject, index) => (
                  <article
                    key={`${figmaProject.title}-${index}`}
                    className="overflow-hidden rounded-xl border border-fuchsia-300/25 bg-[#180f2d]/80 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                  >
                    <div className="relative h-44 w-full overflow-hidden border-b border-fuchsia-300/20">
                      <iframe
                        src={figmaProject.src}
                        title={`${figmaProject.title} preview`}
                        className="absolute inset-0 h-full w-full"
                        style={{ border: "0" }}
                        allowFullScreen
                      />
                      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditFigmaModal(index)}
                          disabled={isFigmaActionBusy}
                          className="rounded-md border border-cyan-300/45 bg-cyan-500/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteFigmaProject(index)}
                          disabled={isFigmaActionBusy}
                          className="rounded-md border border-rose-300/45 bg-rose-500/85 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-fuchsia-100">
                        {figmaProject.title}
                      </h3>
                      <p className="break-all text-[0.68rem] leading-relaxed text-fuchsia-100/75">
                        {figmaProject.src}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-fuchsia-300/20 bg-[#140a22]/80 px-3 py-4 text-xs text-fuchsia-100/70">
                No Figma tiles yet. Click `+ Add Figma` to create one.
              </p>
            )}
          </section>
        </section>





        {/* Tech Stack & Dev Tools */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-20 text-cyan-100">
          Tech Stack
        </h1>
        <section className="rounded-2xl border border-indigo-300/25 bg-[#0c1226]/74 p-4 sm:p-5">
          <section className="rounded-xl border border-indigo-300/20 bg-[#101327]/78 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold uppercase tracking-[0.18em] text-emerald-200/90">
                  Tech Stack Tiles
                </p>
                <p className="mt-1 text-sm text-emerald-100/70">
                  Same as your main portfolio, with add, edit, remove, and restore-to-default controls.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleResetTechStack}
                  disabled={isTechStackActionBusy}
                  className="rounded-lg border border-emerald-300/45 bg-emerald-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/25 hover:shadow-[0_0_18px_rgba(16,185,129,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  Reset to Default
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddTechStackModal}
                  disabled={isTechStackActionBusy}
                  className="rounded-lg border border-cyan-300/45 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/25 hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  + Add Item
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-300/20 bg-[#08121a]/85 p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/85">
                Tech Stack
              </p>
              {techItemsPreview.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {techItemsPreview.map((item) => (
                    <article
                      key={`${item.name}-${item.index}`}
                      className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-md"
                    >
                      <div className="flex items-center justify-center text-4xl">
                        <TechStackItemVisual item={item} imageClassName="h-10 w-10 object-contain" />
                      </div>
                      <p className="mt-3 text-center text-xs font-semibold tracking-[0.04em] text-emerald-100">
                        {item.name}
                      </p>
                      <div className="mt-3 flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTechStackModal(item.index)}
                          disabled={isTechStackActionBusy}
                          className="rounded-md border border-cyan-300/45 bg-cyan-500/80 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteTechStackItem(item.index)}
                          disabled={isTechStackActionBusy}
                          className="rounded-md border border-rose-300/45 bg-rose-500/85 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-emerald-100/65">No tech stack items yet.</p>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-cyan-300/20 bg-[#08121a]/85 p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-200/85">
                Development & Design Tools
              </p>
              {toolItemsPreview.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {toolItemsPreview.map((item) => (
                    <article
                      key={`${item.name}-${item.index}`}
                      className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-md"
                    >
                      <div className="flex items-center justify-center text-3xl">
                        <TechStackItemVisual item={item} imageClassName="h-8 w-8 object-contain" />
                      </div>
                      <p className="mt-3 text-center text-xs font-semibold tracking-[0.04em] text-cyan-100">
                        {item.name}
                      </p>
                      <div className="mt-3 flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTechStackModal(item.index)}
                          disabled={isTechStackActionBusy}
                          className="rounded-md border border-cyan-300/45 bg-cyan-500/80 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteTechStackItem(item.index)}
                          disabled={isTechStackActionBusy}
                          className="rounded-md border border-rose-300/45 bg-rose-500/85 px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-cyan-100/65">No tool items yet.</p>
              )}
            </div>
          </section>
        </section>





        {/* Certificates */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-20 text-cyan-100">
          Certificates
        </h1>
        <section className="rounded-2xl border border-indigo-300/25 bg-[#0c1226]/74 p-4 sm:p-5">
          <section className="rounded-xl border border-orange-300/20 bg-[#111019]/75 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold uppercase tracking-[0.18em] text-amber-200/90">
                  Certificate Tiles
                </p>
                <p className="mt-1 text-sm text-amber-100/70">
                  Manage every tile shown in `My Certificates`.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRequestResetCertificates}
                  disabled={isCertificateActionBusy}
                  className="rounded-lg border border-amber-300/45 bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-500/25 hover:shadow-[0_0_18px_rgba(245,158,11,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  Reset to Default
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddCertificateModal}
                  disabled={isCertificateActionBusy}
                  className="rounded-lg border border-cyan-300/45 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/25 hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] disabled:cursor-wait disabled:opacity-70"
                >
                  + Add Certificate
                </button>
              </div>
            </div>

            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {certificates.map((certificate, index) => (
                  <article
                    key={`${certificate.title}-${index}`}
                    className="overflow-hidden rounded-xl border border-amber-300/25 bg-[#251a07]/80 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                  >
                    <div className="relative h-36 w-full overflow-hidden border-b border-amber-300/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={certificate.image}
                        alt={certificate.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = fallbackCertificateImage;
                        }}
                      />
                      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCertificateModal(index)}
                          disabled={isCertificateActionBusy}
                          className="rounded-md border border-cyan-300/45 bg-cyan-500/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteCertificate(index)}
                          disabled={isCertificateActionBusy}
                          className="rounded-md border border-rose-300/45 bg-rose-500/85 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-70"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-amber-100">
                        {certificate.title}
                      </h3>
                      <p className="text-xs text-amber-100/80">{certificate.issuer}</p>
                      <p className="break-all text-[0.66rem] leading-relaxed text-amber-100/70">
                        {certificate.verifyUrl ?? "No verify URL provided."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-amber-300/20 bg-[#1c1205]/80 px-3 py-4 text-xs text-amber-100/70">
                No certificate tiles yet. Click `+ Add Certificate` to create one.
              </p>
            )}
          </section>
        </section>






        {/* Contact Information */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-20 text-cyan-100">
          Contact Me
        </h1>
        <section className="mb-20 rounded-2xl border border-indigo-300/25 bg-[#0c1226]/74 p-4 sm:p-5">
          <section className="rounded-xl border border-sky-300/20 bg-[#071322]/75 p-4 sm:p-5">
            <p className="mb-2 text-md font-semibold uppercase tracking-[0.18em] text-sky-200/85">
              Contact Details
            </p>
            <div className="mb-3">
              <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                Contact Intro Text
              </label>
              <input
                type="text"
                value={contactTagline}
                onChange={(event) => setContactTagline(event.target.value)}
                placeholder="Let's build something together!"
                className="w-full rounded-lg border border-sky-300/25 bg-[#071426] p-3 text-sm text-sky-50 outline-none placeholder:text-sky-100/35 focus:border-sky-300/55 focus:shadow-[0_0_0_2px_rgba(56,189,248,0.16)]"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                  Contact Emails
                </label>
                <div className="space-y-2">
                  {contactEmails.map((email, index) => (
                    <div key={`contact-email-${index}`} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          handleContactEmailChange(index, event.target.value)
                        }
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-sky-300/25 bg-[#071426] p-3 text-sm text-sky-50 outline-none placeholder:text-sky-100/35 focus:border-sky-300/55 focus:shadow-[0_0_0_2px_rgba(56,189,248,0.16)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveContactEmailField(index)}
                        disabled={contactEmails.length <= 1}
                        className="rounded-lg border border-sky-300/30 bg-sky-500/15 px-2 py-2 text-[0.62rem] font-semibold uppercase tracking-widest text-sky-100 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddContactEmailField}
                  className="mt-2 rounded-lg border border-sky-300/35 bg-sky-500/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-sky-100 transition hover:bg-sky-500/20"
                >
                  + Add Email
                </button>
              </div>
              <div>
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                  Contact Phones
                </label>
                <div className="space-y-2">
                  {contactPhones.map((phone, index) => (
                    <div key={`contact-phone-${index}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(event) =>
                          handleContactPhoneChange(index, event.target.value)
                        }
                        placeholder="+63 900 000 0000"
                        className="w-full rounded-lg border border-sky-300/25 bg-[#071426] p-3 text-sm text-sky-50 outline-none placeholder:text-sky-100/35 focus:border-sky-300/55 focus:shadow-[0_0_0_2px_rgba(56,189,248,0.16)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveContactPhoneField(index)}
                        disabled={contactPhones.length <= 1}
                        className="rounded-lg border border-sky-300/30 bg-sky-500/15 px-2 py-2 text-[0.62rem] font-semibold uppercase tracking-widest text-sky-100 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddContactPhoneField}
                  className="mt-2 rounded-lg border border-sky-300/35 bg-sky-500/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-sky-100 transition hover:bg-sky-500/20"
                >
                  + Add Phone
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveContactInfo}
              disabled={isSavingContact}
              className="mt-3 rounded-lg border border-sky-300/45 bg-sky-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 transition hover:bg-sky-500/25 hover:shadow-[0_0_18px_rgba(56,189,248,0.26)] disabled:cursor-wait disabled:opacity-75"
            >
              {isSavingContact ? "Saving..." : "Save Contact Info"}
            </button>
          </section>
        </section>




        <p className="rounded-lg border border-orange-300/20 bg-[#111019]/75 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100/90">
          {statusText}
        </p>
        {/* End Section */}
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

      {isFigmaModalOpen ? (
        <div className="fixed inset-0 z-96 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-fuchsia-300/40 bg-[#130d22] p-5 shadow-[0_0_45px_rgba(217,70,239,0.25)] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fuchsia-200/85">
                  {figmaModalMode === "edit" ? "Edit Figma Tile" : "New Figma Tile"}
                </p>
                <h3 className="mt-1 text-lg font-semibold uppercase tracking-[0.06em] text-fuchsia-100">
                  {figmaModalMode === "edit" ? "Edit Figma Project" : "Add Figma Project"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseFigmaModal}
                disabled={isFigmaActionBusy}
                className="rounded-md border border-fuchsia-300/45 bg-fuchsia-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:bg-fuchsia-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-fuchsia-200/80">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newFigmaForm.title}
                  onChange={(event) =>
                    setNewFigmaForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Figma project name"
                  className="w-full rounded-lg border border-fuchsia-300/25 bg-[#1b1230] p-3 text-sm text-fuchsia-50 outline-none placeholder:text-fuchsia-100/35 focus:border-fuchsia-300/55 focus:shadow-[0_0_0_2px_rgba(217,70,239,0.16)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-fuchsia-200/80">
                  Figma Embed URL
                </label>
                <input
                  type="url"
                  value={newFigmaForm.src}
                  onChange={(event) =>
                    setNewFigmaForm((current) => ({ ...current, src: event.target.value }))
                  }
                  placeholder="https://embed.figma.com/proto/..."
                  className="w-full rounded-lg border border-fuchsia-300/25 bg-[#1b1230] p-3 text-sm text-fuchsia-50 outline-none placeholder:text-fuchsia-100/35 focus:border-fuchsia-300/55 focus:shadow-[0_0_0_2px_rgba(217,70,239,0.16)]"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRequestFigmaSubmit}
                disabled={isFigmaActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                {isSavingFigmaProject
                  ? figmaModalMode === "edit"
                    ? "Updating..."
                    : "Adding..."
                  : figmaModalMode === "edit"
                    ? "Save Changes"
                    : "Add Tile"}
              </button>
              <button
                type="button"
                onClick={handleCloseFigmaModal}
                disabled={isFigmaActionBusy}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isCertificateModalOpen ? (
        <div className="fixed inset-0 z-97 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-amber-300/40 bg-[#1f1406] p-5 shadow-[0_0_45px_rgba(245,158,11,0.25)] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-200/85">
                  {certificateModalMode === "edit" ? "Edit Certificate Tile" : "New Certificate Tile"}
                </p>
                <h3 className="mt-1 text-lg font-semibold uppercase tracking-[0.06em] text-amber-100">
                  {certificateModalMode === "edit" ? "Edit Certificate" : "Add Certificate"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCertificateModal}
                disabled={isCertificateActionBusy}
                className="rounded-md border border-amber-300/45 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-amber-200/80">
                  Picture Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewCertificateImageFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-lg border border-amber-300/25 bg-[#2a1c09] p-2 text-sm text-amber-50 file:mr-3 file:rounded file:border-0 file:bg-amber-500/30 file:px-3 file:py-2 file:text-[0.68rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-amber-100 hover:file:bg-amber-500/40"
                />
                {certificateModalMode === "edit" ? (
                  <p className="mt-1 text-[0.66rem] text-amber-100/70">
                    Optional: leave empty to keep the current image.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-amber-200/80">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={newCertificateForm.title}
                  onChange={(event) =>
                    setNewCertificateForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Certificate title"
                  className="w-full rounded-lg border border-amber-300/25 bg-[#2a1c09] p-3 text-sm text-amber-50 outline-none placeholder:text-amber-100/35 focus:border-amber-300/55 focus:shadow-[0_0_0_2px_rgba(245,158,11,0.16)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-amber-200/80">
                  Issuer
                </label>
                <input
                  type="text"
                  value={newCertificateForm.issuer}
                  onChange={(event) =>
                    setNewCertificateForm((current) => ({ ...current, issuer: event.target.value }))
                  }
                  placeholder="Udemy.com"
                  className="w-full rounded-lg border border-amber-300/25 bg-[#2a1c09] p-3 text-sm text-amber-50 outline-none placeholder:text-amber-100/35 focus:border-amber-300/55 focus:shadow-[0_0_0_2px_rgba(245,158,11,0.16)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-amber-200/80">
                  Verify URL
                </label>
                <input
                  type="url"
                  value={newCertificateForm.verifyUrl}
                  onChange={(event) =>
                    setNewCertificateForm((current) => ({ ...current, verifyUrl: event.target.value }))
                  }
                  placeholder="https://www.udemy.com/certificate/..."
                  className="w-full rounded-lg border border-amber-300/25 bg-[#2a1c09] p-3 text-sm text-amber-50 outline-none placeholder:text-amber-100/35 focus:border-amber-300/55 focus:shadow-[0_0_0_2px_rgba(245,158,11,0.16)]"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRequestCertificateSubmit}
                disabled={isCertificateActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                {isSavingCertificate
                  ? certificateModalMode === "edit"
                    ? "Updating..."
                    : "Adding..."
                  : certificateModalMode === "edit"
                    ? "Save Changes"
                    : "Add Tile"}
              </button>
              <button
                type="button"
                onClick={handleCloseCertificateModal}
                disabled={isCertificateActionBusy}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isTechStackModalOpen ? (
        <div className="fixed inset-0 z-97 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-emerald-300/40 bg-[#071b12] p-5 shadow-[0_0_45px_rgba(16,185,129,0.24)] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-200/85">
                  {techStackModalMode === "edit" ? "Edit Tech Stack Item" : "New Tech Stack Item"}
                </p>
                <h3 className="mt-1 text-lg font-semibold uppercase tracking-[0.06em] text-emerald-100">
                  {techStackModalMode === "edit" ? "Edit Item" : "Add Item"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseTechStackModal}
                disabled={isTechStackActionBusy}
                className="rounded-md border border-emerald-300/45 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                  Item Name
                </label>
                <input
                  type="text"
                  value={techStackForm.name}
                  onChange={(event) =>
                    setTechStackForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Next.js"
                  className="w-full rounded-lg border border-emerald-300/25 bg-[#102a1e] p-3 text-sm text-emerald-50 outline-none placeholder:text-emerald-100/35 focus:border-emerald-300/55 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.16)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                  Category
                </label>
                <select
                  value={techStackForm.category}
                  onChange={(event) =>
                    setTechStackForm((current) => ({
                      ...current,
                      category: event.target.value as TechStackCategory,
                    }))
                  }
                  className="w-full rounded-lg border border-emerald-300/25 bg-[#102a1e] p-3 text-sm text-emerald-50 outline-none focus:border-emerald-300/55 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.16)]"
                >
                  <option value="tech">Tech Stack</option>
                  <option value="tool">Development & Design Tools</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                  Logo URL or Path
                </label>
                <input
                  type="text"
                  value={techStackForm.logoUrl}
                  onChange={(event) =>
                    setTechStackForm((current) => ({ ...current, logoUrl: event.target.value }))
                  }
                  placeholder="/image/github.png or https://..."
                  className="w-full rounded-lg border border-emerald-300/25 bg-[#102a1e] p-3 text-sm text-emerald-50 outline-none placeholder:text-emerald-100/35 focus:border-emerald-300/55 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.16)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                  Upload Logo File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setTechStackLogoFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-lg border border-emerald-300/25 bg-[#102a1e] p-2 text-sm text-emerald-50 file:mr-3 file:rounded file:border-0 file:bg-emerald-500/30 file:px-3 file:py-2 file:text-[0.68rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-emerald-100 hover:file:bg-emerald-500/40"
                />
                <p className="mt-1 text-[0.66rem] text-emerald-100/65">
                  Optional. If selected, upload will be used as logo.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveTechStack}
                disabled={isTechStackActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                {isSavingTechStack
                  ? techStackModalMode === "edit"
                    ? "Updating..."
                    : "Adding..."
                  : techStackModalMode === "edit"
                    ? "Save Changes"
                    : "Add Item"}
              </button>
              <button
                type="button"
                onClick={handleCloseTechStackModal}
                disabled={isTechStackActionBusy}
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

      {figmaDecisionState.open ? (
        <div className="fixed inset-0 z-98 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-fuchsia-300/45 bg-[#1d0a1a] p-5 shadow-[0_0_35px_rgba(217,70,239,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              Confirm Action
            </p>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-[0.06em] text-fuchsia-100">
              {figmaDecisionState.title}
            </h3>
            <p className="mt-2 text-sm text-fuchsia-100/85">{figmaDecisionState.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmFigmaDecision}
                disabled={isFigmaActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelFigmaDecision}
                disabled={isFigmaActionBusy}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {certificateDecisionState.open ? (
        <div className="fixed inset-0 z-98 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-300/45 bg-[#1f1406] p-5 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Confirm Action
            </p>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-[0.06em] text-amber-100">
              {certificateDecisionState.title}
            </h3>
            <p className="mt-2 text-sm text-amber-100/85">{certificateDecisionState.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmCertificateDecision}
                disabled={isCertificateActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelCertificateDecision}
                disabled={isCertificateActionBusy}
                className="rounded-md border border-cyan-300/35 bg-cyan-500/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-wait disabled:opacity-70"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {techStackDecisionState.open ? (
        <div className="fixed inset-0 z-98 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300/45 bg-[#071b12] p-5 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Confirm Action
            </p>
            <h3 className="mt-2 text-lg font-semibold uppercase tracking-[0.06em] text-emerald-100">
              {techStackDecisionState.title}
            </h3>
            <p className="mt-2 text-sm text-emerald-100/85">{techStackDecisionState.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmTechStackDecision}
                disabled={isTechStackActionBusy}
                className="rounded-md border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-wait disabled:opacity-70"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelTechStackDecision}
                disabled={isTechStackActionBusy}
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
