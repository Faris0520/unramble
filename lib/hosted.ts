// Set NEXT_PUBLIC_HOSTED_DEMO=true on a hosted preview deployment only.
// The real product runs on one laptop, where this stays unset.
export const HOSTED_DEMO = process.env.NEXT_PUBLIC_HOSTED_DEMO === "true";
