import { put, del, list } from "@vercel/blob";

export async function uploadFile(
  filename: string,
  data: Blob | ArrayBuffer | ReadableStream,
  contentType: string
) {
  const blob = await put(filename, data, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return blob;
}

export async function deleteFile(url: string) {
  await del(url);
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}
