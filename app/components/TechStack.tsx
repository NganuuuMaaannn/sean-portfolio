"use client";

import { type ReactElement, useEffect, useState } from "react";
import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiNodedotjs,
  SiFigma, SiGit, SiGithub, SiVercel, SiAdobephotoshop, SiAdobepremierepro
} from "react-icons/si";
import { IoLogoJavascript } from "react-icons/io5";
import { FaHtml5, FaCss3Alt, FaBootstrap, FaCode, FaToolbox } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import { motion, Variants } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type TechStackCategory = "tech" | "tool";

type TechStackItem = {
  name: string;
  category: TechStackCategory;
  logoUrl?: string;
};

type PortfolioTechStackDbRow = {
  id: string;
  owner_id: string;
  name: string;
  category: TechStackCategory;
  logo_url: string | null;
  sort_order: number;
};

function toTechStackItems(value: unknown): TechStackItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): TechStackItem | null => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const category =
        record.category === "tech" || record.category === "tool"
          ? record.category
          : null;
      const logoUrlValue =
        typeof record.logoUrl === "string"
          ? record.logoUrl
          : typeof record.logo_url === "string"
            ? record.logo_url
            : "";
      const logoUrl =
        typeof logoUrlValue === "string" && logoUrlValue.trim()
          ? logoUrlValue.trim()
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
    .filter((entry): entry is TechStackItem => entry !== null);
}

const defaultTechStackItems: TechStackItem[] = [
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

function areTechStackItemsEqual(left: TechStackItem[], right: TechStackItem[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftItem = left[index];
    const rightItem = right[index];

    if (!leftItem || !rightItem) {
      return false;
    }

    if (
      leftItem.name !== rightItem.name ||
      leftItem.category !== rightItem.category ||
      (leftItem.logoUrl ?? "") !== (rightItem.logoUrl ?? "")
    ) {
      return false;
    }
  }

  return true;
}

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

function getFallbackItemIcon(name: string, category: TechStackCategory) {
  const normalized = name.trim().toLowerCase();

  if (category === "tool") {
    return toolIconByName[normalized] ?? <FaToolbox className="text-amber-400" />;
  }

  return techIconByName[normalized] ?? <FaCode className="text-cyan-300" />;
}

function TechStackItemVisual({
  item,
  imageClassName,
}: {
  item: TechStackItem;
  imageClassName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (item.logoUrl && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.logoUrl}
        alt={`${item.name} logo`}
        loading="lazy"
        decoding="async"
        className={imageClassName}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return getFallbackItemIcon(item.name, item.category);
}

export default function TechStack() {
  const [items, setItems] = useState<TechStackItem[]>(defaultTechStackItems);
  const [hasTechEnteredViewport, setHasTechEnteredViewport] = useState(false);
  const [hasToolsEnteredViewport, setHasToolsEnteredViewport] = useState(false);
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const techStackItemsStorageKey = "portfolio-tech-stack-items";
    const techStackUpdatedAtStorageKey = "portfolio-tech-stack-updated-at";
    const techStackUpdatesChannelName = "portfolio-tech-stack-updates";

    let active = true;
    let reloadTimeout: number | null = null;
    let updatesChannel: BroadcastChannel | null = null;

    const applyParsedItems = (nextItems: TechStackItem[]) => {
      setItems((current) =>
        areTechStackItemsEqual(current, nextItems) ? current : nextItems,
      );
    };

    const applyItemsSnapshot = (value: unknown) => {
      const parsedItems = toTechStackItems(value);
      if (parsedItems.length === 0) {
        return false;
      }

      applyParsedItems(parsedItems);
      return true;
    };

    const loadItemsFromStorage = () => {
      try {
        const cached = window.localStorage.getItem(techStackItemsStorageKey);
        if (!cached) {
          return false;
        }

        return applyItemsSnapshot(JSON.parse(cached) as unknown);
      } catch {
        return false;
      }
    };

    const applyItems = (rows: PortfolioTechStackDbRow[]) => {
      if (!active) {
        return;
      }

      const payload = rows.map((row) => ({
        name: row.name,
        category: row.category,
        logoUrl: row.logo_url ?? undefined,
      }));
      const parsedItems = toTechStackItems(payload);
      if (parsedItems.length > 0) {
        applyParsedItems(parsedItems);

        try {
          window.localStorage.setItem(techStackItemsStorageKey, JSON.stringify(parsedItems));
          window.localStorage.setItem(techStackUpdatedAtStorageKey, Date.now().toString());
        } catch {
          // Ignore storage write failures.
        }
        return;
      }

      // Avoid transient empty flashes during fast multi-row updates.
      setItems((current) => (current.length > 0 ? current : defaultTechStackItems));
    };

    const loadItems = async () => {
      const { data, error } = await supabase
        .from("portfolio_tech_stack_items")
        .select("id, owner_id, name, category, logo_url, sort_order")
        .eq("owner_id", "main")
        .order("sort_order", { ascending: true })
        .returns<PortfolioTechStackDbRow[]>();

      if (error || !data) {
        loadItemsFromStorage();
        return;
      }

      applyItems(data);
    };

    const scheduleReload = () => {
      if (reloadTimeout !== null) {
        window.clearTimeout(reloadTimeout);
      }

      reloadTimeout = window.setTimeout(() => {
        reloadTimeout = null;
        if (!active) {
          return;
        }
        void loadItems();
      }, 140);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === techStackItemsStorageKey && event.newValue) {
        try {
          const snapshot = JSON.parse(event.newValue) as unknown;
          if (applyItemsSnapshot(snapshot)) {
            return;
          }
        } catch {
          // Ignore malformed storage payloads.
        }
      }

      if (
        event.key === techStackUpdatedAtStorageKey ||
        event.key === techStackItemsStorageKey
      ) {
        scheduleReload();
      }
    };

    const handleFocus = () => {
      scheduleReload();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleReload();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    try {
      updatesChannel = new BroadcastChannel(techStackUpdatesChannelName);
      updatesChannel.onmessage = (event) => {
        if (typeof event.data === "object" && event.data !== null) {
          const payload = event.data as Record<string, unknown>;
          if (
            Object.prototype.hasOwnProperty.call(payload, "items") &&
            applyItemsSnapshot(payload.items)
          ) {
            return;
          }
        }

        scheduleReload();
      };
    } catch {
      updatesChannel = null;
    }

    loadItemsFromStorage();
    void loadItems();
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadItems();
      }
    }, 6000);

    const channel = supabase
      .channel("portfolio-tech-stack-public-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_tech_stack_items",
          filter: "owner_id=eq.main",
        },
        () => {
          scheduleReload();
        },
      )
      .subscribe();

    return () => {
      active = false;
      if (reloadTimeout !== null) {
        window.clearTimeout(reloadTimeout);
      }
      window.clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (updatesChannel) {
        updatesChannel.close();
      }
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const techItems = items.filter((itemEntry) => itemEntry.category === "tech");
  const toolItems = items.filter((itemEntry) => itemEntry.category === "tool");

  return (
    <section id="tech-stack" className="w-full py-11">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 mb-20 sm:mb-36">

        {/* Title */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Tech Stack
        </motion.h2>

        {/* Tech Stack Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          onViewportEnter={() => setHasTechEnteredViewport(true)}
        >
          {techItems.map((itemData, index) => (
            <motion.div
              key={`${itemData.name}-${index}`}
              variants={item}
              initial={hasTechEnteredViewport ? "hidden" : undefined}
              animate={hasTechEnteredViewport ? "show" : undefined}
              whileHover={{ rotate: -1, scale: 1.05, y: "-2%" }}
              transition={{ type: "spring", duration: 0.8 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg hover:shadow-xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-4xl">
                <TechStackItemVisual item={itemData} imageClassName="h-10 w-10 object-contain" />
              </div>
              <p className="text-sm">{itemData.name}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tools Title */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Development & Design Tools
        </motion.h2>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          onViewportEnter={() => setHasToolsEnteredViewport(true)}
        >
          {toolItems.map((itemData, index) => (
            <motion.div
              key={`${itemData.name}-${index}`}
              variants={item}
              initial={hasToolsEnteredViewport ? "hidden" : undefined}
              animate={hasToolsEnteredViewport ? "show" : undefined}
              whileHover={{ rotate: -1, scale: 1.05, y: "-2%" }}
              transition={{ type: "spring", duration: 0.8 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg hover:shadow-xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-4xl">
                <TechStackItemVisual item={itemData} imageClassName="h-10 w-10 object-contain" />
              </div>
              <p className="text-sm">{itemData.name}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
