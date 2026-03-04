"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProjectCard, { type Props } from "./ProjectCard";
import { createClient } from "@/lib/supabase/client";

function toProjectArray(value: unknown): Props[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): Props | null => {
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

      const normalizedProject: Props = {
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
    .filter((entry): entry is Props => entry !== null);
}

const defaultProjects: Props[] = [
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

export default function Projects() {
  const [projects, setProjects] = useState<Props[]>(defaultProjects);
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

    const applyProjects = (projectsValue: unknown) => {
      if (!active) {
        return;
      }

      const parsedProjects = toProjectArray(projectsValue);
      setProjects(parsedProjects.length > 0 ? parsedProjects : defaultProjects);
    };

    const loadProjects = async () => {
      const { data, error } = await supabase
        .from("portfolio_content")
        .select("projects")
        .eq("id", "main")
        .maybeSingle<{ projects: unknown }>();

      if (error || !data) {
        return;
      }

      applyProjects(data.projects);
    };

    void loadProjects();

    const channel = supabase
      .channel("portfolio-content-public-projects-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_content",
          filter: "id=eq.main",
        },
        (payload) => {
          const nextRow = payload.new as { projects?: unknown } | null;
          if (!nextRow || !Object.prototype.hasOwnProperty.call(nextRow, "projects")) {
            return;
          }

          applyProjects(nextRow.projects);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section
      id="projects"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 mt-16"
    >
      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        My Projects
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={`${project.title}-${index}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: index * 0.3 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
