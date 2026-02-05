"use client";

import { 
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiNodedotjs,
  SiFigma, SiGit, SiGithub, SiVercel, SiAdobephotoshop, SiAdobepremierepro
} from "react-icons/si";
import { RiVuejsFill } from "react-icons/ri";
import { FaLaravel } from "react-icons/fa6";
import { IoLogoJavascript } from "react-icons/io5";
import { FaHtml5, FaCss3Alt, FaBootstrap } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import { motion, Variants } from "framer-motion";

export default function TechStack() {
  const tech = [
    { name: "React Native", icon: <SiReact className="text-sky-400" /> },
    { name: "React JS", icon: <SiReact className="text-sky-400" /> },
    { name: "Next.js", icon: <SiNextdotjs /> },
    { name: "TypeScript", icon: <SiTypescript className="text-blue-500" /> },
    { name: "JavaScript", icon: <IoLogoJavascript className="text-yellow-500" /> },
    { name: "Tailwind CSS", icon: <SiTailwindcss className="text-cyan-400" /> },
    { name: "Vue.js", icon: <RiVuejsFill className="text-green-500" /> },
    { name: "Laravel", icon: <FaLaravel className="text-orange-500" /> },
    { name: "Node.js", icon: <SiNodedotjs className="text-green-500" /> },
    { name: "HTML", icon: <FaHtml5 className="text-orange-500" /> },
    { name: "CSS", icon: <FaCss3Alt className="text-blue-500" /> },
    { name: "Bootstrap", icon: <FaBootstrap className="text-purple-500" /> },
  ];

  const tools = [
    { name: "Visual Studio Code", icon: <VscVscode className="text-blue-500" /> },
    { name: "Vercel", icon: <SiVercel /> },
    { name: "Figma", icon: <SiFigma className="text-pink-500" /> },
    { name: "GitHub", icon: <SiGithub /> },
    { name: "Git", icon: <SiGit className="text-orange-500" /> },
    { name: "Photoshop", icon: <SiAdobephotoshop className="text-blue-500" /> },
    { name: "Premiere Pro", icon: <SiAdobepremierepro className="text-blue-500" /> },
  ];

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

  return (
    <section id="tech-stack" className="w-full py-11">
      <div className="max-w-6xl mx-auto px-4 sm:px-1 mt-16 mb-36">

        {/* Title */}
        <motion.h2
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Tech Stack
        </motion.h2>

        {/* Tech Stack Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tech.map((itemData) => (
            <motion.div
              key={itemData.name}
              variants={item}
              whileHover={{ rotate: -1, scale: 1.05, y: "-2%" }}
              transition={{ type: "spring", duration: 0.8 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg hover:shadow-xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-4xl">{itemData.icon}</div>
              <p className="text-sm">{itemData.name}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tools Title */}
        <motion.h2
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          Development & Design Tools
        </motion.h2>

        {/* Tools Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tools.map((itemData) => (
            <motion.div
              key={itemData.name}
              variants={item}
              whileHover={{ rotate: -1, scale: 1.05, y: "-2%" }}
              transition={{ type: "spring", duration: 0.8 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg hover:shadow-xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="text-3xl">{itemData.icon}</div>
              <p className="text-sm">{itemData.name}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
