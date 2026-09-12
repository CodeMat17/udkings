"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { Maximize2Icon, XIcon } from "lucide-react";
import type { ProductImage } from "@/lib/types";

/** One product, one photograph — with a full-screen view for the detail. */
export function Photo({ image, name }: { image: ProductImage; name: string }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={`View ${name} full screen`}
        className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-md bg-secondary"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          preload
          className="object-cover"
        />
        <span className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-background/90 opacity-90 transition-opacity group-hover:opacity-100">
          <Maximize2Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </button>

      <Dialog.Root open={zoomed} onOpenChange={setZoomed}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fade-dialog fixed inset-0 z-50 bg-black/90" />
          <Dialog.Popup className="fade-dialog fixed inset-0 z-50 grid place-items-center p-4 outline-none">
            <Dialog.Title className="sr-only">{name}</Dialog.Title>
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
