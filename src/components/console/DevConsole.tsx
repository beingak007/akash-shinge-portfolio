import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { consoleFiles } from "../../data/console.ts";
import type { ConsoleFile } from "../../data/console.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { haptic } from "../../utils/haptics.ts";
import { highlight } from "../../utils/highlight.ts";
import type { HighlightLanguage, HighlightedLine } from "../../utils/highlight.ts";
import "./DevConsole.css";

const BADGES: Record<HighlightLanguage, string> = {
  java: "J",
  tsx: "TSX",
  sql: "SQL",
  text: "MD",
};

/** Line reveal: ~15ms apart, the whole file in at most ~0.5s. */
const LINE_DURATION = 0.24;
const LINE_STAGGER = 0.015;
const MAX_SPREAD = 0.26;
const COPIED_MS = 1600;

interface FileView {
  file: ConsoleFile;
  index: number;
  lines: HighlightedLine[];
}

interface FileGroup {
  dir: string;
  entries: FileView[];
}

// The snippets are static, so tokenise them once.
const views: FileView[] = consoleFiles.map((file, index) => ({
  file,
  index,
  lines: highlight(file.code, file.language),
}));

// Explorer folders, in order of first appearance.
const groups: FileGroup[] = [];
for (const view of views) {
  const group = groups.find((item) => item.dir === view.file.dir);
  if (group) {
    group.entries.push(view);
  } else {
    groups.push({ dir: view.file.dir, entries: [view] });
  }
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function CopyIcon() {
  return (
    <svg className="console__copy-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="5.5" y="5.5" width="8" height="8" />
      <path d="M10.5 3.5v-1h-8v8h1" />
    </svg>
  );
}

export function DevConsole() {
  const root = useRef<HTMLElement>(null);
  const tablist = useRef<HTMLDivElement>(null);
  // Becomes true once the first scroll reveal has played or the visitor has
  // switched files; from then on a switch animates immediately.
  const revealed = useRef(false);
  const reduced = useReducedMotion();
  const uid = useId();
  const [active, setActive] = useState(0);
  // A fresh object per copy, so copying again restarts the "Copied" timer.
  const [copied, setCopied] = useState<{ file: ConsoleFile } | null>(null);

  const file = consoleFiles[active] ?? consoleFiles[0];
  const tabId = (item: ConsoleFile) => `${uid}-tab-${item.id}`;
  const panelId = (item: ConsoleFile) => `${uid}-panel-${item.id}`;
  const noteId = (item: ConsoleFile) => `${uid}-note-${item.id}`;
  const titleId = `${uid}-title`;

  useGSAP(
    () => {
      const section = root.current;
      if (!section || reduced) {
        return;
      }
      const panel = section.querySelector<HTMLElement>(
        `[data-console-panel="${String(active)}"]`,
      );
      const lines = panel?.querySelectorAll<HTMLElement>("[data-line]");
      if (!panel || !lines || lines.length === 0) {
        return;
      }

      const first = !revealed.current;
      gsap.from(lines, {
        opacity: 0,
        y: 6,
        duration: LINE_DURATION,
        ease: "power2.out",
        stagger: Math.min(LINE_STAGGER, MAX_SPREAD / Math.max(1, lines.length - 1)),
        clearProps: "opacity,transform",
        ...(first
          ? {
              scrollTrigger: {
                trigger: panel,
                start: "top 82%",
                once: true,
                onEnter: () => {
                  revealed.current = true;
                },
              },
            }
          : {}),
      });

      if (first) {
        return;
      }
      const note = section.querySelector<HTMLElement>(`[data-note="${String(active)}"]`);
      if (note) {
        gsap.from(note, {
          opacity: 0,
          y: 8,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "opacity,transform",
        });
      }
    },
    { scope: root, dependencies: [active, reduced], revertOnUpdate: true },
  );

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => {
      setCopied(null);
    }, COPIED_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  /** Scroll the tab strip sideways (never the page) so a tab is in view. */
  const revealTab = (index: number, focus: boolean) => {
    const list = tablist.current;
    const tab = list?.querySelector<HTMLElement>(`[data-tab-index="${String(index)}"]`);
    if (!list || !tab) {
      return;
    }
    if (focus) {
      tab.focus({ preventScroll: true });
    }
    const start = tab.offsetLeft;
    const end = start + tab.offsetWidth;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (start < list.scrollLeft) {
      list.scrollTo({ left: start, behavior });
    } else if (end > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: end - list.clientWidth, behavior });
    }
  };

  const select = (index: number, focus = false) => {
    revealed.current = true;
    setActive(index);
    revealTab(index, focus);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = consoleFiles.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, true);
  };

  const copy = async (item: ConsoleFile) => {
    try {
      await navigator.clipboard.writeText(item.code);
    } catch {
      // Clipboard unavailable or permission denied: stay quiet.
      return;
    }
    haptic("success");
    setCopied({ file: item });
  };

  const lineCount = file.code.split("\n").length;

  return (
    <section ref={root} className="section console" id="code" aria-labelledby={titleId}>
      <div className="section__head">
        <p className="kicker">DEVELOPER CONSOLE</p>
        <p className="kicker">ILLUSTRATIVE · NOT CLIENT CODE</p>
      </div>

      <div className="console__intro">
        <h2 id={titleId} className="display console__title" data-split>
          How the code is <em>shaped.</em>
        </h2>
        <p className="lede console__lede" data-reveal>
          Six small files written for this page, not lifted from any employer or client codebase.
          Together they trace one feature end to end: a thin use-case, a transactional Spring Boot
          slice, an honest UI, idempotent Kafka consumers, query-first storage, and the event flow
          that ties them together.
        </p>
      </div>

      <div className="console__layout">
        <div className="console__window" data-reveal>
          <div className="console__bar">
            <span className="console__dots" aria-hidden="true">
              <span className="console__dot" />
              <span className="console__dot" />
              <span className="console__dot" />
            </span>
            <p className="console__bar-title">
              order-platform — {file.dir}/{file.filename}
            </p>
            <span className="console__bar-tag">read-only</span>
          </div>

          <div className="console__body">
            <nav className="console__tree" aria-label="Explorer">
              <p className="console__tree-head" aria-hidden="true">
                EXPLORER
              </p>
              <p className="console__tree-root">order-platform</p>
              <ul className="console__tree-list">
                {groups.map((group) => (
                  <li key={group.dir}>
                    <span className="console__dir">{group.dir}</span>
                    <ul className="console__tree-list">
                      {group.entries.map((entry) => (
                        <li key={entry.file.id}>
                          <button
                            type="button"
                            className="console__file"
                            title={`${entry.file.dir}/${entry.file.filename}`}
                            data-lang={entry.file.language}
                            aria-current={entry.index === active ? "true" : undefined}
                            onClick={() => {
                              select(entry.index);
                            }}
                          >
                            <span className="console__badge" aria-hidden="true">
                              {BADGES[entry.file.language]}
                            </span>
                            <span className="console__file-name">{entry.file.filename}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="console__main">
              <div
                ref={tablist}
                className="console__tabs"
                role="tablist"
                aria-label="Source files"
              >
                {views.map(({ file: item, index }) => {
                  const selected = index === active;
                  return (
                    <button
                      key={item.id}
                      id={tabId(item)}
                      type="button"
                      role="tab"
                      className="console__tab"
                      aria-selected={selected}
                      aria-controls={panelId(item)}
                      tabIndex={selected ? 0 : -1}
                      data-lang={item.language}
                      data-tab-index={index}
                      onClick={() => {
                        select(index);
                      }}
                      onKeyDown={(event) => {
                        onTabKeyDown(event, index);
                      }}
                    >
                      <span className="console__badge" aria-hidden="true">
                        {BADGES[item.language]}
                      </span>
                      {item.filename}
                    </button>
                  );
                })}
              </div>

              {views.map(({ file: item, index, lines }) => {
                const isCopied = copied?.file.id === item.id;
                return (
                  <div
                    key={item.id}
                    id={panelId(item)}
                    role="tabpanel"
                    className="console__panel"
                    aria-labelledby={tabId(item)}
                    aria-describedby={noteId(item)}
                    hidden={index !== active}
                    data-console-panel={index}
                  >
                    <div className="console__toolbar">
                      <p className="console__crumbs">
                        {["order-platform", ...item.dir.split("/"), item.filename].map(
                          (part, at, parts) => (
                            <span key={`${part}-${String(at)}`}>
                              {part}
                              {at < parts.length - 1 ? (
                                <span className="console__crumb-sep" aria-hidden="true">
                                  {" › "}
                                </span>
                              ) : null}
                            </span>
                          ),
                        )}
                      </p>
                      <button
                        type="button"
                        className={`console__copy${isCopied ? " is-copied" : ""}`}
                        onClick={() => {
                          void copy(item);
                        }}
                      >
                        <CopyIcon />
                        <span>{isCopied ? "Copied ✓" : "Copy"}</span>
                        <span className="sr-only"> {item.filename}</span>
                      </button>
                    </div>

                    <pre
                      className="console__code"
                      role="region"
                      aria-label={`${item.filename} source, ${String(lines.length)} lines`}
                      tabIndex={0}
                      data-lang={item.language}
                      data-lenis-prevent
                    >
                      <code>
                        {lines.map((tokens, row) => (
                          <span key={row} className="console__line" data-line>
                            <span className="console__ln" aria-hidden="true">
                              {row + 1}
                            </span>
                            <span className="console__src">
                              {tokens.length === 0
                                ? " "
                                : tokens.map((token, at) => (
                                    <span key={at} className={`syn-${token.kind}`}>
                                      {token.text}
                                    </span>
                                  ))}
                            </span>
                          </span>
                        ))}
                      </code>
                    </pre>
                  </div>
                );
              })}

              <div className="console__status">
                <span className="console__status-group">
                  <span className="console__status-lang" data-lang={file.language}>
                    {file.languageLabel}
                  </span>
                  <span>{lineCount} lines</span>
                </span>
                <span className="console__status-group console__status-meta">
                  <span>UTF-8</span>
                  <span>LF</span>
                  <span>Spaces: 2</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="console__aside" aria-label="What the open file shows" data-reveal>
          <div className="console__aside-head">
            <p className="kicker">WHAT IT SHOWS</p>
            <p className="console__count">
              {pad(active + 1)} / {pad(consoleFiles.length)}
            </p>
          </div>
          <div className="console__notes">
            {consoleFiles.map((item, index) => {
              const current = index === active;
              return (
                <div
                  key={item.id}
                  id={noteId(item)}
                  className={`console__note${current ? " is-active" : ""}`}
                  aria-hidden={current ? undefined : true}
                  data-note={index}
                >
                  <h3 className="console__note-title">{item.title}</h3>
                  <p className="console__note-text">{item.note}</p>
                  <ul className="console__focus" aria-label="Things to notice">
                    {item.focus.map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="console__disclaimer">
            Illustrative snippets, written to show structure. Imports are omitted for brevity.
          </p>
        </aside>
      </div>

      <p className="sr-only" role="status">
        {copied ? `${copied.file.filename} copied to clipboard.` : ""}
      </p>
    </section>
  );
}
