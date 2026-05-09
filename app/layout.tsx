import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import PageTransition from "@/app/components/PageTransition";
import AntiInspectGuard from "@/app/components/AntiInspectGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sean's Portfolio",
  description: "Sean Michael T. Doinog - Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`}
        </Script>
        <Script id="smooth-wheel-scroll" strategy="afterInteractive">
          {`(()=>{if(typeof window==='undefined')return;let target=window.scrollY;let current=window.scrollY;let ticking=false;const ease=0.14;const clamp=(value)=>Math.max(0,Math.min(document.documentElement.scrollHeight-window.innerHeight,value));const animate=()=>{current += (target-current)*ease;window.scrollTo(0,current);if(Math.abs(target-current) > 0.5){requestAnimationFrame(animate);} else {current = target; window.scrollTo(0,current); ticking=false;}};window.addEventListener('wheel', function(e){if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey) return; if(!e.deltaY) return; e.preventDefault(); target = clamp(target + e.deltaY); if(!ticking){ticking=true; requestAnimationFrame(animate);} }, {passive:false});window.addEventListener('scroll', function(){ if(!ticking){ target = window.scrollY; current = window.scrollY; } }, {passive:true});window.addEventListener('resize', function(){ target = clamp(target); current = clamp(current); });})();`}
        </Script>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AntiInspectGuard />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
