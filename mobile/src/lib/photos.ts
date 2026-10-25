import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import type { TripDetailIslandPicture } from "@shared/types";
import { apiFetch } from "./api";

/** Same limits as the web uploader: longest side 2048px, JPEG at 85%. */
const MAX_EDGE = 2048;
const QUALITY = 0.85;

/** Opens the photo library. Returns no assets if the user cancels. */
export async function pickPhotos(options?: { multiple?: boolean }): Promise<ImagePicker.ImagePickerAsset[]> {
  const multiple = options?.multiple ?? true;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsMultipleSelection: multiple,
    selectionLimit: multiple ? 30 : 1,
    exif: true,
    // Hands back JPEG instead of HEIC, so every photo can be resized the same way.
    preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  return result.canceled ? [] : result.assets;
}

/** Reads the GPS position the camera saved in a photo, if any. */
export function photoLocation(asset: ImagePicker.ImagePickerAsset): { latitude: number; longitude: number } | null {
  const exif = asset.exif;
  const lat = Number(exif?.GPSLatitude);
  const lon = Number(exif?.GPSLongitude);
  if (!exif || !Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) return null;
  return {
    latitude: exif.GPSLatitudeRef === "S" ? -lat : lat,
    longitude: exif.GPSLongitudeRef === "W" ? -lon : lon,
  };
}

/** When the photo was taken, as an ISO timestamp. Only used when the camera recorded its time zone. */
function photoTakenAt(asset: ImagePicker.ImagePickerAsset): string | null {
  const taken = asset.exif?.DateTimeOriginal as string | undefined; // "2024:06:01 14:03:22"
  const offset = asset.exif?.OffsetTimeOriginal as string | undefined; // "+02:00"
  const match = taken?.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (!match || !offset || !/^[+-]\d{2}:\d{2}$/.test(offset)) return null;
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}${offset}`;
}

/** Resizes a photo, uploads it to R2 and records it against one island of a trip. */
export async function uploadPhoto(
  tripIslandId: string,
  asset: ImagePicker.ImagePickerAsset
): Promise<TripDetailIslandPicture> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_EDGE) {
    context.resize(asset.width >= asset.height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }
  const rendered = await context.renderAsync();
  const resized = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY });
  const bytes = new Uint8Array(await new File(resized.uri).arrayBuffer());

  const { uploadUrl, storageKey } = await apiFetch<{ uploadUrl: string; storageKey: string }>("/api/uploads", {
    method: "POST",
    json: { tripIslandId, contentType: "image/jpeg", size: bytes.byteLength },
  });
  const put = await expoFetch(uploadUrl, {
    method: "PUT",
    body: bytes,
    headers: { "content-type": "image/jpeg" },
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);

  const { picture } = await apiFetch<{ picture: TripDetailIslandPicture }>("/api/pictures", {
    method: "POST",
    json: {
      tripIslandId,
      storageKey,
      width: resized.width,
      height: resized.height,
      caption: null,
      takenAt: photoTakenAt(asset),
    },
  });
  return picture;
}
