import { memo, useEffect, useState } from "react";
import {
  revealHeadings,
  revealMasks,
  revealSections,
  watchActiveSections,
} from "./animations/scrollAnimations.ts";
import { DevConsole } from "./components/console/DevConsole.tsx";
import { CursorParticles } from "./components/cursor/CursorParticles.tsx";
import { CustomCursor } from "./components/cursor/CustomCursor.tsx";
import { FarmKart } from "./components/farmkart/FarmKart.tsx";
import { Experience } from "./components/experience/Experience.tsx";
import { Footer } from "./components/footer/Footer.tsx";
import { Hero } from "./components/hero/Hero.tsx";
import { PageLoader } from "./components/loader/PageLoader.tsx";
import { FloatingNav } from "./components/navigation/FloatingNav.tsx";
import { SectionProgress } from "./components/progress/SectionProgress.tsx";
import { Work } from "./components/projects/Work.tsx";
import { About } from "./components/sections/About.tsx";
import { Capabilities } from "./components/sections/Capabilities.tsx";
import { Contact } from "./components/sections/Contact.tsx";
import { HowIThink } from "./components/sections/HowIThink.tsx";
import { Metrics } from "./components/sections/Metrics.tsx";
import { ProblemSet } from "./components/sections/ProblemSet.tsx";
import { StackMap } from "./components/sections/StackMap.tsx";
import { Ambient } from "./components/system/Ambient.tsx";
import { ClickFeedback } from "./components/system/ClickFeedback.tsx";
import { PageTransition } from "./components/system/PageTransition.tsx";
import { ScrollProgress } from "./components/system/ScrollProgress.tsx";
import { SmoothScroll } from "./components/system/SmoothScroll.tsx";
import { TerminalSection } from "./components/terminal/Terminal.tsx";
import { useReducedMotion } from "./hooks/useReducedMotion.ts";
import { useGSAP } from "./utils/gsap.ts";
import { followSystemTheme } from "./utils/theme.ts";

/** Page order. Experience precedes Projects, matching the nav. */
const trackedIds = [
  "hero",
  "about",
  "services",
  "expertise",
  "experience",
  "work",
  "farmkart",
  "think",
  "code",
  "terminal",
  "problems",
  "metrics",
  "contact",
] as const;

/** Sections without their own nav entry light up the nearest one (or none). */
const navAlias: Record<string, string> = {
  services: "about",
  farmkart: "work",
};

/** The progress rail always shows one of its six stops. */
const progressAlias: Record<string, string> = {
  services: "about",
  farmkart: "work",
  think: "work",
  code: "work",
  terminal: "work",
  problems: "work",
  metrics: "contact",
};

/**
 * The page content never depends on which section is active, so it is
 * memoized: scroll-driven section changes re-render only the nav, progress
 * rail, and ambient light — not every section on the page.
 */
const PageSections = memo(function PageSections() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Capabilities />
      <StackMap />
      <Experience />
      <Work />
      <FarmKart />
      <HowIThink />
      <DevConsole />
      <TerminalSection />
      <ProblemSet />
      <Metrics />
      <Contact />
    </main>
  );
});

export default function App() {
  const reduced = useReducedMotion();
  const [sectionId, setSectionId] = useState("hero");
  const activeId = navAlias[sectionId] ?? sectionId;

  useEffect(() => followSystemTheme(), []);

  useGSAP(
    () => {
      revealSections(document.body, reduced);
      revealHeadings(document.body, reduced);
      revealMasks(document.body, reduced);
      return watchActiveSections([...trackedIds], setSectionId);
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SmoothScroll />
      <ScrollProgress />
      <Ambient sectionId={sectionId} />
      <PageLoader />
      <PageTransition />
      <ClickFeedback />
      <CursorParticles />
      <CustomCursor />
      <div className="site-rail" aria-hidden="true">
        <span className="site-rail__mark">SYSTEM // HUMAN</span>
      </div>
      <div className="site-frame" aria-hidden="true">
        <span />
      </div>
      <FloatingNav activeId={activeId} />
      <SectionProgress activeId={progressAlias[sectionId] ?? sectionId} />
      <PageSections />
      <Footer />
    </>
  );
}
