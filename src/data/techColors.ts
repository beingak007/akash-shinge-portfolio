export const techColors = {
  java: "#f89820",
  "spring-boot": "#6db33f",
  spring: "#6db33f",
  rest: "#e8a04a",
  microservices: "#d4783a",
  react: "#61dafb",
  typescript: "#3178c6",
  javascript: "#f7df1e",
  html: "#e34f26",
  css: "#1572b6",
  mysql: "#00758f",
  redis: "#dc382d",
  cassandra: "#1287b1",
  scylla: "#53c1de",
  kafka: "#e04e39",
  docker: "#2496ed",
  k8s: "#326ce5",
  cicd: "#8b9cff",
  gitlab: "#fc6d26",
  distributed: "#d4783a",
  "system-design": "#c9a227",
  eda: "#c9a227",
} as const;

export function colorFor(id: string): string {
  return id in techColors ? techColors[id as keyof typeof techColors] : "#d4783a";
}

const lightMarks = new Set([
  "react",
  "scylla",
  "javascript",
  "java",
  "rest",
  "system-design",
  "eda",
]);

export function techInk(id: string): string {
  return lightMarks.has(id) ? "#111111" : "#ffffff";
}

export function contrastInk(hex: string): string {
  const n = hex.replace("#", "");
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 148 ? "#111111" : "#ffffff";
}
