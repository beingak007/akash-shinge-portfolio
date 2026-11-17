/**
 * Visual tactile feedback. Deliberately small: a sub-2px damped buzz on the
 * element that was pressed and a thin ripple at the pointer. Nothing moves the
 * page itself.
 */
export function buzz(element: Element): void {
  element.classList.remove("is-buzzing");
  // Force a reflow so the animation restarts on rapid repeat presses.
  void (element as HTMLElement).offsetWidth;
  element.classList.add("is-buzzing");
  element.addEventListener(
    "animationend",
    () => {
      element.classList.remove("is-buzzing");
    },
    { once: true },
  );
}

export function spawnTapRipple(x: number, y: number): void {
  const ring = document.createElement("span");
  ring.className = "tap-ripple";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);
  window.setTimeout(() => {
    ring.remove();
  }, 520);
}

/** Ripple confined to a media frame, positioned in the frame's own coordinates. */
export function spawnFrameRipple(frame: HTMLElement, clientX: number, clientY: number): void {
  const bounds = frame.getBoundingClientRect();
  const size = Math.max(bounds.width, bounds.height) * 1.4;
  const ring = document.createElement("span");
  ring.className = "fx-ripple";
  ring.style.width = `${size}px`;
  ring.style.height = `${size}px`;
  ring.style.left = `${clientX - bounds.left - size / 2}px`;
  ring.style.top = `${clientY - bounds.top - size / 2}px`;
  ring.setAttribute("aria-hidden", "true");
  frame.appendChild(ring);
  window.setTimeout(() => {
    ring.remove();
  }, 820);
}
