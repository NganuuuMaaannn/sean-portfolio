"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type FigmaProjectShape = {
  title: string;
  src: string;
};

type PortfolioFigmaProjectDbRow = {
  id: string;
  owner_id: string;
  title: string;
  src: string;
  sort_order: number;
};

function toFigmaProjectArray(value: unknown): FigmaProjectShape[] {
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

export default function Figma() {
  const [figmaProjects, setFigmaProjects] = useState<FigmaProjectShape[]>(defaultFigmaProjects);
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    const applyFigmaProjects = (rows: PortfolioFigmaProjectDbRow[]) => {
      if (!active) {
        return;
      }

      const figmaPayload = rows.map((row) => ({
        title: row.title,
        src: row.src,
      }));
      const parsedFigmaProjects = toFigmaProjectArray(figmaPayload);
      setFigmaProjects(parsedFigmaProjects.length > 0 ? parsedFigmaProjects : defaultFigmaProjects);
    };

    const loadFigmaProjects = async () => {
      const { data, error } = await supabase
        .from("portfolio_figma_projects")
        .select("id, owner_id, title, src, sort_order")
        .eq("owner_id", "main")
        .order("sort_order", { ascending: true })
        .returns<PortfolioFigmaProjectDbRow[]>();

      if (error || !data) {
        return;
      }

      applyFigmaProjects(data);
    };

    void loadFigmaProjects();

    const channel = supabase
      .channel("portfolio-figma-public-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_figma_projects",
          filter: "owner_id=eq.main",
        },
        () => {
          void loadFigmaProjects();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <section
      id="figma-projects"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 py-16 sm:py-20 mt-8 sm:mt-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex flex-col items-center justify-center p-2 sm:p-4"
      >
        <div className="w-full max-w-6xl">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Figma Projects
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {figmaProjects.map((project, index) => (
              <motion.div
                key={`${project.title}-${index}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: index * 0.3 }}
                viewport={{ once: true, amount: 0.2 }}
                className="bg-white text-black rounded-lg overflow-hidden shadow-lg"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                </div>
                <div className="relative w-full min-h-[400px] sm:min-h-[500px]" style={{ aspectRatio: "4 / 3" }}>
                  <iframe
                    style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
                    width="100%"
                    height="100%"
                    src={project.src}
                    allowFullScreen
                    title={`${project.title} Figma Live Preview`}
                    className="absolute inset-0"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
