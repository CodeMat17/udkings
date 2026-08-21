"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUploadUrl, discardUpload } from "@/app/(admin)/actions";
import { ACCEPTED_TYPES, MAX_BYTES, formatBytes, prepareImage } from "@/lib/image";

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
 */

type Status =
  | { phase: "idle" }
  | { phase: "working"; note: string }
  | { phase: "error"; note: string };

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

  async function onPick(file: File) {
    setStatus({ phase: "working", note: "Optimising the photograph…" });

    let prepared;
    try {
      prepared = await prepareImage(file);
    } catch (error) {
      const note = error instanceof Error ? error.message : "That image could not be used.";
      setStatus({ phase: "error", note });
      toast.error("That photograph could not be used", { description: note });
      return;
    }

    setStatus({ phase: "working", note: "Uploading…" });
    try {
      const url = await createUploadUrl();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": prepared.blob.type },
        body: prepared.blob,
      });
      if (!response.ok) throw new Error(`Upload failed (${response.status}).`);

      const { storageId: uploaded } = (await response.json()) as { storageId: string };

      // Only now is the previous upload unreachable — drop it.
      if (storageId) void discardUpload(storageId);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);

      setStorageId(uploaded);
      setPreview(prepared.previewUrl);
      setSummary(
        `${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.bytes)} · ${prepared.width}×${prepared.height} WebP`,
      );
      setStatus({ phase: "idle" });
      toast.success("Photograph uploaded", {
        description: `${formatBytes(prepared.originalBytes)} → ${formatBytes(prepared.bytes)}. Save the piece to keep it.`,
      });
    } catch (error) {
      URL.revokeObjectURL(prepared.previewUrl);
      const note = error instanceof Error ? error.message : "That upload did not go through.";
      setStatus({ phase: "error", note });
      toast.error("The photograph did not upload", { description: note });
    }
  }

  const shown = preview ?? currentSrc ?? null;
  const busy = status.phase === "working";

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageStorageId" value={storageId} />

      <Label htmlFor="photograph">Photograph</Label>

      <div className="flex items-start gap-4">
        <div className="size-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {shown ? (
            // Not next/image: this is a blob URL that changes as the admin
            // picks, and optimising a 120 KB preview would buy nothing.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={preview ? "The photograph you just chose" : (currentAlt ?? "")}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
              None yet
            </span>
          )}
        </div>

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
            {busy ? "Working…" : shown ? "Replace photograph" : "Choose photograph"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Any JPEG or PNG. It is resized and compressed here, in your browser, to
            under {Math.round(MAX_BYTES / 1024)} KB before it uploads.
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
