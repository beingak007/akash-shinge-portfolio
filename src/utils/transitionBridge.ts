/**
 * Lets non-React code (scrollToSection) ask the PageTransition overlay to
 * cover the screen, run a jump, and uncover.
 */
export type TransitionRunner = (label: string, jump: () => void) => void;

let runner: TransitionRunner | null = null;

export function registerTransition(next: TransitionRunner | null): void {
  runner = next;
}

export function getTransition(): TransitionRunner | null {
  return runner;
}
