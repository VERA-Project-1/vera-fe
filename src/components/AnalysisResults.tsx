"use client";

import { PredictionResponse } from "@/types";
import { METRICS, bandFor, emotionInfo, summarize, type MetricKey } from "@/lib/interpret";

interface AnalysisResultsProps {
  result: PredictionResponse | null;
  fileName: string;
  isLoading: boolean;
}

const EMOTION_STYLE: Record<string, { chip: string; icon: string }> = {
  neutral: { chip: "bg-surface-container-high text-on-surface", icon: "sentiment_neutral" },
  happy: { chip: "bg-success-container text-[#15803d]", icon: "sentiment_satisfied" },
  sad: { chip: "bg-secondary-fixed text-on-secondary-fixed-variant", icon: "sentiment_dissatisfied" },
  angry: { chip: "bg-error-container text-on-error-container", icon: "sentiment_extremely_dissatisfied" },
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const pct = (v: number) => Math.round(clamp01(v) * 100);

function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }} aria-hidden>
      {name}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-on-surface-variant mb-3">{children}</h3>;
}

function Meter({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-secondary-fixed overflow-hidden">
      <div className="h-full rounded-full bg-secondary transition-[width] duration-500" style={{ width: `${pct(value)}%` }} />
    </div>
  );
}

function ScoreCard({ metric, value }: { metric: MetricKey; value: number }) {
  const info = METRICS[metric];
  const band = bandFor(metric, value);
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-on-surface">{info.name}</div>
          <div className="text-[13px] text-on-surface-variant">{info.question}</div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[34px] font-extrabold leading-none text-on-surface">{pct(value)}</span>
          <span className="text-[14px] text-on-surface-variant">/100</span>
        </div>
      </div>
      <Meter value={value} />
      <p className="text-[14px] text-on-surface">
        <span className="font-bold">{band.label}</span> — {band.meaning}.
      </p>
      <details className="group text-[13px] text-on-surface-variant">
        <summary className="cursor-pointer select-none font-semibold hover:text-on-surface inline-flex items-center gap-1">
          <Icon name="chevron_right" size={18} className="transition-transform group-open:rotate-90" />
          How is this calculated?
        </summary>
        <p className="mt-2 leading-relaxed">{info.explain}</p>
        {info.formula && (
          <code className="block mt-2 text-[12px] text-on-surface bg-surface-container-low rounded-md px-2 py-1.5">{info.formula}</code>
        )}
      </details>
    </div>
  );
}

function VadScale({ metric, value }: { metric: MetricKey; value: number }) {
  const info = METRICS[metric];
  const band = bandFor(metric, value);
  const [low, high] = info.scale!;
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-[15px] font-bold text-on-surface">
          {info.name} <span className="font-normal text-on-surface-variant">· {info.question}</span>
        </span>
        <span className="text-[15px] font-bold text-on-surface tabular-nums shrink-0">{value.toFixed(2)}</span>
      </div>
      <div className="relative h-2 mt-3 rounded-full bg-gradient-to-r from-surface-container-high via-secondary-fixed to-secondary-fixed-dim">
        <span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-secondary ring-[3px] ring-white shadow"
          style={{ left: `${pct(value)}%` }}
        />
      </div>
      <div className="flex justify-between text-[12px] text-on-surface-variant mt-1.5">
        <span>{low}</span>
        <span>{high}</span>
      </div>
      <p className="text-[14px] text-on-surface mt-1">
        <span className="font-bold">{band.label}</span> — {band.meaning}.
      </p>
    </div>
  );
}

function downloadJson(result: PredictionResponse, fileName: string) {
  const payload = { file: fileName, analysed_at: new Date().toISOString(), ...result };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/\.[^.]+$/, "") || "vera"}-analysis.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalysisResults({ result, fileName, isLoading }: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 flex flex-col gap-6" aria-busy>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="w-5 h-5 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
          <span className="text-[15px] font-semibold">Listening to the recording… this usually takes 1–3 seconds.</span>
        </div>
        <div className="skeleton h-24 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="skeleton h-36 rounded-xl" />
          <div className="skeleton h-36 rounded-xl" />
        </div>
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white border border-outline-variant rounded-2xl p-6 md:p-10 flex flex-col gap-8">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center mb-5">
            <Icon name="graphic_eq" size={30} />
          </div>
          <h2 className="text-[26px] md:text-[30px] leading-tight font-extrabold tracking-tight text-on-surface">
            Your results will appear here
          </h2>
          <p className="text-[16px] leading-relaxed text-on-surface-variant mt-2 max-w-xl">
            VERA listens to <strong className="text-on-surface">how</strong> something is said — not the words — and reports the emotion, the speaker&apos;s
            confidence, how trustworthy they sound, and the voice&apos;s pleasantness, energy and assertiveness.
          </p>
        </div>
        <div>
          <SectionLabel>For the best read</SectionLabel>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "timer", title: "3–8 seconds", body: "The model analyses the first 8 seconds of a clip." },
              { icon: "person", title: "One speaker", body: "Overlapping voices blur the emotional signal." },
              { icon: "volume_off", title: "Quiet room", body: "Background noise and music reduce accuracy." },
              { icon: "record_voice_over", title: "American English", body: "Trained mostly on US speakers — other accents are read less reliably." },
            ].map((tip) => (
              <li key={tip.title} className="rounded-xl bg-surface-container-low p-4">
                <Icon name={tip.icon} size={22} className="text-secondary" />
                <div className="text-[14px] font-bold mt-2">{tip.title}</div>
                <div className="text-[13px] text-on-surface-variant mt-0.5">{tip.body}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const emotion = emotionInfo(result.emotion);
  const style = EMOTION_STYLE[result.emotion.toLowerCase()] ?? EMOTION_STYLE.neutral;
  const certainty = bandFor("emotion_confidence", result.emotion_confidence);
  const truncated =
    result.audio_seconds !== undefined && result.analyzed_seconds !== undefined && result.analyzed_seconds < result.audio_seconds;

  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-5 md:p-8 flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] font-extrabold tracking-tight text-on-surface">Analysis results</h2>
          <p className="text-[13px] text-on-surface-variant break-all">
            {fileName}
            {result.analyzed_seconds !== undefined && (
              <>
                {" "}
                · analysed {result.analyzed_seconds.toFixed(1)} s{truncated && ` of ${result.audio_seconds!.toFixed(1)} s`}
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadJson(result, fileName)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-[14px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
        >
          <Icon name="download" size={18} />
          Download JSON
        </button>
      </div>

      {truncated && (
        <div className="flex gap-3 rounded-xl bg-warning-container/60 text-[#713f12] p-4 text-[14px]">
          <Icon name="content_cut" size={20} />
          <p>
            Only the <strong>first {result.analyzed_seconds!.toFixed(0)} seconds</strong> were analysed — the model reads an
            8-second window. Trim the clip to the moment you care about for a more targeted result.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl bg-surface-container-low p-5 md:p-6 flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center ${style.chip}`}>
          <Icon name={style.icon} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Detected emotion</div>
          <div className="text-[34px] md:text-[40px] font-extrabold leading-tight tracking-tight text-on-surface">{result.emotion}</div>
          <p className="text-[15px] text-on-surface mt-1">{summarize(result.emotion, result.confidence, result.trust)}</p>
          {emotion && (
            <p className="text-[14px] text-on-surface-variant mt-1">
              {emotion.description} Tone reads as <strong className="text-on-surface">{emotion.tone.toLowerCase()}</strong>.
            </p>
          )}
        </div>
        <div className="sm:w-44 shrink-0">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Certainty</span>
            <span className="text-[18px] font-extrabold tabular-nums">{pct(result.emotion_confidence)}%</span>
          </div>
          <div className="mt-2">
            <Meter value={result.emotion_confidence} />
          </div>
          <p className="text-[12px] text-on-surface-variant mt-2 leading-snug">
            <strong className="text-on-surface">{certainty.label}</strong> — {certainty.meaning}. 25% = random guess.
          </p>
        </div>
      </div>

      {/* Scores */}
      <div>
        <SectionLabel>Scores</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreCard metric="confidence" value={result.confidence} />
          <ScoreCard metric="trust" value={result.trust} />
        </div>
      </div>

      {/* VAD */}
      <div>
        <SectionLabel>Voice profile</SectionLabel>
        <p className="text-[14px] text-on-surface-variant -mt-1 mb-4">
          Three dimensions psychologists use to place any emotion. Each runs from 0 to 1; the dot shows where this voice sits.
        </p>
        <div className="rounded-xl border border-outline-variant p-5 divide-y divide-surface-container-high">
          <VadScale metric="valence" value={result.valence} />
          <VadScale metric="arousal" value={result.arousal} />
          <VadScale metric="dominance" value={result.dominance} />
        </div>
      </div>

      {/* Caveat */}
      <div className="flex gap-3 rounded-xl border border-outline-variant p-4 text-[13px] text-on-surface-variant leading-relaxed">
        <Icon name="info" size={20} className="text-secondary shrink-0" />
        <p>
          <strong className="text-on-surface">Read this as a signal, not a verdict.</strong> On real podcast speech the model picks
          the right emotion about 47% of the time across four options (guessing would be 25%). Scores describe how the voice{" "}
          <em>sounds</em>, not what the speaker actually feels or intends. The model was trained mostly on American-English
          speakers, so for other accents the emotion and scores may be shifted by accent rather than feeling.
        </p>
      </div>
    </div>
  );
}
