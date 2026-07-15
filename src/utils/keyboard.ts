import type { KeyboardEvent } from "react";

/** True when the event originated from an editable field. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]')
  );
}

/** Keep parent card / DnD keyboard handlers from swallowing text input keys. */
export function stopTypingKeyPropagation(e: KeyboardEvent) {
  e.stopPropagation();
}

/** Spread onto TextField / InputBase so spaces and paste work inside focusable cards. */
export const typingFieldKeyDownProps = {
  onKeyDown: stopTypingKeyPropagation,
} as const;
