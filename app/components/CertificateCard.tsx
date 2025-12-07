"use client";

import { FaExternalLinkAlt } from "react-icons/fa";

type Props = {
    title: string;
    issuer: string;
    image: string;
    verifyUrl?: string;
};

export default function CertificateTile({ title, issuer, image, verifyUrl }: Props) {
    return (
        <div className="flex flex-col z-10 h-[420px] lg:h-[500px] rounded-xl shadow-xl overflow-hidden group bg-white/10 backdrop-blur-md border border-white/10 transform transition-all duration-700 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
            
            {/* Certificate Image */}
            <div className="relative h-60 sm:h-64 md:h-72 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex flex-col grow">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>

                {/* Bottom section */}
                <div className="mt-auto">

                    <p className="text-sm sm:text-base text-white/80 mb-2">{issuer}</p>
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
        </div>
    );
}
