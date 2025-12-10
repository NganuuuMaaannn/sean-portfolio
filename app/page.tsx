"use client";

import type { NextPage } from "next";
import { FaArrowUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Particles from "./components/Particles";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import ContactInfo from "./components/ContactInfo";
import Footer from "./components/Footer";
import Certificates from "./components/Certificates";
import { motion } from "framer-motion";

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
  const [copied, setCopied] = useState<string | null>(null);
  const [confettiPos, setConfettiPos] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const fullText = "Developer Focused on Front-End, Mobile & UI/UX Excellence";

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
      const heroHeight = document.getElementById("topMain")?.offsetHeight || 600;

      if (currentY > heroHeight && currentY < lastScrollY) {
        // past hero and scrolling up
        setShowHeader(true);
      } else {
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
      <Header showHeader={showHeader} onAbout={scrollToAbout} onProjects={scrollToProject} onCertificates={scrollToCertificates} onContact={scrollToContact} />

      <Particles mousePosition={mousePosition} windowSize={windowSize} />

      <Hero onAbout={scrollToAbout} text={text} />

      <About />

      <Projects />

      <Certificates />

      {/* Contact Section */}
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

      {/* Footer */}
      <Footer />

      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center rounded-full shadow-lg border hover:scale-110 transition"
          style={{ background: 'var(--glass)', color: 'var(--foreground)', borderColor: 'rgba(255,255,255,0.06)' }}
          aria-label="Back to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </main>
  );
};

export default Home;