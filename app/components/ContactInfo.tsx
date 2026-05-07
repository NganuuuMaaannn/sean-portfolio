"use client";

import React from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";

type Props = {
  emails: string[];
  phones: string[];
  handleCopy: (text: string, e: React.MouseEvent<HTMLElement>) => void;
};

type ContactValueProps = {
  actionLabel: string;
  actionHref: string;
  value: string;
  handleCopy: (text: string, e: React.MouseEvent<HTMLElement>) => void;
};

function ContactValue({
  actionLabel,
  actionHref,
  value,
  handleCopy,
}: ContactValueProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={(event) => handleCopy(value, event)}
        className="contact-copy-trigger text-left transition hover:text-blue-600"
      >
        <span className="block break-all text-base font-medium sm:text-lg">
          {value}
        </span>
        <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.28em] hover:text-blue-600">
          Click to copy
        </span>
      </button>

      <a
        href={actionHref}
        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium transition hover:bg-blue-600/20"
      >
        {actionLabel}
      </a>
    </div>
  );
}

export default function ContactInfo({ emails, phones, handleCopy }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
            <FaEnvelope className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-(--muted)">
              Email
            </p>
            <p className="mt-1 text-sm leading-6 text-(--muted)">
              Reach out directly or tap any address to copy it.
            </p>

            <div className="mt-4 space-y-3">
              {emails.map((email, index) => (
                <ContactValue
                  key={`contact-email-${index}`}
                  actionHref={`mailto:${email}`}
                  actionLabel="Mail"
                  value={email}
                  handleCopy={handleCopy}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
            <FaPhone className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-(--muted)">
              Phone
            </p>
            <p className="mt-1 text-sm leading-6 text-(--muted)">
              Prefer a quick call? Use the number below or copy it in one tap.
            </p>

            <div className="mt-4 space-y-3">
              {phones.map((phone, index) => (
                <ContactValue
                  key={`contact-phone-${index}`}
                  actionHref={`tel:${phone.replace(/\s+/g, "")}`}
                  actionLabel="Call"
                  value={phone}
                  handleCopy={handleCopy}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
