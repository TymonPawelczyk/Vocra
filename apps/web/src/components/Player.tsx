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
type LoadingStage = "fetchingCaptions" | "translating";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const t = {
  pl: {
    fetchingCaptions: "Pobieram napisy z YouTube…",
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
    sharePending: "Skopiuj link",
    shareCopied: "Skopiowano",
    downloadSrt: "Pobierz .srt",
    openOnYoutube: "Otwórz na YouTube",
    waitlistTitle: "Podoba ci się?",
    waitlistBody: "Vocra to docelowo rozszerzenie do Chrome — działa na każdym filmie YouTube, łącznie z live streamami. To, co widzisz, to demo.",
    waitlistCta: "Dołącz do listy →",
  },
  en: {
    fetchingCaptions: "Fetching captions from YouTube…",
    translating: "Translating subtitles…",
    errorTitle: "Couldn't generate subtitles",
    errorNoCaptions: "This video has no available captions. Try another one.",
    errorGeneric: "Try again or pick a different video.",
    showSource: "Show original",
    hideSource: "Hide original",
    stubBadge: "DEMO MODE",
    mockBadge: "MOCK CAPTIONS",
    stubNote: "No API key set — showing demo subtitles.",
    mockNote: "Couldn't fetch real captions from YouTube. Showing mock captions so you can see how the player works.",
    sharePending: "Copy link",
    shareCopied: "Copied",
    downloadSrt: "Download .srt",
    openOnYoutube: "Open on YouTube",
    waitlistTitle: "Like what you see?",
    waitlistBody: "Vocra ships as a Chrome extension that works on every YouTube video, including live streams. What you're seeing is the demo.",
    waitlistCta: "Join the waitlist →",
  },
};

const WAITLIST_HREF: Record<"pl" | "en", string> = {
  pl: "https://vocra.dev/#waitlist",
  en: "https://vocra.dev/en#waitlist",
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

function pad(n: number, width = 2) {
  return n.toString().padStart(width, "0");
}

function formatSrtTime(seconds: number): string {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const hh = Math.floor(ms / 3600000);
  const mm = Math.floor((ms % 3600000) / 60000);
  const ss = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${pad(hh)}:${pad(mm)}:${pad(ss)},${pad(millis, 3)}`;
}

function cuesToSrt(cues: Cue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n${c.text}\n`)
    .join("\n");
}

function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Player({ videoID, lang, uiLang }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("fetchingCaptions");
  const [cues, setCues] = useState<Cue[]>([]);
  const [meta, setMeta] = useState<{
    sourceLang: string;
    translator: "haiku" | "stub";
    captionSource: "youtube" | "mock";
  } | null>(null);
  const [activeCue, setActiveCue] = useState<Cue | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [shareCopied, setShareCopied] = useState(false);

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
    setLoadingStage("fetchingCaptions");
    setActiveCue(null);
    setCues([]);
    setMeta(null);
    setErrorMessage("");

    const stageTimer = window.setTimeout(() => {
      if (!cancelled) setLoadingStage("translating");
    }, 1200);

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
      window.clearTimeout(stageTimer);
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

  async function handleShare() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      } catch {}
      ta.remove();
    }
  }

  function handleDownloadSrt() {
    if (cues.length === 0) return;
    downloadFile(`vocra-${videoID}-${lang}.srt`, cuesToSrt(cues), "application/x-subrip");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-black shadow-[0_0_80px_-30px_var(--color-accent-soft)]">
        <div ref={iframeContainerRef} className="absolute inset-0" />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-soft)] text-sm text-[var(--color-fg-muted)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"></span>
            {strings[loadingStage]}
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSource((s) => !s)}
              className="rounded border border-[var(--color-border)] px-3 py-1 hover:text-[var(--color-fg)]"
            >
              {showSource ? strings.hideSource : strings.showSource}
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-live="polite"
              className="rounded border border-[var(--color-border)] px-3 py-1 hover:text-[var(--color-fg)]"
            >
              {shareCopied ? strings.shareCopied : strings.sharePending}
            </button>
            <button
              type="button"
              onClick={handleDownloadSrt}
              className="rounded border border-[var(--color-border)] px-3 py-1 hover:text-[var(--color-fg)]"
            >
              {strings.downloadSrt}
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${videoID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-[var(--color-border)] px-3 py-1 hover:text-[var(--color-fg)]"
            >
              {strings.openOnYoutube}
            </a>
          </div>
        </div>
      )}

      {status === "ready" && meta?.captionSource === "mock" && (
        <p className="mt-3 text-xs text-[var(--color-fg-muted)]">{strings.mockNote}</p>
      )}

      {status === "ready" && meta?.translator === "stub" && meta.captionSource !== "mock" && (
        <p className="mt-3 text-xs text-[var(--color-fg-muted)]">{strings.stubNote}</p>
      )}

      {status === "ready" && (
        <aside className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--color-accent-soft)] bg-[color-mix(in_srgb,var(--color-accent)_4%,var(--color-bg-soft))] p-5 shadow-[0_0_60px_-30px_var(--color-accent-soft)] md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="font-[var(--font-display)] text-lg font-semibold">{strings.waitlistTitle}</p>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{strings.waitlistBody}</p>
          </div>
          <a
            href={WAITLIST_HREF[uiLang]}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[#0a0a0b] hover:opacity-90"
          >
            {strings.waitlistCta}
          </a>
        </aside>
      )}
    </div>
  );
}
