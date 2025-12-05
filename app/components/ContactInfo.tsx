"use client";

import React from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";

type Props = {
  handleCopy: (text: string, e: React.MouseEvent<HTMLSpanElement>) => void;
};

export default function ContactInfo({ handleCopy }: Props) {
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm sm:text-base md:text-lg font-light">
      <span
        onClick={(e) => handleCopy("ronniedoinog12@gmail.com", e as React.MouseEvent<HTMLSpanElement>)}
        className="flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        <FaEnvelope className="w-6 h-6" />
        ronniedoinog12@gmail.com
      </span>

      <span
        onClick={(e) => handleCopy("+63 938 646 7629", e as React.MouseEvent<HTMLSpanElement>)}
        className="flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
      >
        <FaPhone className="w-5 h-5" />
        +63 938 646 7629
      </span>
    </div>
  );
}
