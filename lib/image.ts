/**
 * Photograph preparation, in the admin's browser, before anything is uploaded.
 *
 * A phone camera JPEG is 3–6 MB. Storing that would cost the shop money and
 * cost every visitor their LCP, and Convex storage serves the bytes as they
 * were given — there is no transform-on-read the way Cloudinary has. So the
 * compression has to happen somewhere, and the browser is the one place where
 * it costs nobody anything: no `sharp` in the server bundle, no upload of
 * megabytes that are about to be thrown away.
 *
 * The result is WebP, at most `MAX_EDGE` on its long side, and at most
 * `MAX_BYTES`. Quality steps down until it fits; if the smallest quality still
 * will not fit, the image is scaled down and tried again. Only if every step
 * fails does the admin get an error, and it tells them what to do.
 *
 * `convex/admin.ts` re-checks the size on the way in. This is the courtesy;
 * that is the rule.
 */

/** Keep in step with `MAX_IMAGE_BYTES` in `convex/admin.ts`. */
export const MAX_BYTES = 200 * 1024;

/** Long edge. Product photography renders at most 800 CSS px, so this covers 2×. */
export const MAX_EDGE = 1600;

const QUALITY_STEPS = [0.86, 0.78, 0.7, 0.62, 0.55, 0.45];
const EDGE_STEPS = [MAX_EDGE, 1280, 1024, 800];

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** What the browser hands back: the bytes to upload, and what to show meanwhile. */
export type PreparedImage = {
  blob: Blob;
  /** Object URL for the preview. The caller revokes it. */
  previewUrl: string;
  width: number;
  height: number;
  bytes: number;
  /** Bytes of the file the admin chose, for the "3.4 MB → 118 KB" line. */
  originalBytes: number;
};

function drawScaled(
  bitmap: ImageBitmap,
  edge: number,
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot process images.");
  context.imageSmoothingQuality = "high";
  // A white ground: a PNG with transparency becomes WebP on white rather than
  // on black, which is what a product cut-out is expected to look like.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);

  return { canvas, width, height };
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode that image."))),
      "image/webp",
      quality,
    );
  });
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That image could not be opened. Try a JPEG or PNG.");
  }

  try {
    for (const edge of EDGE_STEPS) {
      const { canvas, width, height } = drawScaled(bitmap, edge);

      for (const quality of QUALITY_STEPS) {
        const blob = await encode(canvas, quality);
        if (blob.size <= MAX_BYTES) {
          return {
            blob,
            previewUrl: URL.createObjectURL(blob),
            width,
            height,
            bytes: blob.size,
            originalBytes: file.size,
          };
        }
      }
    }
  } finally {
    bitmap.close();
  }

  throw new Error(
    `This photograph will not compress under ${Math.round(MAX_BYTES / 1024)} KB. Crop it tighter or use a plainer background, then try again.`,
  );
}

/** "3.4 MB", "118 KB" — for telling the admin what their photograph became. */
export function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}
