import type { Technology } from "../types/index.ts";
import type { Theme } from "../utils/theme.ts";
import { experiences } from "./experience.ts";
import { leetcode } from "./leetcode.ts";
import { profile } from "./profile.ts";
import { projects } from "./projects.ts";
import { strengths } from "./stats.ts";
import { coreSkillIds, skillCategories, technologies } from "./technologies.ts";

/**
 * The interactive terminal's commands and the output they print.
 *
 * Every fact printed here is read from the other data files — nothing is
 * typed in by hand, so the terminal cannot drift from the rest of the site.
 * Output is plain data (lines of coloured segments); the component decides
 * how to render and animate it, and performs the side effects (theme, clear).
 */

/** Colour roles inside the terminal; each maps to a --code-* / --syn-* token. */
export type TermTone =
  | "ink"
  | "dim"
  | "fn"
  | "keyword"
  | "type"
  | "string"
  | "number"
  | "annotation"
  | "error";

export interface TermSegment {
  text: string;
  tone?: TermTone;
  /** An external URL, a mailto:, or "#section-id" (scrolls within the page). */
  href?: string;
  /** Visual only (bullets, rules, the prompt) — hidden from assistive tech. */
  decorative?: boolean;
}

export interface TermLine {
  segments: TermSegment[];
  /** Key column; keys and values align so wrapped values stay indented. */
  label?: string;
  labelTone?: TermTone;
  /** Width of the key column, in character cells. */
  labelWidth?: number;
  /** Left inset, in character cells. */
  indent?: number;
  /** Extra breathing room above this line. */
  gap?: boolean;
}

export const PROMPT_USER = "akash@portfolio";
export const PROMPT_PATH = ":~$";
export const WINDOW_TITLE = `${PROMPT_USER} — zsh`;

export const commands = [
  { name: "help", description: "List the commands this shell knows." },
  { name: "about", description: "Name, role, location, and strengths." },
  { name: "skills", description: "Core skills, grouped by layer." },
  { name: "projects", description: "Projects: summary, stack, and links." },
  { name: "experience", description: "Roles, periods, and what was built." },
  { name: "contact", description: "Where to reach me." },
  { name: "theme", description: "Switch between light and dark." },
  { name: "clear", description: "Clear the screen." },
] as const;

export type CommandName = (typeof commands)[number]["name"];

export const commandNames: readonly CommandName[] = commands.map((command) => command.name);

export type CommandResult =
  | { kind: "output"; lines: TermLine[] }
  | { kind: "theme" }
  | { kind: "clear" };

/* ---------- line helpers ---------- */

function seg(text: string, tone?: TermTone): TermSegment {
  return { text, tone };
}

function deco(text: string, tone: TermTone = "dim"): TermSegment {
  return { text, tone, decorative: true };
}

function row(label: string, segments: TermSegment[], options: Omit<TermLine, "segments" | "label"> = {}): TermLine {
  return { label, segments, ...options };
}

function heading(text: string): TermLine {
  return { gap: true, segments: [deco("── "), seg(text, "keyword")] };
}

function bullet(text: string, indent = 2): TermLine {
  return { indent, segments: [deco("▸ ", "fn"), seg(text)] };
}

/** "→ open the About section", scrolling to the section with that id. */
function jump(id: string, name: string): TermLine {
  return {
    gap: true,
    segments: [deco("→ "), { text: `open the ${name} section`, href: `#${id}`, tone: "fn" }],
  };
}

function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^mailto:/, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

function link(url: string, text = displayUrl(url)): TermSegment {
  return { text, href: url, tone: "fn" };
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/* ---------- command output ---------- */

function helpLines(): TermLine[] {
  const width = Math.max(...commandNames.map((name) => name.length)) + 2;
  return [
    ...commands.map((command) =>
      row(command.name, [seg(command.description)], { labelTone: "fn", labelWidth: width }),
    ),
    {
      gap: true,
      segments: [
        seg("↑ ↓", "annotation"),
        seg(" history · "),
        seg("tab", "annotation"),
        seg(" completes · "),
        seg("enter", "annotation"),
        seg(" runs"),
      ],
    },
  ];
}

function aboutLines(): TermLine[] {
  const options = { labelWidth: 10 };
  return [
    row("name", [seg(profile.name, "fn")], options),
    row("role", [seg(`${profile.role} · ${profile.secondaryRole}`)], options),
    row("location", [seg(profile.location)], options),
    { gap: true, segments: [seg(profile.statement, "string")] },
    heading("strengths"),
    ...strengths.map((item) => bullet(item)),
    jump("about", "About"),
  ];
}

function skillsLines(): TermLine[] {
  const core = coreSkillIds
    .map((id) => technologies.find((tech) => tech.id === id))
    .filter((tech): tech is Technology => tech !== undefined);
  const groups = skillCategories
    .map((category) => ({
      category: category.toLowerCase(),
      names: core.filter((tech) => tech.category === category).map((tech) => tech.name),
    }))
    .filter((group) => group.names.length > 0);
  const width = Math.max(...groups.map((group) => group.category.length)) + 2;

  return [
    {
      segments: [
        seg(String(core.length), "number"),
        seg(" core skills · "),
        seg(String(technologies.length), "number"),
        seg(" technologies across "),
        seg(String(skillCategories.length), "number"),
        seg(" layers in the full map"),
      ],
    },
    ...groups.map((group, index) =>
      row(group.category, [seg(group.names.join(" · "), "string")], {
        labelWidth: width,
        gap: index === 0,
      }),
    ),
    jump("expertise", "Skills"),
  ];
}

function projectsLines(): TermLine[] {
  const studies = projects.filter((project) => project.kind === "study").length;
  const shipped = projects.length - studies;
  const counts = [
    shipped > 0 ? `${String(shipped)} shipped` : null,
    studies > 0 ? `${String(studies)} system ${studies === 1 ? "study" : "studies"}` : null,
  ].filter((part): part is string => part !== null);

  const lines: TermLine[] = [{ segments: [seg(counts.join(" · "), "keyword")] }];
  if (studies > 0) {
    lines.push({
      segments: [
        seg("system study", "annotation"),
        seg(" = a representative engineering problem, not a named client delivery."),
      ],
    });
  }

  projects.forEach((project) => {
    lines.push({
      gap: true,
      segments: [
        seg(project.index, "number"),
        seg("  "),
        seg(project.name, "fn"),
        ...(project.kind === "study" ? [seg("  [system study]", "annotation")] : []),
      ],
    });
    lines.push({ indent: 4, segments: [seg(project.summary)] });
    lines.push(row("stack", [seg(project.tech.join(" · "), "string")], { indent: 4, labelWidth: 7 }));
    if (project.links.length > 0) {
      const segments: TermSegment[] = [];
      project.links.forEach((item, index) => {
        if (index > 0) {
          segments.push(seg("  "));
        }
        segments.push(link(item.href, item.label.toLowerCase()));
        segments.push(deco(isExternal(item.href) ? " ↗" : " →", "fn"));
      });
      lines.push(row("link", segments, { indent: 4, labelWidth: 7 }));
    }
  });

  lines.push(jump("work", "Projects"));
  return lines;
}

function experienceLines(): TermLine[] {
  const lines: TermLine[] = [];
  experiences.forEach((item, index) => {
    lines.push({
      gap: index > 0,
      segments: [seg(item.role, "fn"), seg(" @ ", "dim"), seg(item.company, "type")],
    });
    const options = { indent: 2, labelWidth: 10 };
    lines.push(row("period", [seg(item.period, "number")], options));
    lines.push(row("location", [seg(item.location)], options));
    lines.push(row("built", [seg(item.built)], options));
    if (item.dateNote) {
      lines.push(row("note", [seg(item.dateNote)], options));
    }
  });
  lines.push(jump("experience", "Experience"));
  return lines;
}

function contactLines(): TermLine[] {
  const options = { labelWidth: 10 };
  const lines: TermLine[] = [row("linkedin", [link(profile.links.linkedin)], options)];
  if (profile.links.github) {
    lines.push(row("github", [link(profile.links.github)], options));
  }
  lines.push(row("leetcode", [link(leetcode.url)], options));
  if (profile.links.email) {
    lines.push(row("email", [link(`mailto:${profile.links.email}`, profile.links.email)], options));
  }
  lines.push(jump("contact", "Contact"));
  return lines;
}

/** Built once: the data is static for the life of the page. */
const outputs: Record<Exclude<CommandName, "theme" | "clear">, TermLine[]> = {
  help: helpLines(),
  about: aboutLines(),
  skills: skillsLines(),
  projects: projectsLines(),
  experience: experienceLines(),
  contact: contactLines(),
};

/* ---------- public API ---------- */

export const bootLines: TermLine[] = [
  { segments: [seg("Welcome to "), seg(PROMPT_USER, "fn"), seg(".")] },
  { segments: [seg(`${profile.name} · ${profile.role} · ${profile.location}`, "type")] },
  { segments: [seg("Type "), seg("help", "fn"), seg(" to begin.")] },
];

/** The line echoed back when a command is entered. */
export function echoLine(input: string): TermLine {
  return {
    gap: true,
    segments: [deco(PROMPT_USER, "string"), deco(`${PROMPT_PATH} `, "type"), seg(input)],
  };
}

export function themeLines(theme: Theme): TermLine[] {
  return [{ segments: [seg("Theme → "), seg(theme, "annotation")] }];
}

/** Case-insensitive; the first word picks the command, extra words are ignored. */
export function resolveCommand(input: string): CommandResult {
  const word = input.trim().split(/\s+/)[0] ?? "";
  const name = word.toLowerCase();
  switch (name) {
    case "theme":
      return { kind: "theme" };
    case "clear":
      return { kind: "clear" };
    case "help":
    case "about":
    case "skills":
    case "projects":
    case "experience":
    case "contact":
      return { kind: "output", lines: outputs[name] };
    default:
      return {
        kind: "output",
        lines: [
          {
            segments: [seg(`command not found: ${word}.`, "error"), seg(" Type "), seg("help", "fn"), seg(".")],
          },
        ],
      };
  }
}

/** The single command that starts with `partial`, or null when none or several do. */
export function completeCommand(partial: string): CommandName | null {
  const prefix = partial.trim().toLowerCase();
  if (!prefix || /\s/.test(prefix)) {
    return null;
  }
  const matches = commandNames.filter((name) => name.startsWith(prefix));
  return matches.length === 1 ? (matches[0] ?? null) : null;
}
