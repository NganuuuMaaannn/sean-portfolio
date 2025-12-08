"use client";

import { useEffect, useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import Lottie from "lottie-react"; // <-- install: npm i lottie-react

import waveAnim from "@/public/lottie/hand.json"; // <-- your Lottie file

type Props = {
  text: string;
  onAbout: () => void;
};

export default function Hero({ text, onAbout }: Props) {
  const [step, setStep] = useState(0);
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300), // Hi!
      setTimeout(() => setStep(2), 500), // I'm
      setTimeout(() => setStep(3), 700), // Sean.
      setTimeout(() => setShowLottie(true), 800), // Show Lottie after Sean appears
      setTimeout(() => setShowLottie(false), 5800), // Hide Lottie after 5 seconds
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section
      id="topMain"
      className="relative h-screen flex flex-col justify-center items-center bg-transparent px-4 text-center"
    >
      <h1
        className={`
          relative flex items-center font-bold 
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
          className={`transition-opacity duration-700 ml-1 md:ml-2 ${step >= 2 ? "opacity-100" : "opacity-0"
            }`}
        >
          I'm
        </span>

        <span
          className={`transition-opacity duration-700 ml-1 md:ml-2 ${step >= 3 ? "opacity-100" : "opacity-0"
            }`}
        >
          Sean.
        </span>

        {/* ⭐ Absolutely positioned Lottie — responsive offset */}
        {showLottie && (
          <div
            className="
        absolute pointer-events-none
        w-[120px] h-[120px]
        sm:w-[140px] sm:h-[140px]
        md:w-[150px] md:h-[150px]
        -right-20 -top-10
        sm:-right-24 sm:-top-12
        md:-right-28 md:-top-14
      "
          >
            <Lottie animationData={waveAnim} loop={false} />
          </div>
        )}
      </h1>

      <p className="mt-4 text-base sm:text-lg md:text-xl font-light">
        {text}
        <span className="animate-pulse ml-1">|</span>
      </p>

      {/* View More button */}
      <div className="absolute bottom-6 flex flex-col items-center cursor-default text-gray-700 group transform transition ease-in-out duration-1000 hover:scale-105 hover:text-gray-600">
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
