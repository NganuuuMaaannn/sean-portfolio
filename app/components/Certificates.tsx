"use client";

import CertificateCard from "./CertificateCard";

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
      issuer: "Udemy",
      image: "/image/c3.png",
      verifyUrl: "https://www.udemy.com/certificate/UC-3abfc85e-4724-4f5f-90b9-7548919bfd32/",
    },
    {
      title: "Introduction to SQL",
      issuer: "SimpliLearn",
      image: "/image/c4.png",
      verifyUrl: "https://simpli-web.app.link/e/to8hHyEEUYb",
    },
  ];

  return (
    <section
      id="certificates"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 mt-16"
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center">
        My Certificates
      </h2>

      {/* Grid layout: 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl w-full">
        {certificates.map((c) => (
          <CertificateCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}
