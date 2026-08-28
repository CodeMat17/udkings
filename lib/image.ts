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
 * The result is at most `MAX_EDGE` on its long side and, in all but absurd
 * cases, under `MAX_BYTES`. Quality steps down until it fits; if the smallest
 * quality still will not fit, the image is scaled down and tried again.
 *
 * The admin is a shopkeeper, not a photo editor, so this never fails on a
 * photograph it managed to open: if every step is still too big it keeps the
 * smallest one and uploads that, and only a file above the hard ceiling in
 * `convex/admin.ts` is refused. "Crop it tighter and try again" was advice
 * nobody could act on.
 */

/** Keep in step with `MAX_IMAGE_BYTES` in `convex/admin.ts`. */
export const MAX_BYTES = 500 * 1024;

/** Long edge. Product photography renders at most 800 CSS px, so this covers 2×. */
export const MAX_EDGE = 1600;

const QUALITY_STEPS = [0.86, 0.78, 0.7, 0.62, 0.55, 0.45, 0.35];
const EDGE_STEPS = [MAX_EDGE, 1280, 1024, 800, 640];

/**
 * What the file picker offers. `image/*` is the one that matters: it is what
 * lets an iPhone hand over a photo at all, and iOS converts HEIC to JPEG on
 * the way out. The named types keep desktop pickers from listing PDFs.
 */
export const ACCEPTED_TYPES = [
  "image/*",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

/** What to send. WebP everywhere it encodes; JPEG is the honest fallback. */
const OUTPUT_TYPES = ["image/webp", "image/jpeg"] as const;

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

function encode(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Which output type this browser actually honours. `toBlob` is specified to
 * fall back to PNG when it does not know a format — and a PNG of a photograph
 * is *larger* than the original, so every size step would fail for a reason
 * that has nothing to do with the photograph. Ask once, up front, instead.
 */
async function pickOutputType(canvas: HTMLCanvasElement): Promise<string> {
  for (const type of OUTPUT_TYPES) {
    const probe = await encode(canvas, type, 0.8);
    if (probe && probe.type === type) return type;
  }
  return "image/jpeg";
}

/**
 * Decodes the file. `createImageBitmap` is fast and handles the common cases;
 * an `<img>` element handles what it will not, which on Safari includes HEIC
 * straight off the camera roll.
 */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    // Fall through to the element path.
  }

  const url = URL.createObjectURL(file);
  try {
    const element = new Image();
    element.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      element.onload = () => resolve();
      element.onerror = () => reject(new Error("decode failed"));
      element.src = url;
    });
    return await createImageBitmap(element);
  } catch {
    throw new Error(
      "This browser could not open that photograph. Open it in your Photos app, save or share it as a JPEG, and choose that instead.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  // Some phones report an empty type for a camera roll pick, so a missing type
  // is not on its own a reason to refuse the file.
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("That file is not a photograph.");
  }

  const bitmap = await decode(file);

  /** The smallest thing produced so far, kept in case nothing fits. */
  let smallest: { blob: Blob; width: number; height: number } | null = null;

  try {
    const probeCanvas = drawScaled(bitmap, EDGE_STEPS[0]);
    const outputType = await pickOutputType(probeCanvas.canvas);

    for (const edge of EDGE_STEPS) {
      const { canvas, width, height } = drawScaled(bitmap, edge);

      for (const quality of QUALITY_STEPS) {
        const blob = await encode(canvas, outputType, quality);
        if (!blob) continue;

        if (!smallest || blob.size < smallest.blob.size) {
          smallest = { blob, width, height };
        }
        if (blob.size <= MAX_BYTES) break;
      }

      if (smallest && smallest.blob.size <= MAX_BYTES) break;
    }
  } finally {
    bitmap.close();
  }

  if (!smallest) {
    throw new Error("This browser could not save that photograph. Try a JPEG or a PNG.");
  }

  return {
    blob: smallest.blob,
    previewUrl: URL.createObjectURL(smallest.blob),
    width: smallest.width,
    height: smallest.height,
    bytes: smallest.blob.size,
    originalBytes: file.size,
  };
}

/** "3.4 MB", "118 KB" — for telling the admin what their photograph became. */
export function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}
