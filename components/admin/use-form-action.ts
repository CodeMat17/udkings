"use client";

import { startTransition, useCallback, useEffect, useRef } from "react";

/**
 * Submitting without losing what was typed, and landing on the box at fault.
 *
 * React resets an uncontrolled form once an action passed as `<form action>`
 * returns — which is right for a form that succeeded and wrong for one that was
 * rejected: the admin's fifteen filled-in boxes are wiped over one empty
 * required field. Calling the action ourselves from `onSubmit` skips that
 * reset, so a rejected save leaves the form exactly as it was.
 *
 * The other half is saying *which* box. The action names the field it rejected;
 * this scrolls it into view and puts the cursor in it, so the red sentence at
 * the bottom has somewhere to point.
 */
export function useFormAction(
  action: (form: FormData) => void,
  /**
   * The last result from the action. Depended on by identity rather than by
   * field name: rejecting the same box twice running is a new result object, so
   * the cursor moves back to it on the second try too.
   */
  result: { ok: boolean; field?: string } | null,
) {
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => action(data));
    },
    [action],
  );

  useEffect(() => {
    const field = result && !result.ok ? result.field : undefined;
    if (!field) return;

    // A <details> holding the field has just been told to open; wait a frame so
    // the box is laid out before scrolling to where it is.
    const frame = requestAnimationFrame(() => {
      const target = formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      if (!target) return;
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [result]);

  return { formRef, onSubmit };
}
