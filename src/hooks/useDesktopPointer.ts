import { useMediaQuery } from "./useMediaQuery.ts";

export function useDesktopPointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1100px)");
}
