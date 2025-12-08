"use client";

import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeToggle() {
  // Avoid rendering until after mount to prevent SSR/CSR markup mismatch
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Read from dataset or localStorage once mounted, default to dark
    try {
      const docTheme = document.documentElement.getAttribute("data-theme");
      const saved = localStorage.getItem("theme");
      const initial = docTheme ?? saved ?? 'dark';
      setTheme(initial);
    } catch (e) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted || !theme) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }
  }, [mounted, theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (!mounted) {
    // Render nothing server-side and during first pass to keep markup stable
    return null;
  }

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="theme-toggle"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <FaSun /> : <FaMoon />}
    </button>
  );
}
