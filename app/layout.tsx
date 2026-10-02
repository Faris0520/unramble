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
        {children}
      </body>
    </html>
  );
}
