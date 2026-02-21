"use client";

import { useEffect, useState } from "react";
import { FaLaptopCode, FaAndroid, FaPalette } from "react-icons/fa";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type ProfileShape = {
  aboutText?: string;
  aboutImage?: string;
};

function toProfileShape(value: unknown): ProfileShape {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as ProfileShape;
  }

  return {};
}

const defaultAboutText =
  "Hi! I'm Sean, a 23-year-old Front-End Developer passionate about modern design, smooth interactions, and responsive user interfaces. I focus mainly on front-end development but also understand basic back-end concepts. I've worked with React Native, React JS, Next.js, TypeScript, and JavaScript, and I have photo and video editing skills that add a creative touch to my work. I'm adaptable, detail-oriented, and always eager to learn new frameworks and programming languages to grow in the tech industry.";
const defaultAboutImage = "/image/Sean.jpg";

export default function About() {
  const [aboutText, setAboutText] = useState(defaultAboutText);
  const [aboutImage, setAboutImage] = useState(defaultAboutImage);
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    const applyProfile = (profileValue: unknown) => {
      if (!active) {
        return;
      }

      const profile = toProfileShape(profileValue);
      if (typeof profile.aboutText === "string" && profile.aboutText.trim()) {
        setAboutText(profile.aboutText);
      }
      if (typeof profile.aboutImage === "string" && profile.aboutImage.trim()) {
        setAboutImage(profile.aboutImage);
      }
    };

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("portfolio_content")
        .select("profile")
        .eq("id", "main")
        .maybeSingle<{ profile: unknown }>();

      if (error || !data) {
        return;
      }

      applyProfile(data.profile);
    };

    void loadProfile();

    const channel = supabase
      .channel("portfolio-content-public-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_content",
          filter: "id=eq.main",
        },
        (payload) => {
          applyProfile((payload.new as { profile?: unknown } | null)?.profile);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <section
      id="about"
      className="h-screen flex justify-center items-center px-4 sm:px-8 text-center mt-16"
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start order-2 md:order-1">
          <motion.h2
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center md:text-left"
          >
            About Me
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base md:text-lg leading-relaxed text-justify"
          >
            {aboutText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex gap-6 mt-6 text-3xl"
          >
            <FaLaptopCode title="Front-End Development" className="text-blue-500 hover:scale-110 transition-transform duration-300" />
            <FaAndroid title="Mobile App Development" className="text-green-500 hover:scale-110 transition-transform duration-300" />
            <FaPalette title="UI/UX Design" className="hover:scale-110 transition-transform duration-300" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex justify-center md:justify-end order-1 md:order-2"
        >
          <div className="w-80 h-80 sm:w-106 sm:h-106 md:w-106 md:h-106 rounded-2xl shadow-xl overflow-hidden transition-shadow duration-700 group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aboutImage || defaultAboutImage}
              alt="Sean profile"
              className="object-cover w-full h-full transform scale-100 transition-transform duration-1000 ease-in-out group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.src = defaultAboutImage;
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
