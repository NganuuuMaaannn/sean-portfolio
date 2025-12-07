"use client";

import ProjectCard from "./ProjectCard";

export default function Projects() {
  const projects = [
    {
      title: "BayadBox",
      description: "An Automated Fare Collection System Using IoT for PUV.",
      image: "/image/bayadbox.png",
      tech: ["React Native", "Supabase"],
      liveUrl: "https://github.com/NganuuuMaaannn/bayadBox",
    },
    {
      title: "Think A Goal",
      description: "A Goal Management Application using Expo CLI.",
      image: "/image/think-a-goal.png",
      tech: ["React Native", "Firebase"],
      liveUrl: "https://github.com/NganuuuMaaannn/think-a-goal",
    },
    {
      title: "Love, Davao",
      description: "A web project showcasing Davao City’s culture, attractions, and the 11 Indigenous Tribes of Davao.",
      image: "/image/love-davao.png",
      tech: ["Next.js", "Tailwind CSS", "TypeScript"],
      liveUrl: "https://love-davao.vercel.app",
    },
    {
      title: "HCDC ITS Online Membership System",
      description: "Online Membership Fee Management System with Attendance Monitoring for ITS Organization.",
      image: "/image/onlinememfee.png",
      tech: ["Next.js", "Tailwind CSS", "PostgreSQL"],
      liveUrl: "https://hcdc-itsociety.vercel.app",
    },
    {
      title: "HCDC Comelec Voting System",
      description: "Online Membership Fee Management System with Attendance Monitoring for ITS Organization.",
      image: "/image/hcdc-comelec.png",
      tech: ["Next.js", "Tailwind CSS", "Postgres SQL"],
      liveUrl: "https://github.com/NganuuuMaaannn/HCDC-Comelec-2025",
    },
    {
      title: "Portfolio Website",
      description: "A modern, responsive portfolio built with Next.js, Tailwind CSS, and TypeScript to showcase my front-end and UI/UX skills.",
      image: "/image/portfolio.png",
      tech: ["Next.js", "Tailwind CSS", "TypeScript"],
      liveUrl: "https://github.com/NganuuuMaaannn/sean-portfolio",
    },
  ];

  return (
    <section id="projects" className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center">My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {projects.map(p => (
          <ProjectCard key={p.title} {...p} />
        ))}
      </div>
    </section>
  );
}
