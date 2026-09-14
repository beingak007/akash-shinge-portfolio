import type { NavigationItem, ProgressSection } from "../types/index.ts";

export const navigation: NavigationItem[] = [
  { id: "work", index: "01", label: "WORK", href: "#work" },
  { id: "experience", index: "02", label: "EXPERIENCE", href: "#experience" },
  { id: "expertise", index: "03", label: "STACK", href: "#expertise" },
  { id: "playground", index: "04", label: "ARCHITECTURE", href: "#playground" },
  { id: "about", index: "05", label: "ABOUT", href: "#about" },
  { id: "contact", index: "06", label: "CONTACT", href: "#contact" },
];

export const progressSections: ProgressSection[] = [
  { id: "hero", index: "01", label: "INTRO" },
  { id: "work", index: "02", label: "WORK" },
  { id: "experience", index: "03", label: "LOG" },
  { id: "expertise", index: "04", label: "STACK" },
  { id: "playground", index: "05", label: "ARCH" },
  { id: "contact", index: "06", label: "LINK" },
];
