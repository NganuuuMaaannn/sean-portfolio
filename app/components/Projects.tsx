"use client";

import React from "react";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  const projects = [
    { title: 'Portfolio Website', description: 'A sleek one-page portfolio built with Next.js & Tailwind.' },
    { title: 'Firebase Auth Flow', description: 'Robust authentication with modular config and error handling.' },
  ];

  return (
    <section id="projects" className="min-h-screen flex flex-col justify-center items-center px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
        {projects.map(p => (
          <ProjectCard key={p.title} title={p.title} description={p.description} />
        ))}
      </div>
    </section>
  );
}
