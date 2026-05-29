import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body as { type: string; data: { id: string; playback_ids?: { id: string }[] } };

  switch (type) {
    case "video.asset.ready": {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;
      // TODO: db.lesson.update({ where: { videoAsset: assetId }, data: { playbackId } })
      console.log("Mux asset ready", { assetId, playbackId });
      break;
    }
    case "video.upload.errored": {
      console.error("Mux upload error", data);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
