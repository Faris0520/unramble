"use client";

import { useEffect, useRef, useState } from "react";
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
  const burgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  // Focus moves into the menu on open and returns to the trigger on close;
  // Tab is trapped across the menu links and the burger so keyboard users
  // cannot land on content hidden behind the overlay.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        burgerRef.current?.focus();
      }
      return;
    }
    wasOpen.current = true;
    const focusTimer = setTimeout(() => firstLinkRef.current?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const links = overlayRef.current?.querySelectorAll<HTMLElement>("a[href]");
      if (!links || links.length === 0) return;
      const order = [...Array.from(links), burgerRef.current].filter(
        (el): el is HTMLElement => el !== null,
      );
      const first = order[0];
      const last = order[order.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !order.includes(active as HTMLElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

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
          ref={burgerRef}
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
        ref={overlayRef}
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
              ref={i === 0 ? firstLinkRef : undefined}
              tabIndex={open ? 0 : -1}
              className={`rounded-md px-3 py-4 text-lg font-medium text-ink transition-[opacity,transform] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "translate-y-0 opacity-100 duration-500" : "translate-y-6 opacity-0 duration-300"
              }`}
              style={{ transitionDelay: `${open ? i * 60 : 0}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/setup"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className={`${buttonClasses("primary")} mt-4 self-start transition-[opacity,transform] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100 duration-500" : "translate-y-6 opacity-0 duration-300"
            }`}
            style={{ transitionDelay: `${open ? 260 : 0}ms` }}
          >
            Start a session
          </Link>
        </div>
      </div>
    </>
  );
}
