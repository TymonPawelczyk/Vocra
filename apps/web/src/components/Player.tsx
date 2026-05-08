import { useEffect, useRef, useState } from "react";
import type { Cue, ProcessResponse, ProcessErrorResponse } from "@/lib/cues";
import { findActiveCue } from "@/lib/cues";
import CueOverlay from "./CueOverlay";

interface Props {
  videoID: string;
  lang: "pl" | "en";
  uiLang: "pl" | "en";
}

type Status = "loading" | "ready" | "error";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const t = {
  pl: {
    preparing: "Przygotowuję tłumaczenie…",
    fetchingCaptions: "Pobieram napisy…",
    translating: "Tłumaczę napisy…",
    errorTitle: "Nie udało się wygenerować napisów",
    errorNoCaptions: "Ten film nie ma dostępnych napisów. Spróbuj inny.",
    errorGeneric: "Spróbuj ponownie lub wybierz inny film.",
    showSource: "Pokaż oryginał",
    hideSource: "Ukryj oryginał",
    stubBadge: "TRYB DEMO",
    mockBadge: "PRZYKŁADOWE NAPISY",
    stubNote: "Brak klucza API — pokazuję napisy w trybie demo.",
    mockNote: "Nie udało się pobrać prawdziwych napisów z YouTube. Pokazuję przykładowe napisy, żeby zademonstrować odtwarzacz.",
    sourceLang: "Źródło",
    targetLang: "Tłumaczenie",
  },
  en: {
    preparing: "Preparing translation…",
    fetchingCaptions: "Fetching captions…",
    translating: "Translating…",
    errorTitle: "Couldn't generate subtitles",
    errorNoCaptions: "This video has no available captions. Try another one.",
    errorGeneric: "Try again or pick a different video.",
    showSource: "Show original",
    hideSource: "Hide original",
    stubBadge: "DEMO MODE",
    mockBadge: "MOCK CAPTIONS",
    stubNote: "No API key set — showing demo subtitles.",
    mockNote: "Couldn't fetch real captions from YouTube. Showing mock captions so you can see how the player works.",
    sourceLang: "Source",
    targetLang: "Target",
  },
};

function loadIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.YT && window.YT.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.getElementById("yt-iframe-api") as HTMLScriptElement | null;
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (window.YT && window.YT.Player) resolve();
  });
}

export default function Player({ videoID, lang, uiLang }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [cues, setCues] = useState<Cue[]>([]);
  const [meta, setMeta] = useState<{
    sourceLang: string;
    translator: "haiku" | "stub";
    captionSource: "youtube" | "mock";
  } | null>(null);
  const [activeCue, setActiveCue] = useState<Cue | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const cuesRef = useRef<Cue[]>([]);
  const lastIdxRef = useRef<number>(-1);

  const strings = t[uiLang];

  useEffect(() => {
    cuesRef.current = cues;
  }, [cues]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setActiveCue(null);
    setCues([]);
    setMeta(null);
    setErrorMessage("");

    fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoID, lang }),
    })
      .then(async (r) => {
        const json = (await r.json()) as ProcessResponse | ProcessErrorResponse;
        if (cancelled) return;
        if (json.status === "ready") {
          setCues(json.cues);
          setMeta({
            sourceLang: json.sourceLang,
            translator: json.translator,
            captionSource: json.captionSource,
          });
          setStatus("ready");
        } else {
          setStatus("error");
          setErrorMessage(
            json.code === "no_captions"
              ? strings.errorNoCaptions
              : json.message || strings.errorGeneric,
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(strings.errorGeneric);
      });

    return () => {
      cancelled = true;
    };
  }, [videoID, lang, strings.errorNoCaptions, strings.errorGeneric]);

  useEffect(() => {
    if (status !== "ready" || !iframeContainerRef.current) return;
    let destroyed = false;

    const iframeId = `yt-player-${videoID}`;
    const host = iframeContainerRef.current;
    host.innerHTML = `<div id="${iframeId}" class="absolute inset-0 h-full w-full"></div>`;

    loadIframeApi().then(() => {
      if (destroyed) return;
      playerRef.current = new window.YT.Player(iframeId, {
        videoId: videoID,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          enablejsapi: 1,
          cc_load_policy: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.unloadModule("captions");
              e.target.unloadModule("cc");
            } catch {}
          },
          onStateChange: (e: any) => {
            const PLAYING = window.YT.PlayerState.PLAYING;
            if (e.data === PLAYING) startSyncLoop();
            else stopSyncLoop();
          },
        },
      });
    });

    return () => {
      destroyed = true;
      stopSyncLoop();
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [status, videoID]);

  function startSyncLoop() {
    if (rafRef.current !== null) return;
    let last = 0;
    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - last < 100) return;
      last = ts;
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;
      const time = player.getCurrentTime() as number;
      const idx = findActiveCue(cuesRef.current, time);
      if (idx !== lastIdxRef.current) {
        lastIdxRef.current = idx;
        setActiveCue(idx >= 0 ? cuesRef.current[idx] : null);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  function stopSyncLoop() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-black shadow-[0_0_80px_-30px_var(--color-accent-soft)]">
        <div ref={iframeContainerRef} className="absolute inset-0" />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-soft)] text-sm text-[var(--color-fg-muted)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"></span>
            {strings.preparing}
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-soft)] px-6 text-center">
            <p className="font-medium text-[var(--color-fg)]">{strings.errorTitle}</p>
            <p className="text-sm text-[var(--color-fg-muted)]">{errorMessage}</p>
          </div>
        )}

        {status === "ready" && <CueOverlay cue={activeCue} showSource={showSource} />}
      </div>

      {status === "ready" && meta && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-fg-muted)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-[var(--color-border)] px-2 py-0.5 uppercase tracking-wider">
              {meta.sourceLang} → {lang}
            </span>
            {meta.captionSource === "mock" && (
              <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider text-amber-400">
                {strings.mockBadge}
              </span>
            )}
            {meta.translator === "stub" && (
              <span className="rounded border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] px-2 py-0.5 uppercase tracking-wider text-[var(--color-accent)]">
                {strings.stubBadge}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowSource((s) => !s)}
            className="rounded border border-[var(--color-border)] px-3 py-1 hover:text-[var(--color-fg)]"
          >
            {showSource ? strings.hideSource : strings.showSource}
          </button>
        </div>
      )}

      {status === "ready" && meta?.captionSource === "mock" && (
        <p className="mt-3 text-xs text-[var(--color-fg-muted)]">{strings.mockNote}</p>
      )}

      {status === "ready" && meta?.translator === "stub" && meta.captionSource !== "mock" && (
        <p className="mt-3 text-xs text-[var(--color-fg-muted)]">{strings.stubNote}</p>
      )}
    </div>
  );
}
