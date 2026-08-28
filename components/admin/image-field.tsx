"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUploadUrl, discardUpload } from "@/app/(admin)/actions";
import { ACCEPTED_TYPES, formatBytes, prepareImage } from "@/lib/image";

/**
 * Choose a photograph, see what it will become, upload it.
 *
 * The sequence is: compress in this browser (`lib/image.ts`) → ask the server
 * for a one-shot upload URL → POST the compressed bytes straight to Convex →
 * keep the storage id in a hidden input for the form to save. The image never
 * travels through a server action, and a 4 MB camera JPEG is never uploaded at
 * all — the admin sends roughly 120 KB over their phone connection instead.
 *
 * Replacing a photograph before saving deletes the one just uploaded, so an
 * indecisive admin does not leave a trail of orphaned blobs in storage.
 *
 * Every failure here ends in a sentence naming something the admin can do
 * next. "Upload failed (413)" is a fact about HTTP; "your connection dropped,
 * try again" is a fact about their afternoon.
 */

type Status =
  | { phase: "idle" }
  | { phase: "working"; note: string }
  | { phase: "error"; note: string };

/** Turns whatever went wrong into something a shopkeeper can act on. */
function readable(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  // Our own messages are already written for this audience.
  if (raw.endsWith(".") && !raw.startsWith("NetworkError") && !raw.includes("fetch")) {
    return raw;
  }
  if (!navigator.onLine) {
    return "You appear to be offline. Reconnect and choose the photograph again.";
  }
  return "The upload did not go through — it is usually the connection. Try choosing the photograph again.";
}

export function ImageField({
  currentSrc,
  currentAlt,
}: {
  /** The photograph already on the piece, when editing. */
  currentSrc?: string;
  currentAlt?: string;
}) {
  const [storageId, setStorageId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ phase: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  // Object URLs are held by the document until revoked.
  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  function fail(note: string) {
    setStatus({ phase: "error", note });
    toast.error("The photograph was not added", { description: note });
  }

  async function onPick(file: File) {
    setStatus({ phase: "working", note: "Getting the photograph ready…" });

    let prepared;
    try {
      prepared = await prepareImage(file);
    } catch (error) {
      fail(readable(error));
      return;
    }

    setStatus({ phase: "working", note: "Uploading…" });
    try {
      const ticket = await createUploadUrl();
      if (!ticket.ok) {
        URL.revokeObjectURL(prepared.previewUrl);
        fail(ticket.error);
        return;
      }

      const response = await fetch(ticket.url, {
        method: "POST",
        headers: { "Content-Type": prepared.blob.type },
        body: prepared.blob,
      });
      if (!response.ok) {
        throw new Error(
          "The upload did not go through. Check your connection and choose the photograph again.",
        );
      }

      // A one-shot URL that has already been used answers with something that
      // is not JSON, and a bare parse error tells the admin nothing.
      let uploaded: string;
      try {
        ({ storageId: uploaded } = (await response.json()) as { storageId: string });
      } catch {
        throw new Error("The upload did not finish. Choose the photograph again.");
      }

      // Only now is the previous upload unreachable — drop it.
      if (storageId) void discardUpload(storageId);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);

      setStorageId(uploaded);
      setPreview(prepared.previewUrl);
      setSummary(`Ready · ${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.bytes)}`);
      setStatus({ phase: "idle" });
      toast.success("Photograph added", {
        description: "Fill in the rest and press Save.",
      });
    } catch (error) {
      URL.revokeObjectURL(prepared.previewUrl);
      fail(readable(error));
    }
  }

  const shown = preview ?? currentSrc ?? null;
  const busy = status.phase === "working";

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageStorageId" value={storageId} />

      <Label htmlFor="photograph">Photo</Label>

      <div className="flex items-start gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="size-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted transition hover:border-foreground/40 disabled:opacity-60"
          aria-label={shown ? "Change the photo" : "Choose a photo"}
        >
          {shown ? (
            // Not next/image: this is a blob URL that changes as the admin
            // picks, and optimising a 120 KB preview would buy nothing.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={preview ? "The photo you just chose" : (currentAlt ?? "")}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
              Tap to add a photo
            </span>
          )}
        </button>

        <div className="min-w-0 space-y-2">
          <input
            ref={inputRef}
            id="photograph"
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Reset so choosing the same file twice still fires.
              event.target.value = "";
              if (file) void onPick(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Working…" : shown ? "Change photo" : "Choose photo"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Any photo from your phone or computer. It is shrunk here, on your device, so it loads
            fast in the shop — you do not need to resize anything first.
          </p>

          <p
            role="status"
            aria-live="polite"
            className={`min-h-5 text-xs ${status.phase === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {status.phase === "idle" ? (summary ?? "") : status.note}
          </p>
        </div>
      </div>
    </div>
  );
}
