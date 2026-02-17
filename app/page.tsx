"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { FiMinus } from "react-icons/fi";

type Part = { text: string; color?: string };
type Line = {
  text?: string;
  indent?: boolean;
  isCommand?: boolean;
  parts?: Part[];
  delay?: number;
};

const outputSteps: Line[] = [
  {
    parts: [
      { text: " ", color: "text-white" },
    ],
  },
  {
    delay: 500,
    parts: [
      { text: "> sean-portfolio@0.1.0 dev", color: "text-white" },
    ],
  },
  {
    parts: [
      { text: "> next dev", color: "text-white" },
    ],
  },
  {
    parts: [
      { text: " ", color: "text-white" },
    ],
  },
  { 
    delay: 500, 
    indent: true, 
    parts: [
      { 
        text: "▲ Next.js 16.0.7 ", 
        color: "text-purple-400" 
      },
      { 
        text: "(Turbopack)", 
        color: "text-white" 
      },
    ], 
  }, 
  { 
    indent: true, 
    parts: [
      { text: "- Local: http://localhost:3000", color: "text-white" }
    ], 
  }, 
  { 
    indent: true, 
    parts: [
      { text: "- Network: http://192.168.100.10:3000", color: "text-white" }
    ], 
  },
  {
    parts: [
      { text: " ", color: "text-white" },
    ],
  },
  {
    parts: [
      { 
        text: "✓ ", 
        color: "text-green-400" 
      },
      { 
        text: "Starting...", 
        color: "text-white" 
      },
    ], 
  },
  {
    delay: 500,
    parts: [
      { 
        text: "✓ ", 
        color: "text-green-400" 
      },
      { 
        text: "Ready in 1651ms", 
        color: "text-white" 
      },
    ],
  },
  {
    delay: 500,
    parts: [
      { text: "○ Compiling / ...", color: "text-white" },
    ],
  },
  {
    delay: 500,
    parts: [
      {
        text: "GET / ",
        color: "text-white",
      },
      {
        text: "200 ",
        color: "text-green-400",
      },
      {
        text: "in 4.8s (compile: 4.2s, render: 616ms)",
        color: "text-white",
      },
    ],
  },
  {
    delay: 500,
    parts: [
      {
        text: "GET / sean-portfolio ",
        color: "text-white",
      },
      {
        text: "200 ",
        color: "text-green-400",
      },
      {
        text: "in 3.1s (compile: 3.0s, render: 62ms)",
        color: "text-white",
      },
    ],
  },
];

export default function CmdIntro() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [current, setCurrent] = useState("");
  const [cursor, setCursor] = useState(true);

  /* Cursor blink */
  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(blink);
  }, []);

  /* Auto scroll */
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines, current]);

  /* Typing + Output Flow */
  useEffect(() => {
    let cancelled = false;

    const typeCommand = async () => {
      const cmd = "npm run dev";
      let typed = "";

      for (const char of cmd) {
        if (cancelled) return;
        typed += char;
        setCurrent(typed);
        await new Promise((r) => setTimeout(r, 40));
      }

      // Commit typed command
      setLines([
        {
          isCommand: true,
          parts: [
            { text: "PS C:\\Users\\Sean\\sean-portfolio> ", color: "text-gray-200" },
            { text: "npm", color: "text-yellow-400" },
            { text: " run dev", color: "text-white" },
          ],
        },
      ]);
      setCurrent("");
    };

    const showOutputs = async () => {
      for (const step of outputSteps) {
        await new Promise((r) => setTimeout(r, step.delay || 140));
        setLines((prev) => [...prev, step]);
      }

      setTimeout(() => router.push("/sean-portfolio"), 500);
    };

    (async () => {
      await typeCommand();
      await showOutputs();
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-3xl rounded-lg shadow-2xl border border-gray-700 bg-black">

        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-gray-700 rounded-t-lg">
          <span className="text-gray-300 text-sm">
            C:\Windows\System32\cmd.exe
          </span>
          <div className="flex gap-2 text-gray-300 text-sm">
            <FiMinus />
            <MdOutlineCheckBoxOutlineBlank />
            <RxCross2 />
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

          {/* Live typing line */}
          {lines.length === 0 && (
            <div className="whitespace-pre-wrap text-gray-200">
              PS C:\Users\Sean\sean-portfolio&gt;
              <span className="text-gray-200 ml-2">
                <span className="text-yellow-400">{current.slice(0, 3)}</span>
                <span className="text-white">{current.slice(3)}</span>
                {cursor ? "▋" : " "}
              </span>
            </div>
          )}

          {/* Output Lines */}
          {lines.map((line, i) => {
            const content = line.parts?.map((p, idx) => (
              <span key={idx} className={p.color || "text-white"}>
                {p.text}
              </span>
            ));

            return (
              <div
                key={i}
                className={`whitespace-pre ${line.indent ? "pl-4" : ""}`}
              >
                {content || line.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
