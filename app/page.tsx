"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { FiMinus } from "react-icons/fi";

const commands = [
  { text: "git clone https://github.com/NganuuuMaaannn/sean-portfolio.git", color: "green" },
  { text: "Cloning into 'sean-portfolio'...", color: "white" },
  { text: "Receiving objects: 100% (245/245)", color: "white" },
  { text: "Resolving deltas: 100% (120/120)", color: "white" },
  { text: "cd sean-portfolio", color: "green" },
  { text: "npm install", color: "green" },
  { text: "Installing dependencies...", color: "white" },
  { text: "✔ react", color: "white" },
  { text: "✔ next", color: "white" },
  { text: "✔ tailwindcss", color: "white" },
  { text: "✔ done", color: "white" },
  { text: "npm run dev", color: "green" },
  { text: "▲ Next.js ready on http://localhost:3000", color: "white" },
];

export default function CmdIntro() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<{ text: string; color: string }[]>([]);
  const [current, setCurrent] = useState("");
  const [cursor, setCursor] = useState(true);

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(blink);
  }, []);

  // Typing animation
  useEffect(() => {
    let cancelled = false;

    const typeAll = async () => {
      for (const cmd of commands) {
        let typed = "";

        for (const char of cmd.text) {
          if (cancelled) return;

          typed += char;
          setCurrent(typed);
          await new Promise((r) => setTimeout(r, 25));
        }

        if (cancelled) return;

        setLines((prev) => [...prev, { text: cmd.text, color: cmd.color }]);
        setCurrent("");

        await new Promise((r) => setTimeout(r, 400));

        if (cmd.text === "npm run dev") {
          await new Promise((r) => setTimeout(r, 2000));
        }

        if (cmd.text.startsWith("▲ Next.js ready")) {
          await new Promise((r) => setTimeout(r, 1000));
        }

        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      if (!cancelled) {
        document.body.classList.add("cmd-exit");
        setTimeout(() => router.push("/sean-portfolio"), 600);
      }
    };

    typeAll();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
      <div className="w-[90%] max-w-3xl rounded-lg shadow-2xl border border-gray-700 bg-black">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-gray-700 rounded-t-lg">
          <span className="text-gray-300 text-sm">
            C:\Windows\System32\cmd.exe
          </span>
          <div className="flex gap-2 text-gray-300 text-sm">
            <FiMinus className="text-gray-300" />
            <MdOutlineCheckBoxOutlineBlank className="text-gray-300" />
            <RxCross2 className="text-gray-300" />
          </div>
        </div>

        {/* CMD Body */}
        <div
          ref={containerRef}
          className="p-4 font-mono text-sm md:text-base h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black"
        >
          <div className="text-gray-300">
            Microsoft Windows [Version 10.0.22000.2538]
          </div>
          <div className="text-gray-300">
            (c) Microsoft Corporation. All rights reserved.
          </div>
          <br />

          {lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap ${line.color === "green" ? "text-gray-200" : "text-green-400"
                }`}
            >
              C:\Users\Sean&gt; {line.text}
            </div>
          ))}

          <div className="flex text-gray-200">
            <span>C:\Users\Sean&gt;</span>
            <span className="ml-2">
              {current}
              {cursor ? "▋" : " "}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
