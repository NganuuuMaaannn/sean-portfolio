"use client";

import { FaGithub, FaFacebook } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      className="py-10 sm:py-20 px-4 sm:px-8 relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        <motion.p
          className="text-xs sm:text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          &copy; {new Date().getFullYear()} Sean Michael Doinog. All rights reserved.
        </motion.p>

        <div className="flex items-center space-x-4 sm:space-x-6 text-lg sm:text-xl">
          <motion.a
            href="https://github.com/NganuuuMaaannn"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaGithub />
          </motion.a>

          <motion.a
            href="https://www.facebook.com/seanthesheepzx"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaFacebook />
          </motion.a>

          <motion.div
            className="theme-toggle-inline-spacing"
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}
