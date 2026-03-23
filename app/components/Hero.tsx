"use client";

import { useEffect, useState } from "react";
import { FaArrowDown, FaFileAlt, FaGithub, FaFacebook } from "react-icons/fa";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

import WebcamPixelGrid from "@/components/ui/webcam-pixel-grid";
import waveAnim from "@/public/lottie/hand.json";

type Props = {
  onAbout: () => void;
  onContact: () => void;
};

const TYPING_TEXT =
  "Developer Focused on Front-End, Mobile & UI/UX Excellence";

export default function Hero({ onAbout, onContact }: Props) {
  const [step, setStep] = useState(0);
  const [showLottie, setShowLottie] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 500),
      setTimeout(() => setStep(3), 700),
      setTimeout(() => setShowLottie(true), 800),
      setTimeout(() => setShowLottie(false), 4500),
      setTimeout(() => setShowButtons(true), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let charIndex = 0;
    let typing = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      setText(TYPING_TEXT.slice(0, charIndex));

      if (typing) {
        if (charIndex >= TYPING_TEXT.length) {
          typing = false;
          timeoutId = setTimeout(tick, 20000);
          return;
        }
        charIndex += 1;
      } else {
        if (charIndex <= 0) {
          typing = true;
        } else {
          charIndex -= 1;
        }
      }

      timeoutId = setTimeout(tick, 20);
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, []);

  const container = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section
      id="topMain"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-transparent px-4 text-center text-white sm:px-6"
    >
      <div className="absolute inset-0">
        <WebcamPixelGrid
          gridCols={60}
          gridRows={40}
          maxElevation={50}
          motionSensitivity={0.25}
          elevationSmoothing={0.2}
          colorMode="webcam"
          backgroundColor="#030303"
          mirror
          gapRatio={0.05}
          invertColors={false}
          darken={0.55}
          borderColor="#ffffff"
          borderOpacity={0.06}
          className="h-full w-full"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/55 via-black/30 to-black/70" />

      <h1
        className={`
          relative z-10 flex items-center font-bold 
          text-3xl sm:text-4xl md:text-5xl
          space-x-2 transition-all duration-700 ease-out
          ${showLottie ? "-translate-x-2.5" : "translate-x-0"}
        `}
      >
        <span
          className={`transition-opacity duration-700 ${step >= 1 ? "opacity-100" : "opacity-0"
            }`}
        >
          Hi!
        </span>

        <span
          className={`transition-opacity duration-700 ml-0 md:ml-2 ${step >= 2 ? "opacity-100" : "opacity-0"
            }`}
        >
          I&apos;m
        </span>

        <span
          className={`transition-opacity duration-700 ml-0 md:ml-2 ${step >= 3 ? "opacity-100" : "opacity-0"
            }`}
        >
          Sean.
        </span>

        {showLottie && (
          <div
            className="
              absolute pointer-events-none
              w-[120px] h-[120px]
              sm:w-[140px] sm:h-[140px]
              md:w-[150px] md:h-[150px]
              -right-20 -top-12
              sm:-right-24 sm:-top-12
              md:-right-28 md:-top-14
            "
          >
            <Lottie animationData={waveAnim} loop={false} />
          </div>
        )}
      </h1>

      <p className="relative z-10 mt-2 max-w-2xl px-2 text-sm font-light text-white/85 lg:mt-4 sm:text-lg md:text-xl">
        {text}
        <span className="animate-ping ml-1">|</span>
      </p>

      {/* Main Buttons */}
      <motion.div
        variants={container}
        initial={false}
        animate={showButtons ? "show" : "hidden"}
        transition={{ duration: 0.6, ease: "easeOut", staggerChildren: 0.15 }}
        className="relative z-10 mt-8 flex w-full max-w-2xl flex-col items-center gap-6 px-2"
      >

        <motion.div
          variants={item}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="flex w-full flex-wrap justify-center gap-3 sm:gap-4"
        >
          <a
            href="/Sean-CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="
            inline-flex items-center gap-2 sm:gap-3
            px-4 py-2 sm:px-6 sm:py-3
            rounded-full text-sm sm:text-base
            bg-white/10 dark:bg-white/20
            backdrop-blur-md border border-white/20
            font-medium shadow-lg hover:shadow-xl
            hover:bg-white/20 dark:hover:bg-white/20
            transition-all ease-in-out duration-700
            hover:scale-105 active:scale-95"
          >
            <span>View CV</span>
            <FaFileAlt className="w-4 h-4" />
          </a>

          {/* Contact Me */}
          <a
            onClick={(event) => {
              event.preventDefault();
              onContact();
            }}
            href="#contact"
            className="
            inline-flex items-center gap-2 sm:gap-3
            px-4 py-2 sm:px-6 sm:py-3
            rounded-full text-sm sm:text-base
            bg-white/10 dark:bg-white/0
            backdrop-blur-md border border-white/20
            font-medium shadow-lg hover:shadow-xl
            transition-all ease-in-out duration-700
            hover:scale-105 active:scale-95"
          >
            <span>Contact Me</span>
          </a>
        </motion.div>

        {/* Icon Row */}
        <motion.div
          variants={item}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="flex items-center gap-4 sm:gap-6"
        >
          {/* GitHub Icon */}
          <motion.a
            href="https://github.com/NganuuuMaaannn"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaGithub className="w-5 h-5" />
          </motion.a>

          {/* Facebook Icon */}
          <motion.a
            href="https://www.facebook.com/seanthesheepzx"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaFacebook className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* View More button */}
      <div className="absolute bottom-6 z-10 flex cursor-default flex-col items-center text-white/65 transition duration-1000 ease-in-out hover:scale-105 hover:text-white/90">
        <span
          onClick={onAbout}
          className="sm:text-sm md:text-sm font-extralight"
        >
          View More
        </span>
        <FaArrowDown className="mt-1 w-3 h-3 font-extralight animate-bounce " />
      </div>
    </section>
  );
}
