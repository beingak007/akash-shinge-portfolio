import { useState } from "react";
import { revealSections, watchActiveSections } from "./animations/scrollAnimations.ts";
import { ArchitecturePlayground } from "./components/architecture/ArchitecturePlayground.tsx";
import { CustomCursor } from "./components/cursor/CustomCursor.tsx";
import { Experience } from "./components/experience/Experience.tsx";
import { Footer } from "./components/footer/Footer.tsx";
import { Hero } from "./components/hero/Hero.tsx";
import { PageLoader } from "./components/loader/PageLoader.tsx";
import { FloatingNav } from "./components/navigation/FloatingNav.tsx";
import { SectionProgress } from "./components/progress/SectionProgress.tsx";
import { Work } from "./components/projects/Work.tsx";
import { About } from "./components/sections/About.tsx";
import { Code } from "./components/sections/Code.tsx";
import { Contact } from "./components/sections/Contact.tsx";
import { HowIThink } from "./components/sections/HowIThink.tsx";
import { Metrics } from "./components/sections/Metrics.tsx";
import { ProblemSet } from "./components/sections/ProblemSet.tsx";
import { StackMap } from "./components/sections/StackMap.tsx";
import { SmoothScroll } from "./components/system/SmoothScroll.tsx";
import { useReducedMotion } from "./hooks/useReducedMotion.ts";
import { useGSAP } from "./utils/gsap.ts";

const trackedIds = [
  "hero",
  "about",
  "expertise",
  "work",
  "experience",
  "think",
  "playground",
  "code",
  "problems",
  "metrics",
  "contact",
] as const;

const progressAlias: Record<string, string> = {
  hero: "hero",
  about: "hero",
  expertise: "expertise",
  work: "work",
  experience: "experience",
  think: "experience",
  playground: "playground",
  code: "playground",
  problems: "expertise",
  metrics: "contact",
  contact: "contact",
};

export default function App() {
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState("hero");

  useGSAP(
    () => {
      revealSections(document.body, reduced);
      watchActiveSections([...trackedIds], (id) => {
        if (id === "think" || id === "code") {
          setActiveId("experience");
          return;
        }
        if (id === "problems") {
          setActiveId("expertise");
          return;
        }
        if (id === "metrics") {
          setActiveId("contact");
          return;
        }
        setActiveId(id);
      });
    },
    { dependencies: [reduced] },
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SmoothScroll />
      <PageLoader />
      <CustomCursor />
      <div className="site-rail" aria-hidden="true">
        <span className="site-rail__mark">SYSTEM // HUMAN</span>
      </div>
      <div className="site-frame" aria-hidden="true">
        <span />
      </div>
      <FloatingNav activeId={activeId} />
      <SectionProgress activeId={progressAlias[activeId] ?? activeId} />
      <main id="main">
        <Hero />
        <About />
        <StackMap />
        <Work />
        <Experience />
        <HowIThink />
        <ArchitecturePlayground />
        <Code />
        <ProblemSet />
        <Metrics />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
