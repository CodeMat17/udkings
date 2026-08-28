"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageField } from "@/components/admin/image-field";
import { useFormAction } from "@/components/admin/use-form-action";
import { saveCategory, type SaveCategoryResult } from "@/app/(admin)/actions";
import type { Category } from "@/lib/types";

/**
 * One form for adding a section of the shop and for editing one.
 *
 * It asks for two things, because two things are all anybody else can know:
 * the photograph on the card and the word on it. The web address, the search
 * listing and the "12 styles" line underneath are worked out — the first two
 * on the server, the last by counting. A rail used to carry a paragraph of
 * description as well; nobody could say what it was for, and it was the field
 * that went stale.
 *
 * Validation lives in the server action, as it does for products: the one copy
 * that cannot be skipped.
 */
export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState<SaveCategoryResult | null, FormData>(
    saveCategory,
    null,
  );

  const router = useRouter();

  // The field the server rejected, if it named one. Drives the focus and the
  // red outline; cleared as soon as the next save returns.
  const badField = state && !state.ok ? state.field : undefined;
  const { formRef, onSubmit } = useFormAction(action, state);

  // One save, one toast, however often React re-renders around it.
  const announced = useRef<SaveCategoryResult | null>(null);
  useEffect(() => {
    if (!state || announced.current === state) return;
    announced.current = state;

    if (state.ok) {
      toast.success(state.created ? `${state.name} is in the shop` : `${state.name} saved`, {
        description: state.created
          ? "It is on the home page and on All categories now."
          : "The shop is showing it.",
      });
      router.push("/admin/categories");
      return;
    }

    toast.error("That could not be saved", { description: state.error });
  }, [state, router]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-8 space-y-8">
      {category ? (
        <>
          {/* A published section keeps the web address shoppers already have. */}
          <input type="hidden" name="currentSlug" value={category.slug} />
          {/* Renaming rewrites the search listing; leaving the name alone keeps it. */}
          <input type="hidden" name="currentName" value={category.name} />
          <input type="hidden" name="currentSeoTitle" value={category.seoTitle} />
          <input type="hidden" name="currentSeoDescription" value={category.seoDescription} />
        </>
      ) : null}

      <ImageField currentSrc={category?.heroImage} currentAlt={category?.name} />

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          data-field="name"
          aria-invalid={badField === "name" || undefined}
          defaultValue={category?.name}
          placeholder="Jackets"
        />
        <p className="text-xs text-muted-foreground">
          The word on the card — Jeans, Tops, Jackets. The number of styles under it is counted for
          you.
        </p>
      </div>

      {category ? (
        <p className="text-xs text-muted-foreground">
          Web address: /category/{category.slug} — this stays the same even if you change the name,
          so links you have already shared keep working.
        </p>
      ) : null}

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
        {state && !state.ok ? state.error : ""}
      </p>

      <Button type="submit" disabled={pending} className="h-11 w-full sm:w-auto">
        {pending ? "Saving…" : category ? "Save changes" : "Add to the shop"}
      </Button>
    </form>
  );
}
