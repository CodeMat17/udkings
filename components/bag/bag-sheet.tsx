"use client";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { closeBag, openBag, useBag, useBagOpen } from "@/lib/bag";
import { BagContents } from "./bag-contents";

/** The slide-over bag. Mounted once per layout; opened from anywhere. */
export function BagSheet() {
  const open = useBagOpen();
  const { count, ready } = useBag();

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? openBag() : closeBag())}>
      <Dialog.Portal>
        <Dialog.Backdrop className="sheet-backdrop fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="sheet-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-background px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-elev2 outline-none sm:px-7">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Dialog.Title className="display text-2xl">
              Your bag
              {ready && count > 0 ? (
                <span className="ml-2 align-middle font-sans text-sm text-muted-foreground">
                  ({count})
                </span>
              ) : null}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close bag"
              className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-secondary"
            >
              <XIcon className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <BagContents variant="sheet" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
