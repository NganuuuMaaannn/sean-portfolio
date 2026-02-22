"use client";

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
  return (
    <header
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-auto
      bg-white/10 backdrop-blur-md border border-white/10 shadow-md 
      transition-transform duration-300 z-50 mt-6
      rounded-xl px-2 py-2 sm:px-4
      ${showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <nav className="hide-scrollbar flex items-center justify-start sm:justify-center gap-2 sm:gap-4 md:gap-6 overflow-x-auto whitespace-nowrap text-[11px] sm:text-sm md:text-base font-medium tracking-wide">
        <a onClick={onAbout} className="shrink-0 cursor-pointer hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">About</a>
        <a onClick={onProjects} className="shrink-0 cursor-pointer hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Projects</a>
        <a onClick={onFigma} className="shrink-0 cursor-pointer text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Figma Projects</a>
        <a onClick={onTech} className="shrink-0 cursor-pointer text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Tech Stack</a>
        <a onClick={onCertificates} className="shrink-0 cursor-pointer hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Certificates</a>
        <a onClick={onContact} className="shrink-0 cursor-pointer hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Contact</a>
      </nav>
    </header>
  );
}