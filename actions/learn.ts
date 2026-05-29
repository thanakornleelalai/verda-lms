"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveNote(
  lessonId: string,
  content: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.note.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      create: { userId: session.user.id, lessonId, content },
      update: { content, updatedAt: new Date() },
    });
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function getNote(lessonId: string): Promise<{ content?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const note = await db.note.findUnique({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      select: { content: true },
    });
    return { content: note?.content ?? "" };
  } catch {
    return { content: "" };
  }
}

export async function getSignedPlaybackToken(
  lessonId: string
): Promise<{ token?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Requires MUX_TOKEN_ID + MUX_TOKEN_SECRET env vars and enrollment check
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    // Return null token — LessonPlayer falls back to unsigned public playbackId
    return { token: undefined };
  }

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { playbackId: true },
    });
    if (!lesson?.playbackId) return { error: "No playback ID" };

    // Signed JWT for Mux — real implementation when keys are available
    // const { signToken } = await import("@mux/mux-node");
    // const token = await signToken(lesson.playbackId, { type: "video", expiration: "2h" });
    return { token: undefined };
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function createThread(data: {
  courseId: string;
  lessonId?: string;
  title: string;
  body: string;
}): Promise<{ threadId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const thread = await db.thread.create({
      data: {
        courseId: data.courseId,
        lessonId: data.lessonId,
        title: data.title,
        body: data.body,
        userId: session.user.id,
      },
    });
    return { threadId: thread.id };
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function createPost(
  threadId: string,
  body: string
): Promise<{ postId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const post = await db.post.create({
      data: { threadId, body, userId: session.user.id },
    });
    return { postId: post.id };
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function votePost(
  postId: string,
  value: 1 | -1
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.postVote.upsert({
      where: { postId_userId: { postId, userId: session.user.id } },
      create: { postId, userId: session.user.id, value },
      update: { value },
    });
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}
