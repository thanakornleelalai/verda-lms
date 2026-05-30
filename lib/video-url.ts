// ─────────────────────────────────────────────────────────────────────────────
// Video URL helpers
//
// Instructors paste a raw YouTube or Google Drive link when authoring a video
// lesson. We normalise that link into a compact "stored token" kept in
// Lesson.videoAsset:
//   • YouTube       → "yt:<videoId>"
//   • Google Drive  → "gd:<fileId>"
//
// The LessonPlayer reads the same token back and renders the right embed.
// Pure functions only (no server/client coupling) so both the studio editor
// and the player can share them.
// ─────────────────────────────────────────────────────────────────────────────

export type VideoProvider = "youtube" | "drive";

export type ParsedVideo = {
  provider: VideoProvider;
  id: string;
  /** Compact form persisted in Lesson.videoAsset (e.g. "yt:dQw4w9WgXcQ"). */
  token: string;
};

const YOUTUBE_PATTERNS: RegExp[] = [
  /youtube\.com\/watch\?[^#]*\bv=([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/embed\/([\w-]{11})/,
  /youtube\.com\/shorts\/([\w-]{11})/,
  /youtube\.com\/live\/([\w-]{11})/,
];

const DRIVE_PATTERNS: RegExp[] = [
  /drive\.google\.com\/file\/d\/([\w-]+)/,
  /drive\.google\.com\/open\?[^#]*\bid=([\w-]+)/,
  /drive\.google\.com\/uc\?[^#]*\bid=([\w-]+)/,
  /docs\.google\.com\/[^/]+\/d\/([\w-]+)/,
];

/**
 * Parse a pasted URL (or an already-stored token) into a normalised video.
 * Returns null when the input is empty or unrecognised.
 */
export function parseVideoInput(input: string): ParsedVideo | null {
  const raw = input.trim();
  if (!raw) return null;

  // Already a stored token — accept as-is.
  if (/^yt:[\w-]{11}$/.test(raw)) return { provider: "youtube", id: raw.slice(3), token: raw };
  if (/^gd:[\w-]+$/.test(raw)) return { provider: "drive", id: raw.slice(3), token: raw };

  for (const re of YOUTUBE_PATTERNS) {
    const m = raw.match(re);
    if (m) return { provider: "youtube", id: m[1], token: `yt:${m[1]}` };
  }

  // Bare 11-char YouTube id pasted on its own.
  if (/^[\w-]{11}$/.test(raw)) return { provider: "youtube", id: raw, token: `yt:${raw}` };

  for (const re of DRIVE_PATTERNS) {
    const m = raw.match(re);
    if (m) return { provider: "drive", id: m[1], token: `gd:${m[1]}` };
  }

  return null;
}

/** Build the iframe `src` for a stored token. */
export function videoEmbedUrl(token: string | null | undefined): string | null {
  if (!token) return null;
  if (token.startsWith("yt:")) {
    return `https://www.youtube.com/embed/${token.slice(3)}?rel=0&modestbranding=1`;
  }
  if (token.startsWith("gd:")) {
    return `https://drive.google.com/file/d/${token.slice(3)}/preview`;
  }
  return null;
}

/** Human label for a provider — used in the editor UI. */
export function providerLabel(provider: VideoProvider): string {
  return provider === "youtube" ? "YouTube" : "Google Drive";
}
