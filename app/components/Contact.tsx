"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

import ContactInfo from "./ContactInfo";
import { createClient } from "@/lib/supabase/client";

const defaultContactEmail = "seanmichael.doinog@hcdc.edu.ph";
const defaultContactPhone = "+63 938 646 7629";
const defaultContactTagline = "Let's build something together!";
const emailJsEndpoint = "https://api.emailjs.com/api/v1.0/email/send";
const emailSendCooldownMs = 60000;
const emailSendCooldownStorageKey = "portfolio-email-send-cooldown-ends-at";
const emailJsServiceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const emailJsTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const emailJsAutoReplyTemplateId =
  process.env.NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID ?? "";
const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
const emailJsToName = process.env.NEXT_PUBLIC_EMAILJS_TO_NAME ?? "Sean";
const isEmailJsConfigured = Boolean(
  emailJsServiceId && emailJsTemplateId && emailJsPublicKey,
);

type PortfolioProfileContactRow = {
  id: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_tagline: string | null;
};

type ContactFormValues = {
  from_name: string;
  reply_to: string;
  message: string;
};

const initialFormValues: ContactFormValues = {
  from_name: "",
  reply_to: "",
  message: "",
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

function getIdleStatusText(isConfigured: boolean) {
  return isConfigured
    ? "Use the form to send a message straight to my inbox."
    : "Add your EmailJS keys in the environment file to enable sending.";
}

function getCooldownSecondsLeft(cooldownEndsAt: number | null) {
  if (!cooldownEndsAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));
}

function getStoredCooldownEndsAt() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = Number(
    window.localStorage.getItem(emailSendCooldownStorageKey) ?? "0",
  );

  if (!Number.isFinite(storedValue) || storedValue <= Date.now()) {
    window.localStorage.removeItem(emailSendCooldownStorageKey);
    return null;
  }

  return storedValue;
}

async function sendEmailJsTemplate(
  templateId: string,
  templateParams: Record<string, string>,
) {
  const response = await fetch(emailJsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: emailJsServiceId,
      template_id: templateId,
      user_id: emailJsPublicKey,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const errorText = (await response.text()).trim();
    throw new Error(errorText || "EmailJS request failed.");
  }
}

export default function Contact() {
  const [copied, setCopied] = useState<string | null>(null);
  const [confettiPos, setConfettiPos] = useState<{ x: number; y: number } | null>(null);
  const [contactEmails, setContactEmails] = useState<string[]>([defaultContactEmail]);
  const [contactPhones, setContactPhones] = useState<string[]>([defaultContactPhone]);
  const [contactTagline, setContactTagline] = useState(defaultContactTagline);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState(() =>
    getIdleStatusText(
      isEmailJsConfigured,
    ),
  );
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  const isCooldownActive = cooldownSecondsLeft > 0;

  const handleCopy = async (text: string, event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setConfettiPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      setTimeout(() => {
        setCopied(null);
        setConfettiPos(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy contact detail.", error);
    }
  };

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const fieldName = event.target.name as keyof ContactFormValues;

    setFormValues((current) => ({
      ...current,
      [fieldName]: event.target.value,
    }));

    if (formStatus !== "idle") {
      setFormStatus("idle");
      setStatusMessage(getIdleStatusText(isEmailJsConfigured));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isEmailJsConfigured) {
      setFormStatus("error");
      setStatusMessage("EmailJS is not configured yet. Add the public keys first.");
      return;
    }

    if (isCooldownActive) {
      setFormStatus("error");
      setStatusMessage(`Please wait ${cooldownSecondsLeft}s before sending another message.`);
      return;
    }

    const fromName = formValues.from_name.trim();
    const replyTo = formValues.reply_to.trim();
    const message = formValues.message.trim();

    if (!fromName || !replyTo || !message) {
      setFormStatus("error");
      setStatusMessage("Please complete your full name, email address, and message.");
      return;
    }

    setFormStatus("sending");
    setStatusMessage("Sending your message...");

    try {
      const submittedAt = new Date().toLocaleString();
      const primaryContactEmail = contactEmails[0] ?? defaultContactEmail;
      const templateParams = {
        to_name: emailJsToName,
        from_name: fromName,
        name: fromName,
        from_email: replyTo,
        email: replyTo,
        to_email: replyTo,
        reply_to: replyTo,
        user_email: replyTo,
        subject: `New portfolio message from ${fromName}`,
        title: `New portfolio message from ${fromName}`,
        message,
        submitted_at: submittedAt,
        portfolio_owner: emailJsToName,
        portfolio_email: primaryContactEmail,
      };

      await sendEmailJsTemplate(emailJsTemplateId, templateParams);

      let autoReplyFailed = false;

      if (emailJsAutoReplyTemplateId) {
        try {
          await sendEmailJsTemplate(emailJsAutoReplyTemplateId, templateParams);
        } catch (error) {
          autoReplyFailed = true;
          console.error("EmailJS auto-reply failed.", error);
        }
      }

      setFormValues(initialFormValues);
      const nextCooldownEndsAt = Date.now() + emailSendCooldownMs;
      window.localStorage.setItem(
        emailSendCooldownStorageKey,
        nextCooldownEndsAt.toString(),
      );
      setCooldownEndsAt(nextCooldownEndsAt);
      setCooldownSecondsLeft(getCooldownSecondsLeft(nextCooldownEndsAt));
      setFormStatus("success");
      setStatusMessage(
        autoReplyFailed
          ? "Message sent successfully, but the automatic reply could not be delivered."
          : "Message sent successfully. Thanks for reaching out.",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "EmailJS request failed.";

      console.error("EmailJS send failed.", error);
      setFormStatus("error");
      setStatusMessage(`Message failed to send: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const storedCooldownEndsAt = getStoredCooldownEndsAt();

    if (!storedCooldownEndsAt) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCooldownEndsAt(storedCooldownEndsAt);
      setCooldownSecondsLeft(getCooldownSecondsLeft(storedCooldownEndsAt));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!cooldownEndsAt) {
      return;
    }

    const interval = window.setInterval(() => {
      const remainingMs = cooldownEndsAt - Date.now();

      if (remainingMs <= 0) {
        window.localStorage.removeItem(emailSendCooldownStorageKey);
        setCooldownEndsAt(null);
        setCooldownSecondsLeft(0);
        setFormStatus("idle");
        setStatusMessage(getIdleStatusText(isEmailJsConfigured));
        return;
      }

      setCooldownSecondsLeft(Math.ceil(remainingMs / 1000));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownEndsAt]);

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

    const handleStorage = (storageEvent: StorageEvent) => {
      if (storageEvent.key === contactStorageKey && storageEvent.newValue) {
        try {
          const snapshot = JSON.parse(storageEvent.newValue) as unknown;
          if (applyContactSnapshot(snapshot)) {
            return;
          }
        } catch {
          // Ignore malformed storage payloads.
        }
      }

      if (
        storageEvent.key === contactUpdatedAtStorageKey ||
        storageEvent.key === contactStorageKey
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
      updatesChannel = new BroadcastChannel(contactUpdatesChannelName);
      updatesChannel.onmessage = (broadcastEvent) => {
        if (typeof broadcastEvent.data === "object" && broadcastEvent.data !== null) {
          const payload = broadcastEvent.data as Record<string, unknown>;
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

  const isSubmitDisabled =
    formStatus === "sending" || isCooldownActive || !isEmailJsConfigured;
  const submitButtonLabel =
    formStatus === "sending"
      ? "Sending..."
      : isCooldownActive
        ? `Send again in ${cooldownSecondsLeft}s`
        : "Send Message";
  const submitButtonHoverLabel =
    formStatus === "sending"
      ? "Sending..."
      : isCooldownActive
        ? `Retry in ${cooldownSecondsLeft}s`
        : "Send Message";
  const submitButtonCanHover = !isSubmitDisabled;

  return (
    <section id="contact" className="relative mt-6 mb-8 min-h-screen px-4 py-16 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-80 max-w-5xl blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="card contact-card relative overflow-hidden rounded-4xl border border-white/10 p-6 text-left shadow-[0_24px_80px_rgba(15,23,42,0.25)] sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0" />

          <div className="relative">

            <h2 className="mt-0 text-3xl font-semibold sm:text-4xl">
              Contact Me
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 sm:text-base text-(--muted)">
              {contactTagline}
            </p>

            <p className="mt-3 max-w-lg text-sm leading-7 sm:text-base text-(--muted)">
              If you have a project, collaboration, or role in mind, the details on this side are
              ready for quick contact. If you want to send a direct message right away, use the
              EmailJS form on the right.
            </p>

            <div className="mt-8">
              <ContactInfo
                emails={contactEmails}
                phones={contactPhones}
                handleCopy={handleCopy}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true }}
          className="card contact-card relative overflow-hidden rounded-4xl border border-white/10 p-6 text-left shadow-[0_24px_80px_rgba(15,23,42,0.25)] sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0" />

          <div className="relative">
            <h3 className="mt-0 text-3xl font-semibold sm:text-4xl">
              Send Message
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-7 sm:text-base text-(--muted)">
              Share your name, email, and message below. This form is wired for EmailJS, so once
              your keys are added it can send messages directly from the portfolio.
            </p>

            <form
              onSubmit={handleSubmit}
              aria-busy={formStatus === "sending"}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="contact-full-name"
                  className="text-sm font-medium uppercase tracking-[0.2em] text-(--muted)"
                >
                  Full Name
                </label>
                <input
                  id="contact-full-name"
                  name="from_name"
                  type="text"
                  autoComplete="name"
                  value={formValues.from_name}
                  onChange={handleFieldChange}
                  placeholder="Your full name"
                  className="mt-3 w-full rounded-3xl border border-white/10 px-4 py-3.5 text-sm outline-none transition [background:var(--glass)] placeholder:text-slate-400 focus:border-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email-address"
                  className="text-sm font-medium uppercase tracking-[0.2em] text-(--muted)"
                >
                  Email Address
                </label>
                <input
                  id="contact-email-address"
                  name="reply_to"
                  type="email"
                  autoComplete="email"
                  value={formValues.reply_to}
                  onChange={handleFieldChange}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-3xl border border-white/10 px-4 py-3.5 text-sm outline-none transition [background:var(--glass)] placeholder:text-slate-400 focus:border-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="text-sm font-medium uppercase tracking-[0.2em] text-(--muted)"
                >
                  Your Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formValues.message}
                  onChange={handleFieldChange}
                  placeholder="Tell me about your project, idea, or opportunity."
                  rows={7}
                  className="mt-3 min-h-[180px] w-full resize-y rounded-3xl border border-white/10 px-4 py-3.5 text-sm outline-none transition [background:var(--glass)] placeholder:text-slate-400 focus:border-white/40"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p
                  aria-live="polite"
                  className={`text-sm leading-6 ${formStatus === "error"
                      ? "text-rose-400"
                      : formStatus === "success"
                        ? "text-emerald-400"
                        : "text-(--muted)"
                    }`}
                >
                  {statusMessage}
                </p>

                <button
                  type="submit"
                  aria-label={submitButtonLabel}
                  disabled={isSubmitDisabled}
                  className={`group/submit relative inline-flex h-12 w-full overflow-hidden rounded-full border border-black/15 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-w-56 ${
                    isSubmitDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_22px_50px_rgba(249,115,22,0.22)]"
                  }`}
                >
                  <span className="sr-only">{submitButtonLabel}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 flex items-center justify-center rounded-full bg-white px-6 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-950 transition-transform duration-300 ease-[cubic-bezier(0.44,0,0.56,1)] will-change-transform ${
                      submitButtonCanHover ? "group-hover/submit:-translate-y-[105%]" : ""
                    }`}
                  >
                    {submitButtonLabel}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 flex translate-y-[105%] items-center justify-between rounded-full bg-slate-950 pl-5 pr-2.5 text-white transition-transform duration-300 ease-[cubic-bezier(0.44,0,0.56,1)] will-change-transform ${
                      submitButtonCanHover ? "group-hover/submit:translate-y-0" : ""
                    }`}
                  >
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em]">
                      {submitButtonHoverLabel}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.22)]">
                      <FiArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {confettiPos && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/confetti.gif"
          alt="Confetti"
          className="fixed z-40 h-32 w-32 pointer-events-none"
          style={{
            left: confettiPos.x,
            top: confettiPos.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {copied && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform rounded-xl border border-white/20 bg-white/30 px-6 py-2 shadow-lg backdrop-blur-md animate-slideUp">
          Copied to Clipboard
        </div>
      )}
    </section>
  );
}
