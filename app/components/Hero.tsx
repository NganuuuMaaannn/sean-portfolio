"use client";

import React from "react";
import { FaArrowDown } from "react-icons/fa";

type Props = {
  text: string;
};

export default function Hero({ text }: Props) {
  return (
    <section
      id="topMain"
      className="relative h-screen flex flex-col justify-center items-center bg-transparent px-4 text-center"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Hi, I'm Sean</h1>
      <p className="mt-4 text-base sm:text-lg md:text-xl font-light">
        {text}
        <span className="animate-pulse ml-1">|</span>
      </p>

      {/* View More button at bottom */}
      <div className="absolute bottom-6 flex flex-col items-center cursor-default text-gray-700 group">
        <span className="sm:text-sm md:text-sm font-light">
          View More
        </span>
        <FaArrowDown className="mt-1 w-3 h-3 animate-bounce" />
      </div>
    </section>
  );
}
