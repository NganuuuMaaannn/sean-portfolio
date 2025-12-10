"use client";

import CertificateCard from "./CertificateCard";
import { motion } from "framer-motion";

export default function Certificates() {
  const certificates = [
    {
      title: "Learn PHP and MySQL for Web Application and Web Development",
      issuer: "Udemy.com",
      image: "/image/c1.png",
      verifyUrl: "https://www.udemy.com/certificate/UC-f76db58f-516f-4f99-8f3c-d2576d67e376/",
    },
    {
      title: "Build Complete CMS Blog in PHP MySQL Bootstrap & PDO",
      issuer: "Udemy.com",
      image: "/image/c2.png",
      verifyUrl: "https://www.udemy.com/certificate/UC-91aa504c-ec8b-4db6-be7c-874db03ca056/",
    },
    {
      title: "PHP with MySQL: Build 8 PHP and MySQL Projects",
      issuer: "Udemy.com",
      image: "/image/c3.png",
      verifyUrl: "https://www.udemy.com/certificate/UC-3abfc85e-4724-4f5f-90b9-7548919bfd32/",
    },
    {
      title: "Introduction to SQL",
      issuer: "Simplilearn.com",
      image: "/image/c4.png",
      verifyUrl: "https://simpli-web.app.link/e/to8hHyEEUYb",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };



















  return (
    <section
      id="certificates"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 mt-16"
    >
      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        My Certificates
      </motion.h2>

      {/* Motion grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl w-full"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {certificates.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: i * 0.3 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <CertificateCard {...c} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}