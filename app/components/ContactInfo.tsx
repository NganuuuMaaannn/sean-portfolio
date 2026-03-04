"use client";

import React from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  emails: string[];
  phones: string[];
  handleCopy: (text: string, e: React.MouseEvent<HTMLSpanElement>) => void;
};

export default function ContactInfo({ emails, phones, handleCopy }: Props) {
  const rowCount = Math.max(emails.length, phones.length);
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    email: emails[index] ?? "",
    phone: phones[index] ?? "",
  }));

  return (
    <div className="mt-12 sm:mt-16 w-full text-sm sm:text-base md:text-lg font-light space-y-3">
      {rows.map((row, index) => (
        <div
          key={`contact-row-${index}`}
          className="mx-auto grid w-fit max-w-full grid-cols-1 sm:grid-cols-[max-content_max-content] gap-3 sm:gap-12"
        >
          <span
            onClick={(e) =>
              row.email ? handleCopy(row.email, e as React.MouseEvent<HTMLSpanElement>) : undefined
            }
            className={`relative flex max-w-full items-center justify-center gap-2 transition-colors ${
              row.email ? "cursor-pointer hover:text-indigo-500" : "opacity-50"
            }`}
          >
            <FaEnvelope className="w-6 h-6 shrink-0" />

            <motion.span
              initial="rest"
              whileHover={row.email ? "hover" : "rest"}
              className="relative flex min-w-0 flex-col items-center sm:items-start"
            >
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

              <span className="break-all text-center sm:text-left">
                {row.email || "No email"}
              </span>
            </motion.span>
          </span>

          <span
            onClick={(e) =>
              row.phone ? handleCopy(row.phone, e as React.MouseEvent<HTMLSpanElement>) : undefined
            }
            className={`relative flex max-w-full items-center justify-center gap-2 transition-colors ${
              row.phone ? "cursor-pointer hover:text-indigo-500" : "opacity-50"
            }`}
          >
            <FaPhone className="w-5 h-5 shrink-0" />

            <motion.span
              initial="rest"
              whileHover={row.phone ? "hover" : "rest"}
              className="relative flex min-w-0 flex-col items-center sm:items-start"
            >
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

              <span className="break-all text-center sm:text-left">
                {row.phone || "No number"}
              </span>
            </motion.span>
          </span>
        </div>
      ))}
    </div>
  );
}
