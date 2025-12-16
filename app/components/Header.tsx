"use client";

import { useState } from "react";

type Props = {
  showHeader: boolean;
  onAbout: () => void;
  onProjects: () => void;
  onTech: () => void;
  onFigma: () => void;
  onCertificates: () => void;
  onContact: () => void;
};

export default function Header({ showHeader, onAbout, onProjects, onFigma, onTech, onCertificates, onContact }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-6 right-4 z-50 flex flex-col justify-center items-center w-8 h-8 space-y-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-1"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)}>
          <nav className="fixed top-20 right-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 text-sm font-medium tracking-wide min-w-[200px]">
            <a onClick={() => { onAbout(); setIsOpen(false); }} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">About</a>
            <a onClick={() => { onProjects(); setIsOpen(false); }} className="text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Projects</a>
            <a onClick={() => { onFigma(); setIsOpen(false); }} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Figma Projects</a>
            <a onClick={() => { onTech(); setIsOpen(false); }} className="text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Tech Stack</a>
            <a onClick={() => { onCertificates(); setIsOpen(false); }} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Certificates</a>
            <a onClick={() => { onContact(); setIsOpen(false); }} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Contact</a>
          </nav>
        </div>
      )}

      <header
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-auto
            bg-white/10 backdrop-blur-md border border-white/10 shadow-md 
            transition-transform duration-300 z-50 mt-6
            rounded-xl px-2 py-2 sm:px-4
            ${showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <nav className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 text-sm sm:text-md md:text-lg font-medium tracking-wide">
          <a onClick={onAbout} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">About</a>
          <a onClick={onProjects} className="text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Projects</a>
          <a onClick={onFigma} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Figma Projects</a>
          <a onClick={onTech} className="text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Tech Stack</a>
          <a onClick={onCertificates} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Certificates</a>
          <a onClick={onContact} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Contact</a>
        </nav>
      </header>
    </>
  );
}
