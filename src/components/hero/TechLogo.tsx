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

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" fill="none" stroke={fill} strokeWidth="1.7" />
      <path d="M5 12h3M16 12h3" stroke={fill} strokeWidth="1.7" />
    </svg>
  );
}
