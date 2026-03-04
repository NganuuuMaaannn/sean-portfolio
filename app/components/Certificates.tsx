"use client";

import { useEffect, useState } from "react";
import CertificateCard from "./CertificateCard";
import { motion, type Variants } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

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

export default function Certificates() {
  const [certificates, setCertificates] = useState<CertificateShape[]>(defaultCertificates);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 70 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

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
        onViewportEnter={() => setHasEnteredViewport(true)}
      >
        {certificates.map((c, index) => (
          <motion.div
            key={`${c.title}-${index}`}
            variants={item}
            initial={hasEnteredViewport ? "hidden" : undefined}
            animate={hasEnteredViewport ? "show" : undefined}
            className="will-change-transform"
          >
            <CertificateCard {...c} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
