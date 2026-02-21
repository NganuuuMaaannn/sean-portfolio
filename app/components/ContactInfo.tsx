"use client";

import React from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  handleCopy: (text: string, e: React.MouseEvent<HTMLSpanElement>) => void;
};

export default function ContactInfo({ handleCopy }: Props) {
  return (
    <div className="mt-12 sm:mt-16 flex w-full max-w-3xl flex-col sm:flex-row flex-wrap items-center sm:items-stretch justify-center gap-6 sm:gap-8 text-sm sm:text-base md:text-lg font-light">
      <span
        onClick={(e) =>
          handleCopy("ronniedoinog12@gmail.com", e as React.MouseEvent<HTMLSpanElement>)
        }
        className="relative flex w-full sm:w-auto max-w-full items-center justify-center sm:justify-start gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        <FaEnvelope className="w-6 h-6" />

        <motion.span
          initial="rest"
          whileHover="hover"
          className="relative flex min-w-0 flex-col items-center sm:items-start"
        >
          {/* Hover text */}
          <motion.span
            variants={{
              rest: { opacity: 0, y: 6 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 sm:left-16 sm:translate-x-0 text-xs text-indigo-500 pointer-events-none"
          >
            Click to Copy
          </motion.span>

          {/* Actual email */}
          <span className="break-all text-center sm:text-left">ronniedoinog12@gmail.com</span>
        </motion.span>
      </span>

      <span
        onClick={(e) => 
          handleCopy("+63 938 646 7629", e as React.MouseEvent<HTMLSpanElement>)
        }
        className="relative flex w-full sm:w-auto max-w-full items-center justify-center sm:justify-start gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        <FaPhone className="w-5 h-5" />

        <motion.span
          initial="rest"
          whileHover="hover"
          className="relative flex min-w-0 flex-col items-center sm:items-start"
        >
          {/* Hover text */}
          <motion.span
            variants={{
              rest: { opacity: 0, y: 6 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 sm:left-7 sm:translate-x-0 text-xs text-indigo-500 pointer-events-none"
          >
            Click to Copy
          </motion.span>

          {/* Actual email */}
          <span className="text-center sm:text-left">+63 938 646 7629</span>
        </motion.span>
      </span>
    </div>
  );
}
