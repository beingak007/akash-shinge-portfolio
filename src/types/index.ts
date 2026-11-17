export interface NavigationItem {
  id: string;
  index: string;
  label: string;
  href: string;
}

export interface ProgressSection {
  id: string;
  index: string;
  label: string;
}

export interface ProfileLinks {
  linkedin: string;
  leetcode: string;
  email: string | null;
  github: string | null;
  website: string | null;
}

export interface LeetCodeDifficulty {
  label: string;
  count: number;
}

export interface LeetCodeLanguage {
  name: string;
  count: number;
}

export interface LeetCodeTag {
  name: string;
  count: number;
}

export interface LeetCodeProfile {
  username: string;
  url: string;
  realName: string;
  accepted: number;
  difficulties: LeetCodeDifficulty[];
  languages: LeetCodeLanguage[];
  tags: LeetCodeTag[];
  school: string | null;
  photo: string;
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  /** Second half of the hero role line. */
  secondaryRole: string;
  headline: string;
  location: string;
  locationCountry: string;
  positioning: string;
  stackLine: string;
  photo: string;
  photoAlt: string;
  statement: string;
  links: ProfileLinks;
  seo: SeoMeta;
}

export interface SeoMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  canonicalUrl: string | null;
}

export interface HeroMetaItem {
  label: string;
  value: string;
}

export interface Experience {
  id: string;
  year: string;
  period: string;
  company: string;
  role: string;
  location: string;
  built: string;
  solved: string;
  /** Technologies named in `built` / `solved` — never anything the role did not use. */
  stack: string[];
  /**
   * Set when a date is known only approximately.
   * Update in src/data/experience.ts — do not invent dates.
   */
  dateNote?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
  kind: "github" | "live" | "case-study";
}

export interface ProjectFlowNode {
  id: string;
  label: string;
}

export interface ProjectCoverNode {
  id: string;
  label: string;
  /** Centre position in the 1600 × 1000 cover canvas. */
  x: number;
  y: number;
  /** Fixed width for wide nodes (a topic spine, a UI layer). */
  w?: number;
  hub?: boolean;
  /** Dashed, label-only annotation rather than a running component. */
  ghost?: boolean;
}

export interface ProjectCover {
  glow: { x: number; y: number };
  nodes: ProjectCoverNode[];
  edges: Array<[string, string]>;
}

export interface Project {
  id: string;
  index: string;
  name: string;
  /** One line for the gallery card. */
  summary: string;
  problem: string;
  /** The hard parts of the design problem — framed as challenges, not results. */
  challenges: string[];
  tech: string[];
  impact: string[];
  flow: ProjectFlowNode[];
  accent: string;
  cover: ProjectCover;
  /** Real screenshot path. When null, the generated system cover is shown. */
  image: string | null;
  links: ProjectLink[];
  /**
   * "study" = representative engineering problem, not a named client case.
   * Replace with shipped work in src/data/projects.ts when URLs exist.
   */
  kind: "study" | "shipped";
}

export type SkillCategory =
  | "BACKEND"
  | "FRONTEND"
  | "DATA"
  | "MESSAGING"
  | "DEVOPS"
  | "ARCHITECTURE";

export interface Technology {
  id: string;
  name: string;
  category: SkillCategory;
  x: number;
  y: number;
  related: string[];
  color: string;
}

export type CapabilityGlyph =
  | "backend"
  | "frontend"
  | "distributed"
  | "microservices"
  | "api"
  | "database"
  | "performance";

export interface Capability {
  id: string;
  index: string;
  title: string;
  body: string;
  tags: string[];
  glyph: CapabilityGlyph;
}

export interface ProfileStat {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  /** Short segments for the stat's mini visual (label + share of the whole). */
  segments: Array<{ label: string; value: number }>;
}

export interface Principle {
  id: string;
  index: string;
  title: string;
  body: string;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
}

export interface PlaygroundNode {
  id: string;
  label: string;
  x: number;
  y: number;
  description: string;
  color: string;
}

export interface PlaygroundEdge {
  id: string;
  from: string;
  to: string;
}

export type FarmKartLane =
  | "client"
  | "gateway"
  | "security"
  | "service"
  | "events"
  | "cache"
  | "data"
  | "infra"
  | "observe";

export type FarmKartEdgeKind = "sync" | "async" | "data" | "runtime";

export type FarmKartView =
  | "product"
  | "order"
  | "inventory"
  | "architecture"
  | "infra";

export interface FarmKartNode {
  id: string;
  label: string;
  lane: FarmKartLane;
  x: number;
  y: number;
  color: string;
  ink: string;
  responsibility: string;
  technology: string;
  dependencies: string[];
  communication: string;
}

export interface FarmKartEdge {
  id: string;
  from: string;
  to: string;
  kind: FarmKartEdgeKind;
}

export interface CodeLine {
  type: "code" | "comment" | "blank";
  text: string;
  token?: "keyword" | "type" | "fn" | "string" | "plain";
}

export interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  lines: CodeLine[];
  explanation: string;
}

export type CursorMode =
  | "default"
  | "hover"
  | "view"
  | "open"
  | "image"
  | "drag"
  | "magnetic";
