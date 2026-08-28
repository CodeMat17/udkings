"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/app/(admin)/actions";

/**
 * Remove a section.
 *
 * There is no archive here the way there is for a piece: an empty rail is
 * already invisible to shoppers in every way that matters, so the only reason
 * to reach for this is that the section should not exist at all. Convex
 * refuses while any piece is still in it — including archived ones — and that
 * refusal is a sentence worth reading, so it is toasted rather than swallowed.
 */
export function CategoryRowActions({
  slug,
  name,
  pieceCount,
}: {
  slug: string;
  name: string;
  pieceCount: number;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-destructive"
      onClick={() => {
        if (pieceCount > 0) {
          toast.error(`${name} still has pieces in it`, {
            description: `Move its ${pieceCount} ${pieceCount === 1 ? "piece" : "pieces"} to another section first, then remove it.`,
            duration: 8000,
          });
          return;
        }
        if (
          !window.confirm(
            `Remove ${name} and its photo for good? It disappears from the home page and from All categories. This cannot be undone.`,
          )
        ) {
          return;
        }
        start(async () => {
          const result = await deleteCategory(slug);
          if (result.ok) {
            router.refresh();
            toast.success(`${name} removed`, {
              description: "The section and its photo are gone for good.",
            });
            return;
          }
          toast.error(`${name} could not be removed`, {
            description: result.error ?? "That could not be removed.",
            duration: 8000,
          });
        });
      }}
    >
      Remove
    </Button>
  );
}
