"use client";

import { useEffect, useState } from "react";
import ContactInfo from "../components/ContactInfo";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const defaultContactEmail = "ronniedoinog12@gmail.com";
const defaultContactPhone = "+63 938 646 7629";
const defaultContactTagline = "Let's build something together!";

type PortfolioProfileContactRow = {
  id: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_tagline: string | null;
};

function normalizeContactList(value: unknown, fallback: string): string[] {
  const normalized =
    Array.isArray(value)
      ? value
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0)
      : typeof value === "string"
        ? value
            .split(/\r?\n/g)
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)
        : [];

  return normalized.length > 0 ? normalized : [fallback];
}

function areSameContactLists(first: string[], second: string[]): boolean {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((entry, index) => entry === second[index]);
}

export default function Contact() {
  const [copied, setCopied] = useState<string | null>(null);
  const [confettiPos, setConfettiPos] = useState<{ x: number; y: number } | null>(null);
  const [contactEmails, setContactEmails] = useState<string[]>([defaultContactEmail]);
  const [contactPhones, setContactPhones] = useState<string[]>([defaultContactPhone]);
  const [contactTagline, setContactTagline] = useState(defaultContactTagline);
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  const handleCopy = async (text: string, e: React.MouseEvent<HTMLSpanElement>) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);

      // Get click position relative to viewport
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setConfettiPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(null);
        setConfettiPos(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const contactStorageKey = "portfolio-contact-info";
    const contactUpdatedAtStorageKey = "portfolio-contact-updated-at";
    const contactUpdatesChannelName = "portfolio-contact-updates";

    let active = true;
    let reloadTimeout: number | null = null;
    let updatesChannel: BroadcastChannel | null = null;

    const applyContact = (emailValue: unknown, phoneValue: unknown, taglineValue: unknown) => {
      if (!active) {
        return;
      }

      const nextEmails = normalizeContactList(emailValue, defaultContactEmail);
      const nextPhones = normalizeContactList(phoneValue, defaultContactPhone);
      const nextTagline =
        typeof taglineValue === "string" && taglineValue.trim()
          ? taglineValue.trim()
          : defaultContactTagline;

      setContactEmails((current) =>
        areSameContactLists(current, nextEmails) ? current : nextEmails,
      );
      setContactPhones((current) =>
        areSameContactLists(current, nextPhones) ? current : nextPhones,
      );
      setContactTagline((current) => (current === nextTagline ? current : nextTagline));
    };

    const applyContactSnapshot = (value: unknown) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
      }

      const record = value as Record<string, unknown>;
      const emailValue =
        record.contactEmails ??
        record.contact_emails ??
        record.contactEmail ??
        record.contact_email ??
        null;
      const phoneValue =
        record.contactPhones ??
        record.contact_phones ??
        record.contactPhone ??
        record.contact_phone ??
        null;
      const taglineValue = record.contactTagline ?? record.contact_tagline ?? null;

      applyContact(emailValue, phoneValue, taglineValue);
      return true;
    };

    const loadContactFromStorage = () => {
      try {
        const cached = window.localStorage.getItem(contactStorageKey);
        if (!cached) {
          return false;
        }

        return applyContactSnapshot(JSON.parse(cached) as unknown);
      } catch {
        return false;
      }
    };

    const loadContact = async () => {
      const { data, error } = await supabase
        .from("portfolio_profile")
        .select("id, contact_email, contact_phone, contact_tagline")
        .eq("id", "main")
        .maybeSingle<PortfolioProfileContactRow>();

      if (error || !data) {
        loadContactFromStorage();
        return;
      }

      const nextEmails = normalizeContactList(data.contact_email, defaultContactEmail);
      const nextPhones = normalizeContactList(data.contact_phone, defaultContactPhone);
      const nextTagline =
        typeof data.contact_tagline === "string" && data.contact_tagline.trim()
          ? data.contact_tagline.trim()
          : defaultContactTagline;
      applyContact(nextEmails, nextPhones, nextTagline);

      try {
        window.localStorage.setItem(
          contactStorageKey,
          JSON.stringify({
            contactEmails: nextEmails,
            contactPhones: nextPhones,
            contactEmail: nextEmails[0] ?? defaultContactEmail,
            contactPhone: nextPhones[0] ?? defaultContactPhone,
            contactTagline: nextTagline,
          }),
        );
        window.localStorage.setItem(contactUpdatedAtStorageKey, Date.now().toString());
      } catch {
        // Ignore storage write failures.
      }
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
        void loadContact();
      }, 140);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === contactStorageKey && event.newValue) {
        try {
          const snapshot = JSON.parse(event.newValue) as unknown;
          if (applyContactSnapshot(snapshot)) {
            return;
          }
        } catch {
          // Ignore malformed storage payloads.
        }
      }

      if (event.key === contactUpdatedAtStorageKey || event.key === contactStorageKey) {
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
      updatesChannel = new BroadcastChannel(contactUpdatesChannelName);
      updatesChannel.onmessage = (event) => {
        if (typeof event.data === "object" && event.data !== null) {
          const payload = event.data as Record<string, unknown>;
          if (
            Object.prototype.hasOwnProperty.call(payload, "contact") &&
            applyContactSnapshot(payload.contact)
          ) {
            return;
          }
        }

        scheduleReload();
      };
    } catch {
      updatesChannel = null;
    }

    loadContactFromStorage();
    void loadContact();

    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadContact();
      }
    }, 6000);

    const channel = supabase
      .channel("portfolio-contact-public-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_profile",
          filter: "id=eq.main",
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
      id="contact"
      className="mt-6 mb-6 min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 text-center relative"
    >
      <motion.h2
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
      >
        Contact Me
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-sm sm:text-base md:text-lg"
      >
        {contactTagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        viewport={{ once: true }}
      >
        <ContactInfo
          emails={contactEmails}
          phones={contactPhones}
          handleCopy={handleCopy}
        />
      </motion.div>

      {/* Confetti GIF at click position */}
      {confettiPos && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/confetti.gif"
          alt="Confetti"
          className="w-32 h-32 fixed pointer-events-none z-40"
          style={{
            left: confettiPos.x,
            top: confettiPos.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Glassmorphism toast */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-md px-6 py-2 rounded-xl shadow-lg border border-white/20 animate-slideUp">
          Copied to Clipboard
        </div>
      )}
    </section>
  );
}
