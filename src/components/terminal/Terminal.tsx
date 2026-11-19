import { useId, useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  bootLines,
  commands,
  completeCommand,
  echoLine,
  PROMPT_PATH,
  PROMPT_USER,
  resolveCommand,
  themeLines,
  WINDOW_TITLE,
} from "../../data/terminal.ts";
import type { TermLine, TermSegment } from "../../data/terminal.ts";
import { useReducedMotion } from "../../hooks/useReducedMotion.ts";
import { gsap, useGSAP } from "../../utils/gsap.ts";
import { haptic } from "../../utils/haptics.ts";
import { scrollToSection } from "../../utils/scrollToSection.ts";
import { toggleTheme } from "../../utils/theme.ts";
import "./Terminal.css";

/** Oldest lines drop off past this, so a long session cannot grow the DOM forever. */
const MAX_LINES = 200;
const MAX_HISTORY = 50;

interface OutputLine extends TermLine {
  id: number;
  /** Lines printed by one command share a batch, which animates in together. */
  batch: number;
}

const initialLines: OutputLine[] = bootLines.map((line, index) => ({ ...line, id: index, batch: 0 }));

function lineStyle(line: TermLine): CSSProperties | undefined {
  const vars: Record<string, string> = {};
  if (line.indent) {
    vars["--indent"] = String(line.indent);
  }
  if (line.labelWidth) {
    vars["--label"] = String(line.labelWidth);
  }
  return Object.keys(vars).length > 0 ? (vars as CSSProperties) : undefined;
}

function centerOf(element: HTMLElement | null): { x: number; y: number } | undefined {
  if (!element) {
    return undefined;
  }
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function Segment({ segment, reduced }: { segment: TermSegment; reduced: boolean }) {
  const className = `terminal__seg terminal__seg--${segment.tone ?? "ink"}`;
  const { href } = segment;

  if (!href) {
    return (
      <span className={className} aria-hidden={segment.decorative ? true : undefined}>
        {segment.text}
      </span>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a
        className={`${className} terminal__link`}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          scrollToSection(href.slice(1), reduced);
        }}
      >
        {segment.text}
      </a>
    );
  }

  const external = /^https?:\/\//.test(href);
  return (
    <a
      className={`${className} terminal__link`}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {segment.text}
    </a>
  );
}

function Line({ line, reduced }: { line: OutputLine; reduced: boolean }) {
  const segments = line.segments.map((segment, index) => (
    <Segment key={`${String(index)}-${segment.text}`} segment={segment} reduced={reduced} />
  ));
  const className = `terminal__line${line.label ? " terminal__line--row" : ""}${line.gap ? " is-gap" : ""}`;

  return (
    <div className={className} style={lineStyle(line)} data-batch={line.batch}>
      {line.label ? (
        <>
          <span className={`terminal__key terminal__seg--${line.labelTone ?? "type"}`}>{line.label}</span>
          <span className="terminal__val">{segments}</span>
        </>
      ) : (
        segments
      )}
    </div>
  );
}

export function TerminalSection() {
  const root = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  const [lines, setLines] = useState<OutputLine[]>(initialLines);
  const [value, setValue] = useState("");

  const nextId = useRef(initialLines.length);
  const nextBatch = useRef(1);
  const history = useRef<string[]>([]);
  /** Position while walking history with ↑/↓; null when not walking. */
  const historyIndex = useRef<number | null>(null);
  /** What was typed before walking history, restored by ↓ past the newest entry. */
  const draft = useRef("");

  const titleId = useId();
  const inputId = useId();
  const hintId = useId();
  const quickId = useId();

  const latestBatch = lines.at(-1)?.batch ?? -1;

  // Keep the newest output (and the prompt under it) in view.
  useLayoutEffect(() => {
    const scroller = body.current;
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [lines]);

  useGSAP(
    () => {
      if (reduced || latestBatch < 0 || !root.current) {
        return;
      }
      const fresh = root.current.querySelectorAll(`[data-batch="${String(latestBatch)}"]`);
      if (fresh.length === 0) {
        return;
      }
      if (latestBatch === 0) {
        // Boot lines print when the terminal first scrolls into view.
        gsap.from(fresh, {
          opacity: 0,
          y: 6,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: windowRef.current, start: "top 80%", once: true },
        });
        return;
      }
      gsap.from(fresh, { opacity: 0, y: 6, duration: 0.3, ease: "power2.out", stagger: 0.025 });
    },
    { scope: root, dependencies: [latestBatch, reduced], revertOnUpdate: true },
  );

  const print = (output: TermLine[], batch: number) => {
    const stamped = output.map((line) => ({ ...line, id: nextId.current++, batch }));
    setLines((previous) => [...previous, ...stamped].slice(-MAX_LINES));
  };

  const remember = (command: string) => {
    const list = history.current;
    if (list.at(-1) !== command) {
      list.push(command);
      if (list.length > MAX_HISTORY) {
        list.shift();
      }
    }
    historyIndex.current = null;
    draft.current = "";
  };

  const run = (raw: string, trigger: HTMLElement | null) => {
    const command = raw.trim();
    const batch = nextBatch.current++;
    const echo = echoLine(command);

    if (!command) {
      print([echo], batch);
      return;
    }

    haptic("tap");
    remember(command);

    const result = resolveCommand(command);
    switch (result.kind) {
      case "clear":
        setLines([]);
        return;
      case "theme":
        print([echo, ...themeLines(toggleTheme(centerOf(trigger)))], batch);
        return;
      case "output":
        print([echo, ...result.lines], batch);
        return;
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(value, input.current);
    setValue("");
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const list = history.current;

    if (event.key === "ArrowUp") {
      if (list.length === 0) {
        return;
      }
      event.preventDefault();
      if (historyIndex.current === null) {
        draft.current = value;
        historyIndex.current = list.length - 1;
      } else {
        historyIndex.current = Math.max(0, historyIndex.current - 1);
      }
      setValue(list[historyIndex.current] ?? "");
      return;
    }

    if (event.key === "ArrowDown") {
      if (historyIndex.current === null) {
        return;
      }
      event.preventDefault();
      const next = historyIndex.current + 1;
      if (next >= list.length) {
        historyIndex.current = null;
        setValue(draft.current);
      } else {
        historyIndex.current = next;
        setValue(list[next] ?? "");
      }
      return;
    }

    // Tab only completes; with nothing to complete it moves focus as usual,
    // so keyboard users are never trapped in the input.
    if (event.key === "Tab" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const completion = completeCommand(value);
      if (completion && completion !== value) {
        event.preventDefault();
        setValue(completion);
      }
    }
  };

  const focusInput = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a, button, input")) {
      return;
    }
    // Leave a text selection alone so output can be copied.
    if (window.getSelection()?.toString()) {
      return;
    }
    input.current?.focus({ preventScroll: true });
  };

  return (
    <section ref={root} className="section terminal" id="terminal" aria-labelledby={titleId}>
      <div className="section__head">
        <p className="kicker">INTERACTIVE TERMINAL</p>
        <p className="kicker">TYPE · TAP · RUN</p>
      </div>

      <div className="terminal__intro">
        <h2 id={titleId} className="display terminal__title" data-split>
          Ask the <em>system.</em>
        </h2>
        <p className="lede terminal__lede" data-reveal>
          Prefer a prompt to a page? Type <code>help</code> to see what this shell knows, or tap a
          command below.
        </p>
      </div>

      <div className="terminal__layout">
        <div ref={windowRef} className="terminal__window" onClick={focusInput}>
          <div className="terminal__bar">
            <span className="terminal__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <p className="terminal__name">{WINDOW_TITLE}</p>
          </div>

          <div ref={body} className="terminal__body" data-lenis-prevent>
            <div className="terminal__log" role="log" aria-live="polite" aria-label="Terminal output">
              {lines.map((line) => (
                <Line key={line.id} line={line} reduced={reduced} />
              ))}
            </div>

            <form className="terminal__prompt" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor={inputId}>
                Terminal command
              </label>
              <span className="terminal__ps1" aria-hidden="true">
                <span className="terminal__seg--string">{PROMPT_USER}</span>
                <span className="terminal__seg--type">{PROMPT_PATH}</span>
              </span>
              <span className={`terminal__field${value ? "" : " is-empty"}`}>
                <input
                  ref={input}
                  id={inputId}
                  className="terminal__input"
                  type="text"
                  value={value}
                  onChange={(event) => {
                    historyIndex.current = null;
                    setValue(event.target.value);
                  }}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  maxLength={64}
                  aria-describedby={hintId}
                />
                <span className="terminal__caret" aria-hidden="true" />
              </span>
            </form>
          </div>

          <p className="terminal__status" id={hintId}>
            Type help for commands. <kbd>↑</kbd> <kbd>↓</kbd> history · <kbd>tab</kbd> completes ·{" "}
            <kbd>enter</kbd> runs
          </p>
        </div>

        <div className="terminal__quick">
          <p className="terminal__quick-label" id={quickId}>
            Quick commands
          </p>
          <div className="terminal__chips" role="group" aria-labelledby={quickId}>
            {commands.map((command) => (
              <button
                key={command.name}
                type="button"
                className="chip terminal__chip"
                aria-label={`Run ${command.name}`}
                title={command.description}
                onClick={(event) => {
                  run(command.name, event.currentTarget);
                }}
              >
                {command.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
