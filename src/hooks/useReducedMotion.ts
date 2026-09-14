import { useMediaQuery } from "./useMediaQuery.ts";

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
