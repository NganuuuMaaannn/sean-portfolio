"use client";

import { useState } from "react";
import ContactInfo from "../components/ContactInfo";
import { motion } from "framer-motion";

export default function Contact() {
    const [copied, setCopied] = useState<string | null>(null);
    const [confettiPos, setConfettiPos] = useState<{ x: number; y: number } | null>(null);

    const handleCopy = async (text: string, e: React.MouseEvent<HTMLSpanElement>) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(text);

            // Get click position relative to viewport
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setConfettiPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });

            // Reset after 2 seconds
            setTimeout(() => {
                setCopied(null);
                setConfettiPos(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <section
            id="contact"
            className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 text-center relative"
        >
            <motion.h2
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            >
                Contact Me
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-sm sm:text-base md:text-lg"
            >
                Let's build something together!
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                viewport={{ once: true }}
            >
                <ContactInfo handleCopy={handleCopy} />
            </motion.div>

            {/* Confetti GIF at click position */}
            {confettiPos && (
                <img
                    src="/confetti.gif"
                    alt="Confetti"
                    className="w-32 h-32 fixed pointer-events-none z-40"
                    style={{
                        left: confettiPos.x,
                        top: confettiPos.y,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            )}

            {/* Glassmorphism toast */}
            {copied && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-md px-6 py-2 rounded-xl shadow-lg border border-white/20 animate-slideUp">
                    Copied to Clipboard
                </div>
            )}
        </section>
    )
};
