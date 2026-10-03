import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Unramble | Interview practice that never leaves your laptop",
  description:
    "A practice partner for real interviews. It listens to your spoken answer, scores the structure, and shows where you started rambling. Everything runs locally: Gemma 3 via Ollama, Whisper via transformers.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-canvas font-sans text-ink antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
