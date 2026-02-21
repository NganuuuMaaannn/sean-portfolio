"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Projects from "../components/Projects";
import Figma from "../components/Figma";
import TechStack from "../components/TechStack";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Certificates from "../components/Certificates";
import { Rajdhani } from "next/font/google";

const bodyFont = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const AboutSection = memo(About);
const ProjectsSection = memo(Projects);
const FigmaSection = memo(Figma);
const TechStackSection = memo(TechStack);
const CertificatesSection = memo(Certificates);
const ContactSection = memo(Contact);
const FooterSection = memo(Footer);

const SCROLL_DURATION = 1000;
const BACK_TO_TOP_THRESHOLD = 100;

function smoothScrollTo(targetY: number, duration = 1500) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (!startTime) {
      startTime = timestamp;
    }

    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);

    const easeInOut =
      percent < 0.5
        ? 2 * percent * percent
        : -1 + (4 - 2 * percent) * percent;

    window.scrollTo(0, startY + distance * easeInOut);

    if (progress < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const Home = () => {
  const [showButton, setShowButton] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollYRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.remove("cmd-exit");
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      const currentY = window.scrollY;
      const nextShowHeader =
        currentY <= 0 || currentY < lastScrollYRef.current;
      const nextShowButton = currentY > BACK_TO_TOP_THRESHOLD;

      setShowHeader((prev) => (prev === nextShowHeader ? prev : nextShowHeader));
      setShowButton((prev) => (prev === nextShowButton ? prev : nextShowButton));
      lastScrollYRef.current = currentY;
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = requestAnimationFrame(() => {
        updateScrollState();
        scrollFrameRef.current = null;
      });
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    smoothScrollTo(section.offsetTop, SCROLL_DURATION);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollToSection("topMain");
  }, [scrollToSection]);

  const scrollToAbout = useCallback(() => {
    scrollToSection("about");
  }, [scrollToSection]);

  const scrollToProject = useCallback(() => {
    scrollToSection("projects");
  }, [scrollToSection]);

  const scrollToFigmaProject = useCallback(() => {
    scrollToSection("figma-projects");
  }, [scrollToSection]);

  const scrollToTech = useCallback(() => {
    scrollToSection("tech-stack");
  }, [scrollToSection]);

  const scrollToCertificates = useCallback(() => {
    scrollToSection("certificates");
  }, [scrollToSection]);

  const scrollToContact = useCallback(() => {
    scrollToSection("contact");
  }, [scrollToSection]);

  return (
    <main className={`cyber-portfolio relative font-sans cursor-default overflow-hidden ${bodyFont.className}`} id="topMain">
      <div className="bg-layer bg-gradient" />
      <div className="bg-layer bg-grid" />
      <div className="bg-layer bg-scanlines" />
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <div className="relative z-10">
        <Header
          showHeader={showHeader}
          onAbout={scrollToAbout}
          onProjects={scrollToProject}
          onFigma={scrollToFigmaProject}
          onTech={scrollToTech}
          onCertificates={scrollToCertificates}
          onContact={scrollToContact}
        />

        <Hero onAbout={scrollToAbout} onContact={scrollToContact} />

        <AboutSection />

        <ProjectsSection />

        <FigmaSection />

        <TechStackSection />

        <CertificatesSection />

        <ContactSection />

        <FooterSection />

        {showButton && (
          <button
            onClick={scrollToTop}
            className="
            fixed
            bottom-4 right-4
            sm:bottom-6 sm:right-6
            w-10 h-10
            sm:w-12 sm:h-12
            flex items-center justify-center
            rounded-full shadow-lg border
            hover:scale-110 active:scale-95
            transition-all duration-300"
            style={{
              background: "var(--glass)",
              color: "var(--foreground)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
            aria-label="Back to top"
            title="Back to top"
          >
            <FaArrowUp size={20} />
          </button>
        )}
      </div>

    </main>
  );
};

export default Home;
