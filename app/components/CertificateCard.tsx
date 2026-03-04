"use client";

import { FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  title: string;
  issuer: string;
  image: string;
  verifyUrl?: string;
};

export default function CertificateCard({ title, issuer, image, verifyUrl }: Props) {
  return (
    <motion.div
      whileHover={{ y: "-1%", scale: 1.01 }}
      transition={{ type: "spring", duration: 1 }}
      className="transform-gpu will-change-transform flex flex-col z-10 h-full min-h-[380px] lg:min-h-[480px] rounded-xl shadow-xl overflow-hidden group bg-white/10 backdrop-blur-md border border-white/10"
    >
      {/* Certificate Image Transition */}
      <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col grow">
        <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm sm:text-base mb-2">{issuer}</p>

        {/* Bottom section */}
        <div className="mt-auto">
          {verifyUrl && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline"
            >
              Verify Certificate <FaExternalLinkAlt />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
