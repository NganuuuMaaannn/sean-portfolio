"use client";

import { FormEvent, useEffect, useState } from "react";
import { Orbitron, Rajdhani } from "next/font/google";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const headingFont = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const IDLE_REDIRECT_MS = 10000;

export default function SeanLoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("Awaiting credentials");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsInitialized(true);
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const checkExistingSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active || error || !data.user) {
        return;
      }

      if (active) {
        router.replace("/sean-admin");
        router.refresh();
      }
    };

    void checkExistingSession();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const startIdleTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        router.replace("/sean-portfolio");
      }, IDLE_REDIRECT_MS);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "pointermove",
      "keydown",
      "scroll",
      "touchstart",
      "mousedown",
    ];

    startIdleTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, startIdleTimer, { passive: true });
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, startIdleTimer);
      });
    };
  }, [isInitialized, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusText("Verifying encrypted handshake...");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("operator") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatusText(`Access denied. ${error.message}`);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setStatusText(`Login succeeded but session verification failed. ${userError?.message ?? ""}`.trim());
        return;
      }

      setStatusText("Access granted. Redirecting to dashboard...");
      router.replace("/sean-admin");
      router.refresh();
    } catch {
      setStatusText("Unexpected auth error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace("/sean-portfolio");
  };

  return (
    <main className={`cyber-login ${bodyFont.className}`}>
      <div className="bg-layer bg-gradient" />
      <div className="bg-layer bg-grid" />
      <div className="bg-layer bg-scanlines" />
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      {!isInitialized ? (
        <section className="boot-shell">
          <div className="boot-card">
            <p className="boot-chip">INITIALIZING SECURE NODE</p>
            <h1 className={`boot-title ${headingFont.className}`}>Boot Sequence</h1>
            <div className="boot-bar">
              <span />
            </div>
            <p className="boot-status">Loading encrypted login interface...</p>
          </div>
        </section>
      ) : (
        <section className="auth-shell">
          <div className="frame reveal reveal-1">
            <div className="panel">
              <button className="back-btn" type="button" onClick={handleBack}>
                Back
              </button>
              <p className="chip reveal reveal-2">ASA KA MEGO? DIKA TAGA DIRI BA!</p>
              <h1 className={`glitch reveal reveal-3 ${headingFont.className}`} data-text="Welcome, Master Sean">
                Welcome, Master Sean
              </h1>
              <p className="subtitle reveal reveal-4">
                Authenticate to enter the high-privilege operations console.
              </p>

              <form className="form reveal reveal-5" onSubmit={handleSubmit}>
                <label className="field">
                  <span className="field-label">Operator ID</span>
                  <div className="input-wrap">
                    <span className="field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.2 0-7.7 2.2-9 5.4-.2.5.2 1 .8 1h16.4c.6 0 1-.5.8-1C19.7 16.2 16.2 14 12 14Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                    <input
                      type="email"
                      name="operator"
                      placeholder="Enter your operator ID"
                      autoComplete="username"
                      required
                    />
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">Passphrase</span>
                  <div className="input-wrap">
                    <span className="field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 11V8a5 5 0 0 1 10 0v3m-9 0h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H8a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="************"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      className="toggle"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </label>

                <div className="meta" />

                <button className="submit-btn" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Decrypting..." : "Authorize Entry"}</span>
                </button>
              </form>

              <p className="status reveal reveal-6" role="status">
                <span className="status-dot" />
                {statusText}
              </p>
            </div>
          </div>
        </section>
      )}

      <style jsx global>{`
        .cyber-login {
          --cyber-bg: #060a14;
          --cyber-panel: rgba(7, 13, 26, 0.86);
          --cyber-border: rgba(36, 255, 207, 0.44);
          --cyber-line: rgba(36, 255, 207, 0.22);
          --cyber-cyan: #30ffd8;
          --cyber-pink: #ff3f9e;
          --cyber-amber: #f9d750;
          position: relative;
          min-height: 100vh;
          display: grid;
          place-items: center;
          overflow: hidden;
          padding: 1.5rem;
          isolation: isolate;
          background: var(--cyber-bg);
          color: #d7f7ff;
        }

        .bg-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bg-gradient {
          background:
            radial-gradient(70% 50% at 15% 20%, rgba(255, 63, 158, 0.22), transparent 58%),
            radial-gradient(65% 45% at 90% 82%, rgba(48, 255, 216, 0.2), transparent 62%),
            linear-gradient(150deg, #03050d 5%, #061529 48%, #09060f 96%);
          animation: pulse-bg 8s ease-in-out infinite;
        }

        .bg-grid {
          background-image:
            linear-gradient(rgba(48, 255, 216, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(48, 255, 216, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(circle at center, black 24%, transparent 88%);
          opacity: 0.8;
          animation: drift-grid 16s linear infinite;
        }

        .bg-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.045) 0 1px,
            transparent 1px 4px
          );
          mix-blend-mode: soft-light;
          opacity: 0.32;
          animation: scan-shift 9s linear infinite;
        }

        .orb {
          position: absolute;
          width: 24rem;
          height: 24rem;
          border-radius: 999px;
          filter: blur(48px);
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }

        .orb-left {
          background: rgba(255, 63, 158, 0.26);
          top: -8rem;
          left: -8rem;
          animation: orbit-left 10s ease-in-out infinite;
        }

        .orb-right {
          background: rgba(48, 255, 216, 0.26);
          right: -7rem;
          bottom: -8rem;
          animation: orbit-right 12s ease-in-out infinite;
        }

        .back-btn {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          z-index: 4;
          height: 2.2rem;
          padding: 0 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(48, 255, 216, 0.38);
          background: rgba(7, 13, 26, 0.72);
          color: rgba(220, 252, 255, 0.95);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .back-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(48, 255, 216, 0.7);
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.35),
            0 0 14px rgba(48, 255, 216, 0.22);
          background: rgba(9, 16, 30, 0.84);
        }

        .auth-shell {
          position: relative;
          z-index: 2;
          width: min(100%, 29rem);
        }

        .boot-shell {
          position: relative;
          z-index: 3;
          width: min(100%, 34rem);
          display: grid;
          place-items: center;
        }

        .boot-card {
          width: 100%;
          border-radius: 1.2rem;
          border: 1px solid rgba(48, 255, 216, 0.35);
          background: linear-gradient(165deg, rgba(5, 12, 23, 0.93), rgba(5, 9, 20, 0.88));
          padding: 1.3rem 1.2rem;
          box-shadow:
            0 0 0 1px rgba(48, 255, 216, 0.15),
            0 20px 60px rgba(0, 0, 0, 0.45),
            0 0 30px rgba(48, 255, 216, 0.12);
          animation: boot-card-in 0.45s ease-out forwards;
        }

        .boot-chip {
          margin: 0;
          display: inline-flex;
          border-radius: 999px;
          border: 1px solid rgba(249, 215, 80, 0.38);
          background: rgba(249, 215, 80, 0.1);
          padding: 0.2rem 0.52rem;
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          color: rgba(249, 215, 80, 0.95);
        }

        .boot-title {
          margin: 0.85rem 0 0;
          font-size: clamp(1.35rem, 4.5vw, 1.9rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ebfbff;
          text-shadow:
            0 0 14px rgba(48, 255, 216, 0.35),
            0 0 3px rgba(255, 63, 158, 0.25);
          animation: boot-title-glow 1.2s ease-in-out infinite alternate;
        }

        .boot-bar {
          margin-top: 1rem;
          width: 100%;
          height: 0.6rem;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(48, 255, 216, 0.28);
          background: rgba(48, 255, 216, 0.08);
        }

        .boot-bar span {
          display: block;
          height: 100%;
          width: 35%;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(48, 255, 216, 0.75), rgba(255, 63, 158, 0.82));
          box-shadow: 0 0 12px rgba(48, 255, 216, 0.45);
          animation: boot-fill 0.9s ease forwards;
        }

        .boot-status {
          margin: 0.85rem 0 0;
          font-size: 0.92rem;
          color: rgba(186, 235, 246, 0.86);
          letter-spacing: 0.03em;
        }

        .frame {
          padding: 1px;
          border-radius: 1.25rem;
          background: linear-gradient(
            135deg,
            rgba(48, 255, 216, 0.75),
            rgba(255, 63, 158, 0.5),
            rgba(249, 215, 80, 0.6)
          );
          box-shadow:
            0 0 0 1px rgba(48, 255, 216, 0.2),
            0 30px 90px rgba(0, 0, 0, 0.55),
            0 0 32px rgba(48, 255, 216, 0.18);
        }

        .panel {
          position: relative;
          border-radius: calc(1.25rem - 1px);
          padding: 1.7rem 1.35rem 1.4rem;
          background: linear-gradient(
            170deg,
            rgba(6, 11, 22, 0.93),
            rgba(7, 13, 26, 0.84)
          );
          backdrop-filter: blur(7px);
          border: 1px solid var(--cyber-line);
          overflow: hidden;
        }

        .chip {
          width: fit-content;
          margin: 0;
          padding: 0.22rem 0.55rem;
          border: 1px solid rgba(48, 255, 216, 0.32);
          border-radius: 999px;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          color: var(--cyber-cyan);
          background: rgba(48, 255, 216, 0.1);
        }

        .glitch {
          position: relative;
          margin: 1rem 0 0;
          font-size: clamp(1.6rem, 4.6vw, 2.25rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.1;
          color: #f4fcff;
          text-shadow:
            0 0 18px rgba(48, 255, 216, 0.38),
            0 0 4px rgba(255, 63, 158, 0.3);
        }

        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.9;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }

        .glitch::before {
          color: rgba(255, 63, 158, 0.85);
          transform: translate(-2px, -1px);
          animation: glitch-top 2.5s infinite linear alternate-reverse;
        }

        .glitch::after {
          color: rgba(48, 255, 216, 0.85);
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          transform: translate(2px, 1px);
          animation: glitch-bottom 1.8s infinite linear alternate-reverse;
        }

        .subtitle {
          margin: 0.75rem 0 0;
          color: rgba(215, 247, 255, 0.82);
          font-size: 1.05rem;
          line-height: 1.35;
          letter-spacing: 0.03em;
        }

        .form {
          margin-top: 1.3rem;
          display: grid;
          gap: 0.9rem;
        }

        .field {
          display: grid;
          gap: 0.32rem;
        }

        .field-label {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(170, 247, 255, 0.78);
        }

        .input-wrap {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          width: 1.06rem;
          height: 1.06rem;
          transform: translateY(-50%);
          color: rgba(48, 255, 216, 0.75);
          pointer-events: none;
          z-index: 1;
        }

        .field-icon svg {
          width: 100%;
          height: 100%;
        }

        .input-wrap input {
          width: 100%;
          height: 2.95rem;
          border-radius: 0.78rem;
          border: 1px solid rgba(48, 255, 216, 0.25);
          background: rgba(1, 6, 15, 0.72);
          color: #f5fdff;
          padding: 0 3.6rem 0 2.55rem;
          font-size: 1rem;
          outline: none;
          box-shadow: inset 0 0 0 1px rgba(48, 255, 216, 0.08);
          transition:
            border-color 0.24s ease,
            box-shadow 0.24s ease,
            transform 0.24s ease;
        }

        .input-wrap input::placeholder {
          color: rgba(162, 205, 224, 0.55);
        }

        .input-wrap input:focus {
          border-color: rgba(48, 255, 216, 0.7);
          box-shadow:
            0 0 0 2px rgba(48, 255, 216, 0.17),
            0 0 20px rgba(48, 255, 216, 0.18);
          transform: translateY(-1px);
        }

        .toggle {
          position: absolute;
          top: 50%;
          right: 0.6rem;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: rgba(249, 215, 80, 0.92);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          font-weight: 700;
          padding: 0.35rem;
          cursor: pointer;
        }

        .toggle:hover {
          color: #ffe784;
          text-shadow: 0 0 10px rgba(249, 215, 80, 0.46);
        }

        .meta {
          margin-top: 0.1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .remember {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.95rem;
          color: rgba(208, 236, 244, 0.84);
        }

        .remember input {
          width: 0.95rem;
          height: 0.95rem;
          accent-color: #30ffd8;
        }

        .link-btn {
          border: none;
          background: transparent;
          color: rgba(255, 63, 158, 0.9);
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          cursor: pointer;
        }

        .link-btn:hover {
          color: #ff66b1;
          text-shadow: 0 0 10px rgba(255, 63, 158, 0.35);
        }

        .submit-btn {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(48, 255, 216, 0.55);
          border-radius: 0.84rem;
          height: 3rem;
          background:
            linear-gradient(
              95deg,
              rgba(20, 184, 166, 0.92),
              rgba(7, 83, 89, 0.95) 56%,
              rgba(255, 63, 158, 0.84)
            );
          color: #faffff;
          font-size: 0.94rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.24s ease,
            box-shadow 0.24s ease,
            filter 0.24s ease;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.36);
        }

        .submit-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 22%,
            rgba(255, 255, 255, 0.32) 48%,
            transparent 70%
          );
          transform: translateX(-140%);
          animation: btn-sweep 3.6s linear infinite;
          pointer-events: none;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: saturate(1.1);
          box-shadow:
            0 14px 28px rgba(0, 0, 0, 0.45),
            0 0 18px rgba(48, 255, 216, 0.35);
        }

        .submit-btn:disabled {
          cursor: wait;
          opacity: 0.9;
        }

        .status {
          margin: 1rem 0 0;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(187, 230, 246, 0.8);
          letter-spacing: 0.02em;
          font-size: 0.93rem;
        }

        .status-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 999px;
          background: var(--cyber-amber);
          box-shadow: 0 0 12px rgba(249, 215, 80, 0.6);
          animation: pulse-dot 1.8s ease-in-out infinite;
        }

        .reveal {
          opacity: 0;
          transform: translateY(12px);
          animation: rise-in 0.55s ease forwards;
        }

        .reveal-1 {
          animation-delay: 0.1s;
        }

        .reveal-2 {
          animation-delay: 0.25s;
        }

        .reveal-3 {
          animation-delay: 0.35s;
        }

        .reveal-4 {
          animation-delay: 0.48s;
        }

        .reveal-5 {
          animation-delay: 0.6s;
        }

        .reveal-6 {
          animation-delay: 0.72s;
        }

        @keyframes rise-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes boot-card-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes boot-title-glow {
          from {
            text-shadow:
              0 0 10px rgba(48, 255, 216, 0.25),
              0 0 2px rgba(255, 63, 158, 0.2);
          }
          to {
            text-shadow:
              0 0 22px rgba(48, 255, 216, 0.55),
              0 0 8px rgba(255, 63, 158, 0.4);
          }
        }

        @keyframes boot-fill {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes pulse-bg {
          0%,
          100% {
            filter: saturate(1) brightness(1);
          }
          50% {
            filter: saturate(1.2) brightness(1.05);
          }
        }

        @keyframes drift-grid {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(48px, 48px, 0);
          }
        }

        @keyframes scan-shift {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(16px);
          }
        }

        @keyframes orbit-left {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(24px, 18px);
          }
        }

        @keyframes orbit-right {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-22px, -16px);
          }
        }

        @keyframes sheen {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(130%);
          }
        }

        @keyframes glitch-top {
          0%,
          100% {
            transform: translate(-2px, -1px);
          }
          20% {
            transform: translate(-4px, -1px);
          }
          40% {
            transform: translate(-1px, -2px);
          }
          60% {
            transform: translate(-3px, 0);
          }
          80% {
            transform: translate(-1px, -1px);
          }
        }

        @keyframes glitch-bottom {
          0%,
          100% {
            transform: translate(2px, 1px);
          }
          20% {
            transform: translate(1px, 2px);
          }
          40% {
            transform: translate(4px, 2px);
          }
          60% {
            transform: translate(2px, 0);
          }
          80% {
            transform: translate(3px, 1px);
          }
        }

        @keyframes btn-sweep {
          from {
            transform: translateX(-140%);
          }
          to {
            transform: translateX(150%);
          }
        }

        @keyframes pulse-dot {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .cyber-login {
            padding: 1rem;
          }

          .back-btn {
            top: 0.9rem;
            right: 0.9rem;
            height: 2rem;
            padding: 0 0.75rem;
            font-size: 0.72rem;
          }

          .panel {
            padding: 1.4rem 1rem 1.2rem;
          }

          .meta {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
