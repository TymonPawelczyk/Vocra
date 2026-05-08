import type { APIRoute } from "astro";
import { YoutubeTranscript } from "youtube-transcript";
import Anthropic from "@anthropic-ai/sdk";
import type { Cue, ProcessResponse, ProcessErrorResponse } from "@/lib/cues";
import { parseVideoId } from "@/lib/cues";

export const prerender = false;

interface ProcessRequest {
  videoID: string;
  lang: "pl" | "en";
}

const SUPPORTED_LANGS: ReadonlyArray<"pl" | "en"> = ["pl", "en"];

const TARGET_LANG_LABEL: Record<"pl" | "en", string> = {
  pl: "Polish",
  en: "English",
};

const SYSTEM_PROMPT = `You translate YouTube subtitle cues. You receive a JSON array of cues, each with a numeric "index" and a "text" string in the source language. Translate each cue's text into the target language while preserving meaning and natural flow.

Rules:
- Return exactly the same number of cues, in the same order, with the same "index" values.
- Keep proper nouns, code identifiers, brand names, and technical jargon untranslated when that's how a native speaker would write them.
- Do not add commentary, do not merge cues, do not split cues, do not insert empty cues.
- Match register: casual videos get casual translations, formal lectures stay formal.
- Output strictly conforms to the provided JSON schema.`;

function jsonError(code: ProcessErrorResponse["code"], message: string, status = 400) {
  const body: ProcessErrorResponse = { status: "error", code, message };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubTranslate(cues: Cue[], lang: "pl" | "en"): Cue[] {
  const tag = lang === "pl" ? "[PL DEMO]" : "[EN DEMO]";
  return cues.map((c) => ({ ...c, text: `${tag} ${c.source}` }));
}

function mockCues(): Cue[] {
  const lines = [
    "Welcome to this video.",
    "Today we're going to talk about something interesting.",
    "Pay close attention to the next part.",
    "This is where the key idea comes in.",
    "Notice how the pieces fit together here.",
    "Let's look at a concrete example.",
    "What you just saw is the core of the technique.",
    "Now let's see how it applies in practice.",
    "There are a few common pitfalls to avoid.",
    "First, don't skip the validation step.",
    "Second, always handle the error case explicitly.",
    "And third, keep your interfaces small.",
    "If you remember nothing else, remember this part.",
    "Thanks for watching, and see you in the next one.",
  ];
  const spacing = 5;
  return lines.map((line, i) => {
    const start = 4 + i * spacing;
    return { start, end: start + spacing - 0.3, text: line, source: line };
  });
}

async function fetchYoutubeCues(videoID: string): Promise<{ cues: Cue[]; sourceLang: string } | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoID);
    if (!transcript || transcript.length === 0) return null;

    const cues: Cue[] = transcript.map((t) => {
      const start = (t.offset ?? 0) / 1000;
      const duration = (t.duration ?? 2000) / 1000;
      const text = (t.text ?? "").replace(/\s+/g, " ").trim();
      return { start, end: start + duration, text, source: text };
    }).filter((c) => c.source.length > 0);

    const sourceLang = (transcript[0] as { lang?: string }).lang ?? "auto";
    return { cues, sourceLang };
  } catch {
    return null;
  }
}

async function translateWithHaiku(
  apiKey: string,
  cues: Cue[],
  lang: "pl" | "en",
  sourceLangHint: string,
): Promise<Cue[] | null> {
  const client = new Anthropic({ apiKey });
  const targetLabel = TARGET_LANG_LABEL[lang];

  const userPayload = {
    target_language: targetLabel,
    source_language_hint: sourceLangHint,
    cues: cues.map((c, i) => ({ index: i, text: c.source })),
  };

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 16000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              cues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "integer" },
                    text: { type: "string" },
                  },
                  required: ["index", "text"],
                  additionalProperties: false,
                },
              },
            },
            required: ["cues"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: `Translate these cues into ${targetLabel}. Input:\n\n${JSON.stringify(userPayload)}`,
        },
      ],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) return null;

    const parsed = JSON.parse(textBlock.text) as { cues: { index: number; text: string }[] };
    if (!parsed.cues || parsed.cues.length !== cues.length) return null;

    const byIndex = new Map(parsed.cues.map((c) => [c.index, c.text]));
    return cues.map((c, i) => ({ ...c, text: (byIndex.get(i) ?? c.source).trim() }));
  } catch (err) {
    console.error("[process] Haiku translation failed", err);
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  let body: ProcessRequest;
  try {
    body = (await request.json()) as ProcessRequest;
  } catch {
    return jsonError("invalid_video_id", "Invalid request body.");
  }

  const videoID = parseVideoId(body.videoID ?? "");
  if (!videoID) {
    return jsonError("invalid_video_id", "Invalid YouTube video ID.");
  }

  const lang = SUPPORTED_LANGS.includes(body.lang) ? body.lang : null;
  if (!lang) {
    return jsonError("unsupported_lang", "Supported languages: pl, en.");
  }

  const yt = await fetchYoutubeCues(videoID);

  let sourceCues: Cue[];
  let sourceLang: string;
  let captionSource: "youtube" | "mock";
  if (yt && yt.cues.length > 0) {
    sourceCues = yt.cues;
    sourceLang = yt.sourceLang;
    captionSource = "youtube";
  } else {
    sourceCues = mockCues();
    sourceLang = "en";
    captionSource = "mock";
  }

  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  let translated: Cue[] | null = null;
  let translator: "haiku" | "stub" = "stub";

  if (apiKey) {
    translated = await translateWithHaiku(apiKey, sourceCues, lang, sourceLang);
    if (translated) translator = "haiku";
  }

  if (!translated) {
    translated = stubTranslate(sourceCues, lang);
    translator = "stub";
  }

  const response: ProcessResponse = {
    status: "ready",
    videoID,
    lang,
    sourceLang,
    captionSource,
    translator,
    cues: translated,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
