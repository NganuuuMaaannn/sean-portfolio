"use client";

import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { FaLaptopCode, FaAndroid, FaHeart, FaPalette } from "react-icons/fa";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type PortfolioProfileRow = {
  id: string;
  about_text: string | null;
  about_image: string | null;
};

type FloatingHeart = {
  id: number;
  x: number;
  y: number;
  driftX: number;
  rotate: number;
  scale: number;
  colorClass: string;
};

const defaultAboutText =
  "Hi! I'm Sean, a 23-year-old Front-End Developer passionate about modern design, smooth interactions, and responsive user interfaces. I focus mainly on front-end development but also understand basic back-end concepts. I've worked with React Native, React JS, Next.js, TypeScript, and JavaScript, and I have photo and video editing skills that add a creative touch to my work. I'm adaptable, detail-oriented, and always eager to learn new frameworks and programming languages to grow in the tech industry.";
const defaultAboutImage = "/image/Sean.jpg";
const heartColorClasses = ["text-pink-400", "text-rose-400", "text-fuchsia-400", "text-red-400"];

export default function About() {
  const [aboutText, setAboutText] = useState(defaultAboutText);
  const [aboutImage, setAboutImage] = useState(defaultAboutImage);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [showPowerTapGif, setShowPowerTapGif] = useState(false);
  const [powerTapGifSeed, setPowerTapGifSeed] = useState(0);
  const tapTimesRef = useRef<number[]>([]);
  const powerTapTimeoutRef = useRef<number | null>(null);
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

    const applyProfile = (profileRow: PortfolioProfileRow | null) => {
      if (!active) {
        return;
      }

      if (typeof profileRow?.about_text === "string" && profileRow.about_text.trim()) {
        setAboutText(profileRow.about_text);
      }
      if (typeof profileRow?.about_image === "string" && profileRow.about_image.trim()) {
        setAboutImage(profileRow.about_image);
      }
    };

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("portfolio_profile")
        .select("id, about_text, about_image")
        .eq("id", "main")
        .maybeSingle<PortfolioProfileRow>();

      if (error || !data) {
        return;
      }

      applyProfile(data);
    };

    void loadProfile();

    const channel = supabase
      .channel("portfolio-profile-public-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_profile",
          filter: "id=eq.main",
        },
        (payload) => {
          applyProfile((payload.new as PortfolioProfileRow | null) ?? null);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (powerTapTimeoutRef.current !== null) {
        window.clearTimeout(powerTapTimeoutRef.current);
      }
    };
  }, []);

  const handlePicturePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const id = Date.now() + Math.floor(Math.random() * 100000);
    const driftX = Math.round((Math.random() - 0.5) * 44);
    const rotate = Math.round((Math.random() - 0.5) * 40);
    const scale = 0.85 + Math.random() * 0.55;
    const colorClass = heartColorClasses[Math.floor(Math.random() * heartColorClasses.length)] ?? "text-pink-400";

    setFloatingHearts((current) => [...current, { id, x, y, driftX, rotate, scale, colorClass }]);

    window.setTimeout(() => {
      setFloatingHearts((current) => current.filter((heart) => heart.id !== id));
    }, 900);

    const powerTapWindowMs = 650;
    const powerTapThreshold = 6;
    const now = Date.now();

    tapTimesRef.current = [...tapTimesRef.current.filter((time) => now - time <= powerTapWindowMs), now];

    if (tapTimesRef.current.length >= powerTapThreshold) {
      tapTimesRef.current = [];
      setPowerTapGifSeed((currentSeed) => currentSeed + 1);
      setShowPowerTapGif(true);

      if (powerTapTimeoutRef.current !== null) {
        window.clearTimeout(powerTapTimeoutRef.current);
      }

      powerTapTimeoutRef.current = window.setTimeout(() => {
        setShowPowerTapGif(false);
        powerTapTimeoutRef.current = null;
      }, 1600);
    }
  };

  return (
    <section
      id="about"
      className="min-h-screen flex justify-center items-center px-4 sm:px-8 py-20 sm:py-24 text-center mt-8 sm:mt-16"
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-10 sm:gap-12 md:gap-16">
        <div className="w-full md:w-1/2 max-w-2xl flex flex-col items-center md:items-start order-2 md:order-1">
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
            className="flex gap-6 mt-6 text-3xl justify-center md:justify-start"
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
          <div
            className="w-64 h-64 sm:w-80 sm:h-80 lg:w-104 lg:h-104 rounded-2xl shadow-xl overflow-hidden transition-shadow duration-700 group relative cursor-pointer"
            onPointerDown={handlePicturePointerDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aboutImage || defaultAboutImage}
              alt="Sean profile"
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full transform scale-100 transition-transform duration-1000 ease-in-out group-hover:scale-105 cursor-pointer"
              onError={(event) => {
                event.currentTarget.src = defaultAboutImage;
              }}
            />
            {floatingHearts.map((heart) => (
              <motion.span
                key={heart.id}
                initial={{ opacity: 0, scale: 0.35, x: "-50%", y: "-50%" }}
                animate={{
                  opacity: [0, 1, 0],
                  x: ["-50%", `calc(-50% + ${heart.driftX}px)`],
                  y: ["-50%", "-170%"],
                  scale: [heart.scale * 0.6, heart.scale, heart.scale * 1.15],
                  rotate: [0, heart.rotate],
                }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={`pointer-events-none absolute z-20 ${heart.colorClass} drop-shadow-[0_0_8px_rgba(244,63,94,0.55)]`}
                style={{ left: heart.x, top: heart.y }}
              >
                <FaHeart className="h-7 w-7 sm:h-8 sm:w-8" />
              </motion.span>
            ))}
            <motion.div
              initial={false}
              animate={showPowerTapGif ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.82 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/nailong.gif?play=${powerTapGifSeed}`}
                alt="Power tap effect"
                // className="w-40 h-40 sm:w-52 sm:h-52 object-contain"
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
