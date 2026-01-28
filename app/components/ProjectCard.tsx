"use client";

import { FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export type Props = {
    title: string;
    description: string;
    image: string;
    tech: string[];
    liveUrl?: string;
    type?: "app" | "web";
    private?: boolean;
};

export default function ProjectCard({
    title,
    description,
    image,
    tech,
    liveUrl,
    type,
    private: isPrivate,
}: Props) {
    const label =
        type === "app" ? "Check Repository" : "Check Live Site";

    return (
        <motion.div
            whileHover={{ y: "-1%", scale: 1.01 }}
            transition={{ type: "spring", duration: 1 }}
            className="flex flex-col z-10 h-[420px] lg:h-[550px] rounded-xl shadow-xl overflow-hidden group bg-white/10 backdrop-blur-md border border-white/10"
        >
            <div className="relative h-60 sm:h-64 md:h-72 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>

            <div className="p-4 sm:p-6 flex flex-col grow">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
                <p className="text-sm sm:text-base mb-2">{description}</p>

                <div className="mt-auto">
                    <div className="flex gap-3 mb-4 text-indigo-400">
                        {tech.map((t, i) => (
                            <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs">
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* Private repo handling */}
                    {isPrivate ? (
                        <span className="text-sm text-red-400 italic">
                            Private Repository
                        </span>
                    ) : (
                        liveUrl && (
                            <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline"
                            >
                                {label} <FaExternalLinkAlt />
                            </a>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}
