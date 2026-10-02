import type { Language } from "./types";

export function questionsSystemPrompt(language: Language): string {
  if (language === "id") {
    return [
      "Kamu melakukan interview kerja yang realistis.",
      "Tulis 7 pertanyaan interview untuk posisi pada deskripsi pekerjaan, disesuaikan dengan CV kandidat.",
      "Campurannya: 3 pertanyaan perilaku (pengalaman masa lalu), 2 situasional (cara menangani skenario), dan 2 pertanyaan spesifik ke skill peran ini.",
      "Setiap pertanyaan satu kalimat, maksimal 25 kata, dalam bahasa Indonesia.",
      "Tanpa penomoran, tanpa kalimat pembuka, tanpa komentar tambahan.",
    ].join(" ");
  }
  return [
    "You conduct real job interviews.",
    "Write 7 interview questions for the role in the job description, tuned to the candidate's CV.",
    "Mix: 3 behavioral questions (about past experience), 2 situational (how they would handle a scenario), and 2 specific to this role's hard skills.",
    "Each question is a single sentence of at most 25 words, in English.",
    "No numbering, no introduction, no extra commentary.",
  ].join(" ");
}

export function scoringSystemPrompt(language: Language): string {
  const common =
    "You are a candid but kind interview coach. You get one interview question and the candidate's spoken answer, already split into numbered sentences." +
    " Tag EVERY sentence with exactly one of: situation (context or background), task (the goal or problem they faced), action (what they themselves did), result (the outcome or impact), filler (filler words, hedging, repetition, stalled thinking), offtopic (does not answer the question)." +
    " Be honest: a sentence is only action if it describes something the candidate did." +
    " relevance and conciseness are integers from 0 to 10." +
    " tip: one concrete improvement for this specific answer, at most 30 words." +
    " model_answer: rewrite their answer as a tight, structured answer keeping their real facts. Never invent facts." +
    (language === "id"
      ? " Write tip and model_answer in Indonesian."
      : " Write tip and model_answer in English.");
  return common;
}
