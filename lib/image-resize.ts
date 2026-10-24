const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Shrinks a photo in the browser so the longest side is at most 2048px and re-encodes it as JPEG
 * (a few hundred KB instead of several MB), honoring the camera's EXIF rotation.
 */
export async function resizeImage(file: File): Promise<ResizedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `${file.name}: this browser can't read that image format. HEIC photos upload from Safari or the iOS app; elsewhere export them as JPEG first.`
    );
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob) throw new Error(`${file.name}: could not encode the image.`);
  return { blob, width, height };
}
