"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { XIcon, ZoomInIcon } from "lucide-react";
import type { ProductImage } from "@/lib/types";

/**
 * One product, one photograph. There is no carousel and no second angle —
 * anything else a customer wants to see, they ask for on WhatsApp.
 */
export function Photo({ image, name }: { image: ProductImage; name: string }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div>
      <div className="relative aspect-[4/5] w-full bg-white">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          priority
          fetchPriority="high"
          className="object-cover"
        />
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`Zoom into ${image.alt}`}
          className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-background/90 text-foreground"
        >
          <ZoomInIcon className="size-5" aria-hidden="true" />
        </button>
      </div>

      <Dialog.Root open={zoomed} onOpenChange={setZoomed}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/85" />
          <Dialog.Popup className="fixed inset-0 z-50 grid place-items-center p-4">
            <Dialog.Title className="sr-only">{image.alt || name}</Dialog.Title>
            <div className="relative h-full w-full max-w-3xl">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
            <Dialog.Close
              aria-label="Close full-screen photograph"
              className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white text-black"
            >
              <XIcon className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
