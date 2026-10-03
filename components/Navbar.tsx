"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark, buttonClasses } from "./ui";

const LINKS = [
  { href: "/#example", label: "Example" },
  { href: "/#local", label: "How it runs" },
  { href: "/session", label: "Session" },
  { href: "/feedback", label: "Report" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-md">
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6"
        >
          <Link href="/" aria-label="Unramble home">
            <Wordmark />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = l.href === pathname;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-sm px-3 py-1.5 text-sm transition-colors duration-150 ${
                    active ? "font-medium text-ink" : "text-slate hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link href="/setup" className={`${buttonClasses("primary")} ml-3`}>
              Start a session
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors duration-150 hover:bg-surface md:hidden"
          >
            <span
              aria-hidden
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              aria-hidden
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile menu lives outside the header: a backdrop-blurred ancestor would
          become the containing block for this fixed overlay and clip it. */}
      <div
        className={`fixed inset-0 z-30 bg-canvas/95 backdrop-blur-xl transition-[opacity] duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col gap-1 px-4 pt-24">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={`rounded-md px-3 py-4 text-lg font-medium text-ink transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/setup"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className={`${buttonClasses("primary")} mt-4 self-start transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "260ms" }}
          >
            Start a session
          </Link>
        </div>
      </div>
    </>
  );
}
