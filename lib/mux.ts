import Mux from "@mux/mux-node";

let _mux: Mux | null = null;

function getMux(): Mux {
  if (!_mux) {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error("MUX_TOKEN_ID or MUX_TOKEN_SECRET is not set");
    }
    _mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    });
  }
  return _mux;
}

export async function createUploadUrl() {
  const mux = getMux();
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_BASE_URL ?? "*",
    new_asset_settings: {
      playback_policy: ["signed"],
      encoding_tier: "baseline",
    },
  });
  return { uploadId: upload.id, url: upload.url };
}

export function getSignedPlaybackUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
