import { progressSections } from "../../data/navigation.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import "./SectionProgress.css";

interface SectionProgressProps {
  activeId: string;
}

export function SectionProgress({ activeId }: SectionProgressProps) {
  const reduced = useReducedMotion();
  const active = progressSections.find((item) => item.id === activeId);
  const scan =
    progressSections.findIndex((item) => item.id === activeId) + 1;

  return (
    <aside className="progress" aria-label="Section status">
      <p className="progress__sys">SYS</p>
      <ol className="progress__list">
        {progressSections.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`progress__btn${activeId === item.id ? " is-active" : ""}`}
              onClick={() => {
                scrollToSection(item.id, reduced);
              }}
            >
              <span>{item.index}</span>
              <span className="progress__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="progress__scan">
        SCAN
        <span>{String(Math.max(scan, 1)).padStart(2, "0")}</span>
        {active ? active.label : "INTRO"}
      </p>
    </aside>
  );
}
