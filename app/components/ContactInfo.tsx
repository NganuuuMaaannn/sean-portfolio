"use client";

import React from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  handleCopy: (text: string, e: React.MouseEvent<HTMLSpanElement>) => void;
};

export default function ContactInfo({ handleCopy }: Props) {
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm sm:text-base md:text-lg font-light">
      <span
        onClick={(e) =>
          handleCopy("ronniedoinog12@gmail.com", e as React.MouseEvent<HTMLSpanElement>)
        }
        className="relative flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        <FaEnvelope className="w-6 h-6" />

        <motion.span
          initial="rest"
          whileHover="hover"
          className="relative flex flex-col items-start"
        >
          {/* Hover text */}
          <motion.span
            variants={{
              rest: { opacity: 0, y: 6 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute -top-5 left-16 text-xs text-indigo-500 pointer-events-none"
          >
            Click to Copy
          </motion.span>

          {/* Actual email */}
          <span>ronniedoinog12@gmail.com</span>
        </motion.span>
      </span>

      <span
        onClick={(e) => 
          handleCopy("+63 938 646 7629", e as React.MouseEvent<HTMLSpanElement>)
        }
        className="relative flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        <FaPhone className="w-5 h-5" />

        <motion.span
          initial="rest"
          whileHover="hover"
          className="relative flex flex-col items-start"
        >
          {/* Hover text */}
          <motion.span
            variants={{
              rest: { opacity: 0, y: 6 },
              hover: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute -top-5 left-8 text-xs text-indigo-500 pointer-events-none"
          >
            Click to Copy
          </motion.span>

          {/* Actual email */}
          <span>+63 938 646 7629</span>
        </motion.span>
      </span>
    </div>
  );
}
