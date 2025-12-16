"use client";

type Props = {
  showHeader: boolean;
  onAbout: () => void;
  onProjects: () => void;
  onTech: () => void;
  onCertificates: () => void;
  onContact: () => void;
};

export default function Header({ showHeader, onAbout, onProjects, onTech, onCertificates, onContact }: Props) {
  return (
    <header
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-auto
            bg-white/10 backdrop-blur-md border border-white/10 shadow-md 
            transition-transform duration-300 z-50 mt-6
            rounded-xl px-2 py-2 sm:px-4
            ${showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <nav className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 text-sm sm:text-md md:text-lg font-medium tracking-wide">
        <a onClick={onAbout} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">About</a>
        <a onClick={onProjects} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Projects</a>
        <a onClick={onTech} className="text-center hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Tech Stack</a>
        <a onClick={onCertificates} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Certificates</a>
        <a onClick={onContact} className="hover:opacity-80 transform transition duration-200 ease-in-out hover:scale-105">Contact</a>
      </nav>
    </header>
  );
}
