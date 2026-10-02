"use client";

import type { FeedbackReport, PracticeSetup, SessionData } from "./types";

const SESSION_KEY = "unramble:session:v1";
const REPORT_KEY = "unramble:report:v1";
const SETUP_KEY = "unramble:setup:v1";

export function saveSession(session: SessionData): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): SessionData | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function saveReport(report: FeedbackReport): void {
  localStorage.setItem(REPORT_KEY, JSON.stringify(report));
}

export function loadReport(): FeedbackReport | null {
  const raw = localStorage.getItem(REPORT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FeedbackReport;
  } catch {
    return null;
  }
}

export function saveSetup(setup: PracticeSetup): void {
  localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
}

export function loadSetup(): PracticeSetup | null {
  const raw = localStorage.getItem(SETUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PracticeSetup;
  } catch {
    return null;
  }
}
