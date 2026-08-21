"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInResult } from "../../actions";

/**
 * One field, one button. The error is announced, never colour-only, and says
 * the same thing for a wrong passcode as for a rate limit hit near the end —
 * the form is not an oracle.
 */
export function LoginForm() {
  const [state, action, pending] = useActionState<SignInResult | null, FormData>(
    signIn,
    null,
  );

  // One toast per attempt, keyed on the result's identity. A success never
  // lands here — the action redirects — so this only ever reports a refusal.
  const announced = useRef<SignInResult | null>(null);
  useEffect(() => {
    if (!state || announced.current === state) return;
    announced.current = state;
    toast.error("Not signed in", { description: state.error });
  }, [state]);

  return (
    <form action={action} className="mt-8 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          name="passcode"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-describedby={state?.error ? "passcode-error" : undefined}
          aria-invalid={state?.error ? true : undefined}
          className="h-11"
        />
      </div>

      <p
        id="passcode-error"
        role="alert"
        aria-live="polite"
        className="min-h-5 text-sm text-destructive"
      >
        {state?.error ?? ""}
      </p>

      <Button type="submit" disabled={pending} className="h-11 w-full">
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
