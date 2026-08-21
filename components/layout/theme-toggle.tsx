"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

const noopSubscribe = () => () => {};

/**
 * A two-state light/dark switch. A menu library here would put a popover engine
 * on every route for one control, so this stays a plain button.
 *
 * The button reserves its exact final size from first paint — this control is
 * the most common CLS source in this stack — and only the icon waits for mount.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} mode`
          : "Switch colour theme"
      }
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
    >
      <span className="grid size-5 place-items-center" aria-hidden="true">
        {mounted ? (
          isDark ? (
            <MoonIcon className="size-5" />
          ) : (
            <SunIcon className="size-5" />
          )
        ) : null}
      </span>
    </button>
  );
}
