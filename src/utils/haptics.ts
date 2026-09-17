export function vibrateDevice(pattern: number | number[] = [28, 18, 36, 16, 22]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  try {
    navigator.vibrate(0);
    navigator.vibrate(pattern);
  } catch {
    // Some browsers expose vibrate() but reject the call.
  }
}
