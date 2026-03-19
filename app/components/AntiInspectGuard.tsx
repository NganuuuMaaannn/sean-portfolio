"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const antiInspectEnv = process.env.NEXT_PUBLIC_ANTI_INSPECT_ENABLED;
const antiInspectEnabledByEnv = antiInspectEnv !== "false";

export default function AntiInspectGuard() {
  const pathname = usePathname();
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);
  const disableDevtoolRef = useRef<Awaited<typeof import("disable-devtool")>["default"] | null>(null);
  const isActive = antiInspectEnabledByEnv && pathname === "/sean-portfolio";

  useEffect(() => {
    let cancelled = false;

    const syncGuardState = async () => {
      if (!isActive) {
        setDevtoolsOpen(false);

        if (disableDevtoolRef.current) {
          disableDevtoolRef.current.isSuspend = true;
        }
        return;
      }

      const { default: disableDevtool } = await import("disable-devtool");
      if (cancelled) {
        disableDevtool.isSuspend = true;
        return;
      }

      disableDevtoolRef.current = disableDevtool;

      if (!disableDevtool.isRunning) {
        disableDevtool({
          clearLog: true,
          disableMenu: true,
          ondevtoolclose: () => {
            setDevtoolsOpen(false);
          },
          ondevtoolopen: () => {
            setDevtoolsOpen(true);
          },
        });
      }

      disableDevtool.isSuspend = false;
    };

    void syncGuardState();

    return () => {
      cancelled = true;
      if (disableDevtoolRef.current) {
        disableDevtoolRef.current.isSuspend = true;
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setDevtoolsOpen(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <>
      {devtoolsOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/96 px-6 text-center backdrop-blur-sm">
          <div className="max-w-lg rounded-[2rem] border border-cyan-400/25 bg-black/55 px-8 py-10 text-cyan-50 shadow-[0_30px_120px_rgba(6,182,212,0.2)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-200/70">
              Protected View
            </p>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              Developer tools detected
            </h2>
            <p className="mt-4 text-sm leading-6 text-cyan-100/75 sm:text-base">
              Close developer tools to keep browsing, or disable the anti-inspect
              flag while you are maintaining the site.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
