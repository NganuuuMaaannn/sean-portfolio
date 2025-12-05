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
      description: "Goal Management Application",
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
