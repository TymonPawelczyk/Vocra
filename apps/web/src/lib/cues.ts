export interface Cue {
  start: number;
  end: number;
  text: string;
  source: string;
}

export interface ProcessResponse {
  status: "ready";
  videoID: string;
  lang: "pl" | "en";
  sourceLang: string;
  captionSource: "youtube" | "mock";
  translator: "haiku" | "stub";
  cues: Cue[];
}

export interface ProcessErrorResponse {
  status: "error";
  code:
    | "invalid_video_id"
    | "no_captions"
    | "translation_failed"
    | "unsupported_lang"
    | "unknown";
  message: string;
}

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function parseVideoId(input: string): string | null {
  const s = input.trim();
  if (VIDEO_ID_RE.test(s)) return s;
  try {
    const url = new URL(s);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\//, "");
      return VIDEO_ID_RE.test(id) ? id : null;
    }
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && VIDEO_ID_RE.test(v)) return v;
      const m = url.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}

export function findActiveCue(cues: Cue[], time: number): number {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = cues[mid];
    if (time < c.start) hi = mid - 1;
    else if (time >= c.end) lo = mid + 1;
    else return mid;
  }
  return -1;
}
