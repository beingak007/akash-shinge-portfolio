import { colorFor } from "../../data/techColors.ts";
import { techLogoPaths } from "../../data/techLogoPaths.ts";

interface TechLogoProps {
  id: string;
}

export function TechLogo({ id }: TechLogoProps) {
  const mark = techLogoPaths[id];
  const fill = colorFor(id);

  if (mark) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={mark.d} fill={fill} />
      </svg>
    );
  }

  if (id === "distributed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="2.3" fill={fill} />
        <circle cx="5" cy="18" r="2.3" fill={fill} />
        <circle cx="19" cy="18" r="2.3" fill={fill} />
        <path d="M12 7.2 6.4 16.2M12 7.2l5.6 9M7.2 18h9.6" stroke={fill} strokeWidth="1.6" />
      </svg>
    );
  }

  if (id === "git") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={fill} strokeWidth="1.7">
        <circle cx="7" cy="5.5" r="2.2" />
        <circle cx="7" cy="18.5" r="2.2" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M7 7.7v8.6M17 11.2c0 3.4-4.6 3.2-9 5.6" />
      </svg>
    );
  }

  if (id === "microservices") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={fill} strokeWidth="1.6">
        <path d="m12 2.8 3.4 2v3.9L12 10.7 8.6 8.7V4.8z" />
        <path d="m6.6 12.4 3.4 2v3.9l-3.4 2-3.4-2v-3.9z" />
        <path d="m17.4 12.4 3.4 2v3.9l-3.4 2-3.4-2v-3.9z" />
      </svg>
    );
  }

  if (id === "rest") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={fill} strokeWidth="1.7">
        <path d="M8 4.5c-2 0-2.6 1-2.6 2.6v2.4c0 1.2-.8 2.5-2.2 2.5 1.4 0 2.2 1.3 2.2 2.5v2.4c0 1.6.6 2.6 2.6 2.6M16 4.5c2 0 2.6 1 2.6 2.6v2.4c0 1.2.8 2.5 2.2 2.5-1.4 0-2.2 1.3-2.2 2.5v2.4c0 1.6-.6 2.6-2.6 2.6" />
        <path d="M9.4 12h5.2m-2-2 2 2-2 2" />
      </svg>
    );
  }

  if (id === "system-design" || id === "eda") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={fill} strokeWidth="1.6">
        <rect x="3.5" y="3.5" width="7" height="5" />
        <rect x="13.5" y="3.5" width="7" height="5" />
        <rect x="8.5" y="15.5" width="7" height="5" />
        <path d="M7 8.5v3.5h10V8.5M12 12v3.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" fill="none" stroke={fill} strokeWidth="1.7" />
      <path d="M5 12h3M16 12h3" stroke={fill} strokeWidth="1.7" />
    </svg>
  );
}
