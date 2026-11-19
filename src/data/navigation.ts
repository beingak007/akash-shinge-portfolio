import type { NavigationItem, ProgressSection } from "../types/index.ts";

/** Primary navigation, in page order. */
export const navigation: NavigationItem[] = [
  { id: "hero", index: "01", label: "HOME", href: "#hero" },
  { id: "about", index: "02", label: "ABOUT", href: "#about" },
  { id: "expertise", index: "03", label: "SKILLS", href: "#expertise" },
  { id: "experience", index: "04", label: "EXPERIENCE", href: "#experience" },
  { id: "work", index: "05", label: "PROJECTS", href: "#work" },
  { id: "contact", index: "06", label: "CONTACT", href: "#contact" },
];

export const progressSections: ProgressSection[] = [
  { id: "hero", index: "01", label: "HOME" },
  { id: "about", index: "02", label: "ABOUT" },
  { id: "expertise", index: "03", label: "SKILLS" },
  { id: "experience", index: "04", label: "LOG" },
  { id: "work", index: "05", label: "WORK" },
  { id: "contact", index: "06", label: "LINK" },
];
