"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProduct, setArchived } from "@/app/(admin)/actions";

/**
 * Archive and delete, on one row.
 *
 * Archiving is the everyday move — the piece leaves the shop and every past
 * order stays readable. Deleting is the rare one: it takes the photograph out
 * of Convex storage with it, so it is confirmed first, and Convex refuses it
 * outright for anything that has ever been ordered.
 *
 * Both outcomes are toasted: the row itself changes little on an archive, and
 * a deleted row simply vanishes, so the toast is the only confirmation the
 * admin gets that the click did what they meant.
 */
export function ProductRowActions({
  productId,
  name,
  isArchived,
}: {
  productId: string;
  name: string;
  isArchived: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await setArchived(productId, !isArchived);
            } catch {
              toast.error(`${name} could not be ${isArchived ? "restored" : "archived"}`, {
                description: "Nothing changed. Try again in a moment.",
              });
              return;
            }
            router.refresh();
            toast.success(isArchived ? `${name} is back in the shop` : `${name} archived`, {
              description: isArchived
                ? "Shoppers can see it again."
                : "It has left the shop. Past orders still show it.",
            });
          })
        }
      >
        {isArchived ? "Restore" : "Archive"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-destructive"
        onClick={() => {
          if (
            !window.confirm(
              `Delete ${name} and its photograph for good? Archiving hides it from the shop and can be undone; this cannot.`,
            )
          ) {
            return;
          }
          start(async () => {
            const result = await deleteProduct(productId);
            if (result.ok) {
              router.refresh();
              toast.success(`${name} deleted`, {
                description: "The piece and its photograph are gone for good.",
              });
              return;
            }
            toast.error(`${name} could not be deleted`, {
              description: result.error ?? "That could not be deleted.",
              duration: 8000,
            });
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
