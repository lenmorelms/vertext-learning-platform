"use client";

import { useEffect } from "react";

/* Focuses the search field on Cmd+K or Ctrl+K. */
export function SearchShortcut({ targetId }: { targetId: string }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById(targetId)?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [targetId]);

  return null;
}
