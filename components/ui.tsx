import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "on-dark";

export function buttonClasses(variant: ButtonVariant = "primary"): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-[18px] py-[10px] text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40";
  const variants: Record<ButtonVariant, string> = {
    // The one purple action per screen (design.md: purple is a CTA signal, never decoration)
    primary: "bg-primary text-white hover:bg-primary-pressed active:bg-primary-deep",
    secondary: "border border-hairline-strong text-ink hover:bg-surface",
    dark: "bg-ink text-white hover:bg-charcoal",
    ghost: "text-slate hover:bg-surface hover:text-ink",
    // White focus ring: the global purple ring is invisible on navy surfaces
    "on-dark": "border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white",
  };
  return `${base} ${variants[variant]}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`${buttonClasses(variant)} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return <a className={`${buttonClasses(variant)} ${className}`} {...props} />;
}

export const TEXTAREA_CLASS =
  "w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2.5 text-base leading-relaxed text-ink placeholder:text-steel transition-[border-color,box-shadow,background-color] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none";

export function Field({
  label,
  htmlFor,
  helper,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-error">{error}</p>
      ) : helper ? (
        <p className="text-[13px] leading-snug text-steel">{helper}</p>
      ) : null}
    </div>
  );
}

// Wordmark as text per the no-invented-assets rule; the purple full stop is
// the recurring identity motif across every screen.
export function Wordmark({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span
      className={`text-lg font-semibold tracking-tight ${
        tone === "dark" ? "text-white" : "text-ink"
      }`}
    >
      unramble
      <span className={tone === "dark" ? "text-[#d6b6f6]" : "text-primary"}>.</span>
    </span>
  );
}
