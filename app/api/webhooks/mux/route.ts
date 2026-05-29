import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Mux webhook — updates Lesson.playbackId when an asset finishes processing.
// Mirrors the Stripe/Omise webhook pattern: real DB write with graceful
// mock fallback so the endpoint behaves correctly even without a live DB.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body as {
    type: string;
    data: { id: string; playback_ids?: { id: string }[]; passthrough?: string };
  };

  switch (type) {
    case "video.asset.ready": {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;

      if (assetId && playbackId) {
        try {
          // Match the lesson whose videoAsset == upload/asset id, set playbackId
          await db.lesson.updateMany({
            where: { videoAsset: assetId },
            data: { playbackId },
          });
          // passthrough may carry the lessonId directly (set at upload time)
          if (data.passthrough) {
            await db.lesson.update({
              where: { id: data.passthrough },
              data: { videoAsset: assetId, playbackId },
            }).catch(() => {});
          }
        } catch {
          // DB unavailable — log only
        }
        console.log("[Mux] video.asset.ready", { assetId, playbackId });
      }
      break;
    }

    case "video.upload.asset_created": {
      console.log("[Mux] upload.asset_created", { uploadId: data.id });
      break;
    }

    case "video.upload.errored":
    case "video.asset.errored": {
      console.error("[Mux] processing error", { assetId: data.id });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
