"use client";

import { useEffect, useState } from "react";
import CertificateCard from "./CertificateCard";
import { createClient } from "@/lib/supabase/client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

type CertificateShape = {
  title: string;
  issuer: string;
  image: string;
  verifyUrl?: string;
};

type PortfolioCertificateDbRow = {
  id: string;
  owner_id: string;
  title: string;
  issuer: string;
  image: string;
  verify_url: string | null;
  sort_order: number;
};

function areCertificatesEqual(left: CertificateShape[], right: CertificateShape[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftItem = left[index];
    const rightItem = right[index];

    if (!leftItem || !rightItem) {
      return false;
    }

    if (
      leftItem.title !== rightItem.title ||
      leftItem.issuer !== rightItem.issuer ||
      leftItem.image !== rightItem.image ||
      (leftItem.verifyUrl ?? "") !== (rightItem.verifyUrl ?? "")
    ) {
      return false;
    }
  }

  return true;
}

function toCertificateArray(value: unknown): CertificateShape[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): CertificateShape | null => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const issuer = typeof record.issuer === "string" ? record.issuer.trim() : "";
      const image = typeof record.image === "string" ? record.image.trim() : "";
      const verifyUrl =
        typeof record.verifyUrl === "string"
          ? record.verifyUrl
          : typeof record.verify_url === "string"
            ? record.verify_url
            : "";

      if (!title || !issuer || !image) {
        return null;
      }

      return {
        title,
        issuer,
        image,
        ...(verifyUrl.trim() ? { verifyUrl: verifyUrl.trim() } : {}),
      };
    })
    .filter((entry): entry is CertificateShape => entry !== null);
}

const defaultCertificates: CertificateShape[] = [
  {
    title: "Introduction to SQL",
    issuer: "Simplilearn.com",
    image: "/image/c4.png",
    verifyUrl: "https://simpli-web.app.link/e/to8hHyEEUYb",
  },
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
];

function getMiddleIndex(length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.floor(length / 2);
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<CertificateShape[]>(defaultCertificates);
  const [current, setCurrent] = useState(() => getMiddleIndex(defaultCertificates.length));
  const [animating, setAnimating] = useState(false);
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  const total = certificates.length;
  const currentIndex = total === 0 ? 0 : Math.min(current, total - 1);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < total - 1;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const certificatesStorageKey = "portfolio-certificates-items";
    const certificatesUpdatedAtStorageKey = "portfolio-certificates-updated-at";
    const certificatesUpdatesChannelName = "portfolio-certificates-updates";

    let active = true;
    let reloadTimeout: number | null = null;
    let updatesChannel: BroadcastChannel | null = null;

    const applyParsedCertificates = (nextCertificates: CertificateShape[]) => {
      setCertificates((current) =>
        areCertificatesEqual(current, nextCertificates) ? current : nextCertificates,
      );
    };

    const applyCertificatesSnapshot = (value: unknown) => {
      const parsedCertificates = toCertificateArray(value);
      if (parsedCertificates.length === 0) {
        return false;
      }

      applyParsedCertificates(parsedCertificates);
      return true;
    };

    const loadCertificatesFromStorage = () => {
      try {
        const cached = window.localStorage.getItem(certificatesStorageKey);
        if (!cached) {
          return false;
        }

        return applyCertificatesSnapshot(JSON.parse(cached) as unknown);
      } catch {
        return false;
      }
    };

    const applyCertificates = (rows: PortfolioCertificateDbRow[]) => {
      if (!active) {
        return;
      }

      const certificatePayload = rows.map((row) => ({
        title: row.title,
        issuer: row.issuer,
        image: row.image,
        verifyUrl: row.verify_url ?? undefined,
      }));
      const parsedCertificates = toCertificateArray(certificatePayload);
      if (parsedCertificates.length > 0) {
        applyParsedCertificates(parsedCertificates);

        try {
          window.localStorage.setItem(
            certificatesStorageKey,
            JSON.stringify(parsedCertificates),
          );
          window.localStorage.setItem(
            certificatesUpdatedAtStorageKey,
            Date.now().toString(),
          );
        } catch {
          // Ignore storage write failures.
        }
        return;
      }

      setCertificates((current) => (current.length > 0 ? current : defaultCertificates));
    };

    const loadCertificates = async () => {
      const { data, error } = await supabase
        .from("portfolio_certificates")
        .select("id, owner_id, title, issuer, image, verify_url, sort_order")
        .eq("owner_id", "main")
        .order("sort_order", { ascending: true })
        .returns<PortfolioCertificateDbRow[]>();

      if (error || !data) {
        loadCertificatesFromStorage();
        return;
      }

      applyCertificates(data);
    };

    const scheduleReload = () => {
      if (reloadTimeout !== null) {
        window.clearTimeout(reloadTimeout);
      }

      reloadTimeout = window.setTimeout(() => {
        reloadTimeout = null;
        if (!active) {
          return;
        }
        void loadCertificates();
      }, 140);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === certificatesStorageKey && event.newValue) {
        try {
          const snapshot = JSON.parse(event.newValue) as unknown;
          if (applyCertificatesSnapshot(snapshot)) {
            return;
          }
        } catch {
          // Ignore malformed storage payloads.
        }
      }

      if (
        event.key === certificatesUpdatedAtStorageKey ||
        event.key === certificatesStorageKey
      ) {
        scheduleReload();
      }
    };

    const handleFocus = () => {
      scheduleReload();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleReload();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    try {
      updatesChannel = new BroadcastChannel(certificatesUpdatesChannelName);
      updatesChannel.onmessage = (event) => {
        if (typeof event.data === "object" && event.data !== null) {
          const payload = event.data as Record<string, unknown>;
          if (
            Object.prototype.hasOwnProperty.call(payload, "items") &&
            applyCertificatesSnapshot(payload.items)
          ) {
            return;
          }
        }

        scheduleReload();
      };
    } catch {
      updatesChannel = null;
    }

    loadCertificatesFromStorage();
    void loadCertificates();
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadCertificates();
      }
    }, 6000);

    const channel = supabase
      .channel("portfolio-certificates-public-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_certificates",
          filter: "owner_id=eq.main",
        },
        () => {
          scheduleReload();
        },
      )
      .subscribe();

    return () => {
      active = false;
      if (reloadTimeout !== null) {
        window.clearTimeout(reloadTimeout);
      }
      window.clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (updatesChannel) {
        updatesChannel.close();
      }
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (!animating) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAnimating(false);
    }, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [animating]);

  const nextSlide = () => {
    if (animating || currentIndex >= total - 1) {
      return;
    }

    setAnimating(true);
    setCurrent((prev) => Math.min(prev + 1, total - 1));
  };

  const prevSlide = () => {
    if (animating || currentIndex <= 0) {
      return;
    }

    setAnimating(true);
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const jumpToSlide = (index: number) => {
    if (animating || index === currentIndex) {
      return;
    }

    setAnimating(true);
    setCurrent(index);
  };

  return (
    <section
      id="certificates"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 mt-12"
    >
      <motion.h2
        initial={{ opacity: 0, y: 32, filter: "blur(2px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.65 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center"
      >
        My Certificates
      </motion.h2>

      {total > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, x: -96, rotate: -2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-0 mb-10 flex items-center justify-center w-full max-w-7xl h-[330px] sm:h-[430px] md:h-[500px] lg:h-[560px] transform-gpu"
          >
            {canGoPrev ? (
              <button
                type="button"
                onClick={prevSlide}
                disabled={animating}
                className="absolute left-2 sm:left-8 md:left-60 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-2 sm:p-4 shadow-lg transition z-30 cursor-pointer disabled:opacity-50"
                aria-label="Move carousel left"
              >
                <FaChevronLeft size={18} />
              </button>
            ) : null}

            {certificates.map((certificate, index) => {
              const isCurrent = index === currentIndex;
              const isLeft = index === currentIndex - 1;
              const isRight = index === currentIndex + 1;
              const isSideTile = isLeft || isRight;
              const isFarLeft = index < currentIndex - 1;

              let transform = "opacity-0 pointer-events-none scale-80";
              if (isCurrent) {
                transform = "translate-x-0 scale-100 opacity-100 z-20";
              } else if (isLeft) {
                transform = "-translate-x-[78%] scale-50 opacity-50 z-10";
              } else if (isRight) {
                transform = "translate-x-[78%] scale-50 opacity-50 z-10";
              } else if (isFarLeft) {
                transform = "-translate-x-[165%] scale-40 opacity-0 pointer-events-none z-0";
              } else {
                transform = "translate-x-[165%] scale-40 opacity-0 pointer-events-none z-0";
              }

              return (
                <div
                  key={`${certificate.title}-${index}`}
                  // onClick={isSideTile ? () => jumpToSlide(index) : undefined}
                  className={`absolute w-[220px] h-[285px] sm:w-[340px] sm:h-[410px] md:w-[470px] md:h-[500px] lg:w-[520px] lg:h-[560px] rounded-3xl transition-all duration-700 ease-in-out transform ${transform} ${
                    isSideTile ? "cursor-default" : ""
                  }`}
                >
                  <CertificateCard {...certificate} />
                </div>
              );
            })}

            {canGoNext ? (
              <button
                type="button"
                onClick={nextSlide}
                disabled={animating}
                className="absolute right-2 sm:right-8 md:right-60 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-2 sm:p-4 shadow-lg transition z-30 cursor-pointer disabled:opacity-50"
                aria-label="Move carousel right"
              >
                <FaChevronRight className="pl-1" size={18} />
              </button>
            ) : null}
          </motion.div>

          {/* <div className="mt-2 flex items-center justify-center gap-3">
            <p className="min-w-20 text-center text-sm sm:text-base font-semibold text-cyan-100/90">
              {currentIndex + 1} / {total}
            </p>
          </div> */}

          <div className="mt-0 flex flex-wrap items-center justify-center gap-2">
            {certificates.map((certificate, index) => (
              <button
                key={`${certificate.title}-${index}`}
                type="button"
                onClick={() => jumpToSlide(index)}
                disabled={animating}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.85)]"
                    : "w-2.5 bg-white/35 hover:bg-white/60"
                } cursor-pointer disabled:opacity-70`}
                aria-label={`Go to certificate ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-white/15 bg-white/5 px-5 py-6 text-center text-sm text-cyan-100/80">
          No certificates available right now.
        </p>
      )}
    </section>
  );
}
