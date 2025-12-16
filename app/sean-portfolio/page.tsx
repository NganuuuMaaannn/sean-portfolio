"use client";

import type { NextPage } from "next";
import { FaArrowUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Particles from "../components/Particles";
import Hero from "../components/Hero";
import About from "../components/About";
import Projects from "../components/Projects";
import Figma from "../components/Figma";
import TechStack from "../components/TechStack";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Certificates from "../components/Certificates";

function smoothScrollTo(targetY: number, duration = 1500) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);

    // Ease-in-out function
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

const Home: NextPage = () => {
  const [showButton, setShowButton] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [text, setText] = useState("");
  const fullText = "Developer Focused on Front-End, Mobile & UI/UX Excellence";

  useEffect(() => {
    document.body.classList.remove("cmd-exit");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Only apply scroll effect on medium screens and up (768px+)
      if (window.innerWidth >= 768) {
        if (currentY < lastScrollY) {
          // scrolling up
          setShowHeader(true);
        } else {
          setShowHeader(false);
        }
      } else {
        // On small screens, always show header (for toggle menu access)
        setShowHeader(false);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    const topMain = document.getElementById("topMain");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  const scrollToAbout = () => {
    const topMain = document.getElementById("about");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  const scrollToProject = () => {
    const topMain = document.getElementById("projects");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  const scrollToFigmaProject = () => {
    const topMain = document.getElementById("figma-projects");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  const scrollToTech = () => {
    const topMain = document.getElementById("tech-stack");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  const scrollToCertificates = () => {
    const topMain = document.getElementById("certificates");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  const scrollToContact = () => {
    const topMain = document.getElementById("contact");
    if (topMain) {
      const targetY = topMain.offsetTop;
      smoothScrollTo(targetY, 1000);
    }
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track window size safely
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize(); // set initial size
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Show back-to-top button after scrolling down a bit (client-side only)
  useEffect(() => {
    const handleShowButton = () => {
      setShowButton(window.scrollY > 100);
    };

    // Only attach in browser
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleShowButton);
      // initialize
      handleShowButton();
      return () => window.removeEventListener("scroll", handleShowButton);
    }
  }, []);

  useEffect(() => {
    let i = 0;
    let typing = true; // true = typing, false = erasing
    let interval: NodeJS.Timeout;

    const startTyping = () => {
      interval = setInterval(() => {
        if (typing) {
          setText(fullText.slice(0, i));
          i++;

          if (i > fullText.length) {
            clearInterval(interval);
            typing = false;
            // pause 10s before erasing
            setTimeout(startTyping, 20000);
          }
        } else {
          setText(fullText.slice(0, i));
          i--;

          if (i < 0) {
            clearInterval(interval);
            typing = true;
            i = 0;
            // immediately start typing again (no pause here)
            startTyping();
          }
        }
      }, 20); // speed (ms per character)
    };

    startTyping();

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative font-sans cursor-default overflow-hidden">
      <Header showHeader={showHeader} onAbout={scrollToAbout} onProjects={scrollToProject} onFigma={scrollToFigmaProject} onTech={scrollToTech} onCertificates={scrollToCertificates} onContact={scrollToContact} />

      <Particles mousePosition={mousePosition} windowSize={windowSize} />

      <Hero onAbout={scrollToAbout} onContact={scrollToContact} text={text} />

      <About />

      <Projects />

      <Figma />

      <TechStack />

      <Certificates />

      <Contact />

      {/* Footer */ }
  <Footer />

  {
    showButton && (
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
      >
        <FaArrowUp size={20} />
      </button>
    )
  }
    </main >
  );
};

export default Home;