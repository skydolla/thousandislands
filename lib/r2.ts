import "server-only";
import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

let client: S3Client | null = null;
function r2(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

export function publicUrlFor(key: string): string {
  return `${env("R2_PUBLIC_URL").replace(/\/$/, "")}/${key}`;
}

/** A URL the client can PUT the file to directly. Content type and size are part of the signature. */
export function presignUpload(key: string, contentType: string, size: number): Promise<string> {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 300 }
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await r2().send(new HeadObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
    return true;
  } catch (err) {
    if ((err as { name?: string }).name === "NotFound") return false;
    throw err;
  }
}

/** Deletes files, logging rather than throwing: the database rows are already gone. */
export async function deleteObjects(keys: (string | null)[]): Promise<void> {
  const objects = keys.filter((k): k is string => !!k).map((Key) => ({ Key }));
  if (objects.length === 0) return;
  try {
    for (let i = 0; i < objects.length; i += 1000) {
      await r2().send(
        new DeleteObjectsCommand({
          Bucket: env("R2_BUCKET"),
          Delete: { Objects: objects.slice(i, i + 1000), Quiet: true },
        })
      );
    }
  } catch (err) {
    console.error("Failed to delete photo files from R2", keys, err);
  }
}
