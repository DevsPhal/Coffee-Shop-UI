"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Open/close state for a hand-built dropdown. The trigger toggles it; a press outside `rootRef` or Escape closes it.
 * Put `rootRef` on the element that wraps both the trigger and the menu, and give the trigger
 * `aria-expanded={isOpen}` so the shared `.dropdown_chevron` arrow turns with it.
 */
export function useDropdown<T extends HTMLElement = HTMLDivElement>({ closeOnOutsidePress = true } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    // mousedown rather than pointerdown: phones only send it after a real tap, so scrolling past doesn't close menus.
    const handlePressOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Close only the innermost menu: a drawer listening on window keeps its own Escape for the next press.
      event.stopPropagation();
      setIsOpen(false);
      rootRef.current?.querySelector<HTMLElement>("[aria-expanded]")?.focus();
    };

    if (closeOnOutsidePress) document.addEventListener("mousedown", handlePressOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePressOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnOutsidePress]);

  return {
    isOpen,
    rootRef,
    toggle: () => setIsOpen((open) => !open),
    close: () => setIsOpen(false),
  };
}
