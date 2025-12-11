"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

type Props = { children: React.ReactNode };

export default function LenisProvider({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      try {
        lenis.destroy();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return <>{children}</>;
}
