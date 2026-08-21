"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, XIcon } from "lucide-react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const VISIT_KEY = "udk.visits.v1";
const DISMISS_KEY = "udk.install-dismissed.v1";

/**
 * Never on first paint. It shows from the second visit, animates in over the
 * content rather than above it, and remembers a dismissal.
 */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let visits = 1;
    try {
      visits = Number(window.localStorage.getItem(VISIT_KEY) ?? "0") + 1;
      window.localStorage.setItem(VISIT_KEY, String(visits));
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      return;
    }
    if (visits < 2) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !event) return null;

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="region"
      aria-label="Install this app"
      className="slide-up fixed inset-x-3 bottom-20 z-40 flex items-center gap-3 rounded-md border border-border bg-card p-4 shadow-elev2 lg:right-6 lg:bottom-6 lg:left-auto lg:w-96"
    >
      <DownloadIcon className="size-5 shrink-0 text-accent-ink" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-semibold">
        Add UDKING&rsquo;S to your home screen for faster ordering on data.
      </p>
      <button
        type="button"
        onClick={async () => {
          await event.prompt();
          await event.userChoice;
          dismiss();
        }}
        className="inline-flex h-11 shrink-0 items-center rounded-md bg-primary px-4 font-extrabold text-primary-foreground"
      >
        Add
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss the install prompt"
        className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-accent"
      >
        <XIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
