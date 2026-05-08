import type { Cue } from "@/lib/cues";

interface Props {
  cue: Cue | null;
  showSource: boolean;
}

export default function CueOverlay({ cue, showSource }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center px-4">
      {cue && (
        <div className="flex max-w-[90%] flex-col items-center gap-1 rounded-md bg-black/65 px-4 py-2 text-center text-white backdrop-blur md:max-w-[80%]">
          <span className="text-base font-semibold leading-snug md:text-lg">{cue.text}</span>
          {showSource && cue.source && cue.source !== cue.text && (
            <span className="text-xs text-white/60 md:text-sm">{cue.source}</span>
          )}
        </div>
      )}
    </div>
  );
}
