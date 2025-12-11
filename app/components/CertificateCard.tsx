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
      className="flex flex-col z-10 h-[420px] lg:h-[550px] rounded-xl shadow-xl overflow-hidden group bg-white/10 backdrop-blur-md border border-white/10"
    >
      {/* Certificate Image Transition */}
      <div className="relative h-60 sm:h-64 md:h-72 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col grow">
        <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-white/80 mb-2">{issuer}</p>

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
