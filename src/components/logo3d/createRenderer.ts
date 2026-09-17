import { WebGLRenderer } from "three";

export function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    return new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    return null;
  }
}

export function releaseRenderer(renderer: WebGLRenderer): void {
  renderer.dispose();
}
