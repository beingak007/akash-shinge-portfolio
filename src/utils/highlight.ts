/**
 * A tiny, dependency-free syntax highlighter for the developer console.
 *
 * It is a single left-to-right scanner, not a parser: good enough to colour
 * short, well-formed snippets, and built so it can never throw or loop. Block
 * comments and template literals may span lines; the token stream is split
 * into one array per source line at the end.
 *
 * Text mode is for diagrams: box-drawing runs are dimmed, arrows are lit, and
 * Markdown heading lines stand out. Everything else is plain.
 */
export type TokenKind =
  | "keyword"
  | "type"
  | "string"
  | "comment"
  | "fn"
  | "number"
  | "annotation"
  | "plain";

export type HighlightLanguage = "java" | "tsx" | "sql" | "text";

export interface Token {
  text: string;
  kind: TokenKind;
}

export type HighlightedLine = Token[];

interface Grammar {
  lineComments: readonly string[];
  blockComments: boolean;
  /** Quote characters that open a string. A backtick may span lines. */
  quotes: string;
  /** Java `"""` text blocks. */
  textBlocks: boolean;
  /** `@Name` annotations / decorators. */
  annotations: boolean;
  keywords: ReadonlySet<string>;
  builtinTypes: ReadonlySet<string>;
  caseInsensitive: boolean;
  /** PascalCase identifiers are types (Java / TS); SQL has no such rule. */
  pascalTypes: boolean;
  /** `name<T>(` counts as a call, and `<tag` / `</tag` names are types. */
  generics: boolean;
  jsx: boolean;
}

const JAVA_KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
  "class", "continue", "default", "do", "double", "else", "enum", "extends",
  "false", "final", "finally", "float", "for", "if", "implements", "import",
  "instanceof", "int", "interface", "long", "native", "new", "null", "package",
  "permits", "private", "protected", "public", "record", "return", "sealed",
  "short", "static", "super", "switch", "synchronized", "this", "throw",
  "throws", "transient", "true", "try", "var", "void", "volatile", "while",
  "yield",
]);

const JAVA_TYPES = new Set(["UUID", "URI", "URL"]);

const TSX_KEYWORDS = new Set([
  "as", "async", "await", "break", "case", "catch", "class", "const",
  "continue", "default", "delete", "do", "else", "enum", "export", "extends",
  "false", "finally", "for", "from", "function", "if", "implements", "import",
  "in", "instanceof", "interface", "keyof", "let", "new", "null", "of",
  "readonly", "return", "satisfies", "static", "super", "switch", "this",
  "throw", "true", "try", "type", "typeof", "undefined", "var", "void",
  "while", "yield",
]);

const TSX_TYPES = new Set([
  "any", "bigint", "boolean", "never", "number", "object", "string", "symbol",
  "unknown",
]);

const SQL_KEYWORDS = new Set([
  "ADD", "ALTER", "AND", "AS", "ASC", "AUTO_INCREMENT", "BY", "CASCADE",
  "CHARSET", "CHECK", "CLUSTERING", "COLLATE", "COMMENT", "CONSTRAINT",
  "CREATE", "CURRENT_TIMESTAMP", "DEFAULT", "DELETE", "DESC", "DISTINCT",
  "DROP", "ENGINE", "EXISTS", "FALSE", "FOREIGN", "FROM", "GROUP", "IF", "IN",
  "INDEX", "INSERT", "INTO", "IS", "JOIN", "KEY", "KEYSPACE", "LIKE", "LIMIT",
  "NOT", "NULL", "ON", "OR", "ORDER", "PRIMARY", "REFERENCES", "REPLICATION",
  "SELECT", "SET", "TABLE", "TRUE", "TTL", "UNIQUE", "UNSIGNED", "UPDATE",
  "USING", "VALUES", "WHERE", "WITH",
]);

const SQL_TYPES = new Set([
  "BIGINT", "BINARY", "BLOB", "BOOL", "BOOLEAN", "CHAR", "COUNTER", "DATE",
  "DATETIME", "DECIMAL", "DOUBLE", "ENUM", "FLOAT", "FROZEN", "INET", "INT",
  "INTEGER", "JSON", "LIST", "MAP", "NUMERIC", "SMALLINT", "TEXT", "TIME",
  "TIMESTAMP", "TIMEUUID", "TINYINT", "UUID", "VARBINARY", "VARCHAR",
]);

const GRAMMARS: Record<Exclude<HighlightLanguage, "text">, Grammar> = {
  java: {
    lineComments: ["//"],
    blockComments: true,
    quotes: "\"'",
    textBlocks: true,
    annotations: true,
    keywords: JAVA_KEYWORDS,
    builtinTypes: JAVA_TYPES,
    caseInsensitive: false,
    pascalTypes: true,
    generics: true,
    jsx: false,
  },
  tsx: {
    lineComments: ["//"],
    blockComments: true,
    quotes: "\"'`",
    textBlocks: false,
    annotations: true,
    keywords: TSX_KEYWORDS,
    builtinTypes: TSX_TYPES,
    caseInsensitive: false,
    pascalTypes: true,
    generics: true,
    jsx: true,
  },
  sql: {
    lineComments: ["--"],
    blockComments: true,
    quotes: "'\"",
    textBlocks: false,
    annotations: false,
    keywords: SQL_KEYWORDS,
    builtinTypes: SQL_TYPES,
    caseInsensitive: true,
    pascalTypes: false,
    generics: false,
    jsx: false,
  },
};

const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[\w$]/;
const DIGIT = /\d/;
const SPACE = /\s/;
const NUMBER =
  /0[xX][\da-fA-F_]+[lL]?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?[lLfFdDn]?/y;
/** `<Foo, Bar[]>(` right after a name: a generic call. */
const GENERIC_CALL = /<[\w$\s,.?[\]<>|"']*>\(/y;
/**
 * PascalCase, an acronym followed by a word (`URLParser`), or a single-letter
 * type parameter (`T`). `CREATED` and other constants stay plain.
 */
const PASCAL = /^(?:[A-Z]|(?:[A-Z][a-z\d]|[A-Z]{2,}[a-z])[\w$]*)$/;
/** Markdown headings, box-drawing runs, arrows. */
const TEXT_TOKENS = /(^[ \t]*#.*$)|([─-╿]+)|([←-⇿]+)/gm;

function readWhile(code: string, from: number, pattern: RegExp): number {
  let end = from;
  while (end < code.length && pattern.test(code.charAt(end))) {
    end += 1;
  }
  return end;
}

/** End index (exclusive) of a quoted string starting at `start`. */
function readString(code: string, start: number, quote: string): number {
  const multiline = quote === "`";
  let end = start + 1;
  while (end < code.length) {
    const ch = code.charAt(end);
    if (ch === "\\") {
      end += 2;
      continue;
    }
    if (ch === quote) {
      return end + 1;
    }
    if (ch === "\n" && !multiline) {
      return end;
    }
    end += 1;
  }
  return code.length;
}

function isCall(code: string, end: number, grammar: Grammar): boolean {
  if (code.charAt(end) === "(") {
    return true;
  }
  if (grammar.generics && code.charAt(end) === "<") {
    GENERIC_CALL.lastIndex = end;
    return GENERIC_CALL.test(code);
  }
  return false;
}

function classify(
  word: string,
  code: string,
  start: number,
  end: number,
  grammar: Grammar,
): TokenKind {
  const before = code.charAt(start - 1);
  const isMember = before === ".";
  const key = grammar.caseInsensitive ? word.toUpperCase() : word;

  if (!isMember && grammar.keywords.has(key)) {
    return "keyword";
  }
  if (!isMember && grammar.builtinTypes.has(key)) {
    return "type";
  }
  if (
    grammar.jsx &&
    (before === "<" || (before === "/" && code.charAt(start - 2) === "<"))
  ) {
    return "type";
  }
  if (grammar.pascalTypes && PASCAL.test(word)) {
    return "type";
  }
  if (isCall(code, end, grammar)) {
    return "fn";
  }
  return "plain";
}

function scanCode(code: string, grammar: Grammar): Token[] {
  const tokens: Token[] = [];
  const push = (from: number, to: number, kind: TokenKind) => {
    if (to > from) {
      tokens.push({ text: code.slice(from, to), kind });
    }
  };

  let i = 0;
  while (i < code.length) {
    const ch = code.charAt(i);
    let end = i + 1;
    let kind: TokenKind = "plain";

    const lineComment = grammar.lineComments.find((open) => code.startsWith(open, i));

    if (SPACE.test(ch)) {
      end = readWhile(code, i, SPACE);
    } else if (grammar.blockComments && code.startsWith("/*", i)) {
      const close = code.indexOf("*/", i + 2);
      end = close === -1 ? code.length : close + 2;
      kind = "comment";
    } else if (lineComment !== undefined) {
      const newline = code.indexOf("\n", i);
      end = newline === -1 ? code.length : newline;
      kind = "comment";
    } else if (grammar.textBlocks && code.startsWith("\"\"\"", i)) {
      const close = code.indexOf("\"\"\"", i + 3);
      end = close === -1 ? code.length : close + 3;
      kind = "string";
    } else if (grammar.quotes.includes(ch)) {
      end = readString(code, i, ch);
      kind = "string";
    } else if (grammar.annotations && ch === "@" && IDENT_START.test(code.charAt(i + 1))) {
      end = readWhile(code, i + 1, /[\w$.]/);
      kind = "annotation";
    } else if (DIGIT.test(ch)) {
      NUMBER.lastIndex = i;
      const match = NUMBER.exec(code);
      end = match ? i + match[0].length : i + 1;
      kind = "number";
    } else if (IDENT_START.test(ch)) {
      end = readWhile(code, i, IDENT_PART);
      kind = classify(code.slice(i, end), code, i, end, grammar);
    }

    // Every branch consumes at least one character, so the loop always ends.
    end = Math.max(end, i + 1);
    push(i, end, kind);
    i = end;
  }
  return tokens;
}

function scanText(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  TEXT_TOKENS.lastIndex = 0;
  for (let match = TEXT_TOKENS.exec(code); match; match = TEXT_TOKENS.exec(code)) {
    if (match[0].length === 0) {
      TEXT_TOKENS.lastIndex += 1;
      continue;
    }
    if (match.index > last) {
      tokens.push({ text: code.slice(last, match.index), kind: "plain" });
    }
    const kind: TokenKind = match[1] ? "keyword" : match[2] ? "comment" : "fn";
    tokens.push({ text: match[0], kind });
    last = match.index + match[0].length;
  }
  if (last < code.length) {
    tokens.push({ text: code.slice(last), kind: "plain" });
  }
  return tokens;
}

/** Split a token stream on newlines, merging neighbours of the same kind. */
function toLines(tokens: readonly Token[]): HighlightedLine[] {
  let current: HighlightedLine = [];
  const lines: HighlightedLine[] = [current];
  const append = (text: string, kind: TokenKind) => {
    const previous = current.at(-1);
    if (previous && previous.kind === kind) {
      previous.text += text;
    } else {
      current.push({ text, kind });
    }
  };

  for (const token of tokens) {
    const parts = token.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) {
        current = [];
        lines.push(current);
      }
      if (part) {
        append(part, token.kind);
      }
    });
  }
  return lines;
}

function plainLines(code: string): HighlightedLine[] {
  return code.split("\n").map((line) => (line ? [{ text: line, kind: "plain" }] : []));
}

/**
 * Highlight `code`, returning one token array per line (an empty array for a
 * blank line). Never throws: anything it cannot classify is `plain`, and an
 * unexpected failure falls back to uncoloured lines.
 */
export function highlight(code: string, language: HighlightLanguage): HighlightedLine[] {
  const source = typeof code === "string" ? code.replace(/\r\n?/g, "\n") : "";
  try {
    if (language === "text") {
      return toLines(scanText(source));
    }
    const grammar = GRAMMARS[language] as Grammar | undefined;
    return grammar ? toLines(scanCode(source, grammar)) : plainLines(source);
  } catch {
    return plainLines(source);
  }
}
