"use client";

import { FaGithub, FaFacebook } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  return (
    <footer className="py-10 sm:py-20 px-4 sm:px-8 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} Sean. All rights reserved.</p>
        <div className="flex items-center space-x-4 sm:space-x-6 text-lg sm:text-xl">
          <a href="https://github.com/NganuuuMaaannn" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <FaGithub />
          </a>
          <a href="https://www.facebook.com/seanthesheepzx" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            <FaFacebook />
          </a>
          <div className="theme-toggle-inline-spacing">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
