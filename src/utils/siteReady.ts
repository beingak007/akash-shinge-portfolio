/**
 * One-shot signal fired when the page loader starts lifting, so the hero
 * timeline plays in view instead of behind the loader.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markSiteReady(): void {
  if (ready) {
    return;
  }
  ready = true;
  listeners.forEach((listener) => {
    listener();
  });
  listeners.clear();
}

export function onSiteReady(listener: () => void): () => void {
  if (ready) {
    listener();
    return () => undefined;
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
