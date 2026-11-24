import { BookOpen, ScrollText, Scale, Sparkles, Languages, Landmark, History, HeartHandshake, Library, type LucideIcon } from "lucide-react";

export const DISCIPLINE: Record<string, { icon: LucideIcon; from: string; to: string; tint: string; ink: string; ar: string }> = {
  coran: { icon: BookOpen, from: "#d7191f", to: "#7a0b10", tint: "#fff0ef", ink: "#c0151b", ar: "قرآن" },
  hadith: { icon: ScrollText, from: "#2b2330", to: "#0f0c12", tint: "#f1eff3", ink: "#2b2330", ar: "حديث" },
  fiqh: { icon: Scale, from: "#b45309", to: "#78350f", tint: "#fff5e6", ink: "#b45309", ar: "فقه" },
  aqida: { icon: Sparkles, from: "#0f766e", to: "#064e48", tint: "#e7f6f4", ink: "#0f766e", ar: "عقيدة" },
  "langue-arabe": { icon: Languages, from: "#1d4ed8", to: "#1e2f78", tint: "#eaf0ff", ink: "#1d4ed8", ar: "عربية" },
  sira: { icon: Landmark, from: "#9d174d", to: "#5b0d2c", tint: "#fdecf3", ink: "#9d174d", ar: "سيرة" },
  histoire: { icon: History, from: "#6d28d9", to: "#3b1679", tint: "#f2edfe", ink: "#6d28d9", ar: "تاريخ" },
  education: { icon: HeartHandshake, from: "#15803d", to: "#0b4a23", tint: "#e9f7ee", ink: "#15803d", ar: "أخلاق" },
  autres: { icon: Library, from: "#475569", to: "#1e293b", tint: "#eef1f5", ink: "#475569", ar: "علم" },
};
export const disc = (slug?: string | null) => DISCIPLINE[slug ?? ""] ?? DISCIPLINE.autres;
