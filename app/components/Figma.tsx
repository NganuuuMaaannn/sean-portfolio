"use client";

import { motion } from "framer-motion";

export default function Figma() {
  const figmaProjects = [
    {
      title: "BayadBox",
      src: "https://embed.figma.com/proto/3KLXXroJN0EesN8sAyrSBY/BayadBox?scaling=scale-down&content-scaling=fixed&page-id=0%3A1&node-id=222-622&starting-point-node-id=222%3A622&show-proto-sidebar=0&embed-host=share"
    },
    {
      title: "Riane’s Violet Studio Cafe",
      src: "https://embed.figma.com/proto/YyMdjt2ij2eQVJtHT7KXH0/Doinog_ButtonDesignActivity?node-id=1-2&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2&show-proto-sidebar=0&embed-host=share"
    }
  ];

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
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: index * 0.3 }}
                viewport={{ once: true, amount: 0.2 }}
                className="bg-white text-black rounded-lg overflow-hidden shadow-lg"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                </div>
                <div className="relative w-full aspect-[4/3] min-h-[260px] sm:min-h-[380px]">
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
