"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AnalysisResults from "@/components/AnalysisResults";
import { PredictionResponse } from "@/types";
import { DATASETS } from "@/lib/research";

type InputMode = "upload" | "record";

interface Clip {
  file: File;
  url: string; // object URL for the <audio> preview
  source: InputMode;
}

// Keep in sync with vera-server app/config.py (ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES).
const ACCEPTED_EXTENSIONS = [".webm", ".wav", ".mp3", ".ogg", ".m4a", ".flac"];
const MAX_UPLOAD_MB = 50;
const ANALYSIS_WINDOW_S = 8;
const MAX_RECORDING_S = 30;
const BAR_COUNT = 48;

function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }} aria-hidden>
      {name}
    </span>
  );
}

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

function validateFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `“${file.name}” isn't a supported audio file. Use ${ACCEPTED_EXTENSIONS.join(", ").replaceAll(".", "").toUpperCase()}.`;
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return `That file is ${formatBytes(file.size)} — the limit is ${MAX_UPLOAD_MB} MB. Only the first ${ANALYSIS_WINDOW_S} seconds are analysed, so a shorter clip works just as well.`;
  }
  if (file.size === 0) return "That file is empty.";
  return null;
}

// Prefer webm/opus; Safari only records mp4/aac, which the server accepts as .m4a.
function pickRecorderFormat(): { mimeType?: string; ext: string } {
  if (typeof MediaRecorder === "undefined") return { ext: ".webm" };
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return { mimeType: "audio/webm;codecs=opus", ext: ".webm" };
  if (MediaRecorder.isTypeSupported("audio/webm")) return { mimeType: "audio/webm", ext: ".webm" };
  if (MediaRecorder.isTypeSupported("audio/mp4")) return { mimeType: "audio/mp4", ext: ".m4a" };
  return { ext: ".webm" };
}

export default function AudioPage() {
  const [mode, setMode] = useState<InputMode>("upload");
  const [clip, setClipState] = useState<Clip | null>(null);
  const [clipDuration, setClipDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(4));

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const clipUrlRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Swap the current clip, releasing the previous preview URL.
  const setClip = useCallback((next: Clip | null) => {
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    clipUrlRef.current = next?.url ?? null;
    setClipState(next);
    setClipDuration(null);
    setResult(null);
  }, []);

  const teardownRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    timerRef.current = rafRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
  }, []);

  useEffect(
    () => () => {
      teardownRecording();
      if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    },
    [teardownRecording]
  );

  // ─── Upload ───
  const acceptFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const problem = validateFile(file);
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      setClip({ file, url: URL.createObjectURL(file), source: "upload" });
    },
    [setClip]
  );

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const onDrop = (e: React.DragEvent) => {
    onDrag(e);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  // ─── Record ───
  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access was blocked. Allow microphone access in your browser's address bar, then try again.");
      return;
    }
    setClip(null);
    streamRef.current = stream;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    audioCtxRef.current = audioCtx;

    const { mimeType, ext } = pickRecorderFormat();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      teardownRecording();
      setIsRecording(false);
      setLevels(Array(BAR_COUNT).fill(4));
      const type = recorder.mimeType || mimeType || "audio/webm";
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      const file = new File(chunks, `recording-${stamp}${ext}`, { type });
      setClip({ file, url: URL.createObjectURL(file), source: "record" });
    };
    recorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);

    const startedAt = performance.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      const secs = (performance.now() - startedAt) / 1000;
      setElapsed(secs);
      if (secs >= MAX_RECORDING_S) stopRecording();
    }, 100);

    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
      const level = Math.max(4, Math.min(100, (peak / 128) * 160));
      setLevels((prev) => [...prev.slice(1), level]);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [setClip, stopRecording, teardownRecording]);

  const switchMode = (next: InputMode) => {
    if (next === mode) return;
    if (isRecording) stopRecording();
    setMode(next);
    setError(null);
    setClip(null);
  };

  // ─── Analyse ───
  const analyze = useCallback(async () => {
    if (!clip) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    try {
      const formData = new FormData();
      formData.append("file", clip.file);
      // Same-origin proxy (src/app/api/predict/route.ts) forwards to the FastAPI server and logs in the Next terminal.
      const response = await fetch("/api/predict", { method: "POST", body: formData });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.detail ?? `Server error (${response.status}).`);
      setResult(body as PredictionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [clip]);

  const overWindow = clipDuration !== null && clipDuration > ANALYSIS_WINDOW_S;

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <h1 className="text-[32px] md:text-[40px] leading-tight tracking-tight font-extrabold text-on-surface">Analyse a voice</h1>
          <p className="text-[16px] leading-relaxed text-on-surface-variant mt-2">
            Upload a clip or record yourself. VERA reads the emotion, confidence and trust in the voice — not the words.
          </p>
        </div>

        <details className="group rounded-2xl border border-[#ca8a04]/60 bg-warning-container/50 p-4 text-[14px] text-on-surface">
          <summary className="cursor-pointer select-none list-none flex items-start gap-3">
            <Icon name="record_voice_over" size={22} className="text-[#a16207] shrink-0 mt-0.5" />
            <span className="flex-1">
              <strong>Works best with American-English speech.</strong> The model learned from mostly American-English
              speakers, so other accents can skew the results.{" "}
              <span className="text-secondary font-semibold group-open:hidden">Why?</span>
            </span>
          </summary>
          <div className="mt-3 pl-[34px] flex flex-col gap-2 leading-relaxed text-on-surface-variant">
            <p>
              Both training datasets are predominantly American English:{" "}
              {DATASETS.map((d, i) => (
                <span key={d.name}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary underline underline-offset-2">
                    {d.name}
                  </a>
                  {i === 0 ? " (10 actors recorded at USC) and " : " (mostly US podcasts)."}
                </span>
              ))}
            </p>
            <p>
              Accents differ in pitch range, rhythm and word stress. The model has no way to tell those habits apart from emotion,
              so a non-American accent can shift the detected emotion and push valence, arousal, dominance — and therefore
              Confidence and Trust — up or down.
            </p>
            <p>
              Treat results for other accents (e.g. Indian, British, Australian or non-native English) as rough indications, and
              compare clips from the same speaker rather than across speakers.
            </p>
          </div>
        </details>

        <div className="bg-white border border-outline-variant rounded-2xl p-5 md:p-6 flex flex-col gap-5 shadow-sm">
          {/* Step 1 */}
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            <span className="w-6 h-6 rounded-full bg-on-surface text-white flex items-center justify-center text-[12px]">1</span>
            Add audio
          </div>

          <div role="tablist" aria-label="Audio source" className="grid grid-cols-2 bg-surface-container rounded-xl p-1">
            {(
              [
                { key: "upload", label: "Upload file", icon: "upload_file" },
                { key: "record", label: "Record", icon: "mic" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={mode === tab.key}
                onClick={() => switchMode(tab.key)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-bold transition-all cursor-pointer ${
                  mode === tab.key ? "bg-white shadow text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upload drop zone (hidden once a file is chosen) */}
          {mode === "upload" && !clip && (
            <div
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center text-center transition-colors ${
                dragActive ? "border-secondary bg-secondary-fixed/40" : "border-outline-variant bg-surface-container-low"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mb-4">
                <Icon name="cloud_upload" size={28} />
              </div>
              <p className="text-[15px] font-bold text-on-surface">{dragActive ? "Drop to add" : "Drag & drop an audio file"}</p>
              <p className="text-[13px] text-on-surface-variant mt-1">or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 bg-on-surface text-white px-5 py-2.5 rounded-lg text-[14px] font-bold hover:bg-primary transition-colors cursor-pointer"
              >
                Choose file
              </button>
              <p className="text-[12px] text-on-surface-variant mt-4">
                WebM, WAV, MP3, OGG, M4A or FLAC · up to {MAX_UPLOAD_MB} MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={`${ACCEPTED_EXTENSIONS.join(",")},audio/*`}
                className="hidden"
                onChange={(e) => {
                  acceptFile(e.target.files?.[0]);
                  e.target.value = ""; // allow re-selecting the same file
                }}
              />
            </div>
          )}

          {/* Recorder (hidden once a take exists) */}
          {mode === "record" && !clip && (
            <div className="rounded-xl bg-surface-container-low p-6 flex flex-col items-center gap-5">
              <div className="w-full h-20 flex items-center gap-[3px]" aria-hidden>
                {levels.map((h, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-[height] duration-75 ${isRecording ? "bg-error" : "bg-outline-variant"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[13px] text-on-surface-variant mb-1.5">
                  <span className="font-bold text-on-surface tabular-nums text-[20px]">{formatSeconds(elapsed)}</span>
                  <span className="self-end">
                    {elapsed < ANALYSIS_WINDOW_S ? `Aim for ${ANALYSIS_WINDOW_S} seconds` : "Analysis window full — you can stop"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] ${elapsed >= ANALYSIS_WINDOW_S ? "bg-success" : "bg-secondary"}`}
                    style={{ width: `${Math.min(elapsed / ANALYSIS_WINDOW_S, 1) * 100}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                className="relative w-16 h-16 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                {isRecording && <span className="absolute inset-0 rounded-full bg-error animate-pulse-ring" />}
                <Icon name={isRecording ? "stop" : "mic"} size={30} className="relative icon-fill" />
              </button>
              <p className="text-[13px] text-on-surface-variant text-center -mt-2">
                {isRecording ? "Recording… tap to stop" : "Tap to start. Speak naturally for a few seconds."}
              </p>
            </div>
          )}

          {/* Selected clip: preview + actions */}
          {clip && (
            <div className="rounded-xl border border-outline-variant p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                  <Icon name={clip.source === "record" ? "mic" : "audio_file"} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-on-surface break-all">{clip.file.name}</div>
                  <div className="text-[12px] text-on-surface-variant">
                    {formatBytes(clip.file.size)}
                    {clipDuration !== null && ` · ${formatSeconds(clipDuration)}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => (clip.source === "upload" ? fileInputRef.current?.click() : setClip(null))}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
                >
                  <Icon name={clip.source === "upload" ? "swap_horiz" : "replay"} size={18} />
                  {clip.source === "upload" ? "Replace" : "Re-record"}
                </button>
                <button
                  type="button"
                  onClick={() => setClip(null)}
                  aria-label="Remove clip"
                  className="shrink-0 p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container cursor-pointer"
                >
                  <Icon name="delete" size={18} />
                </button>
              </div>
              <audio
                key={clip.url}
                controls
                preload="metadata"
                src={clip.url}
                className="w-full h-10"
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  // Browser-recorded webm reports Infinity until fully scanned; skip rather than show nonsense.
                  if (Number.isFinite(d)) setClipDuration(d);
                }}
              />
              {overWindow && (
                <p className="text-[12px] text-on-surface-variant flex gap-1.5">
                  <Icon name="info" size={16} className="shrink-0" />
                  This clip is {formatSeconds(clipDuration!)} long — only the first {ANALYSIS_WINDOW_S} seconds will be analysed.
                </p>
              )}
              {/* The upload input stays mounted for "Replace" */}
              {clip.source === "upload" && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={`${ACCEPTED_EXTENSIONS.join(",")},audio/*`}
                  className="hidden"
                  onChange={(e) => {
                    acceptFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              )}
            </div>
          )}

          {error && (
            <div role="alert" className="bg-error-container text-on-error-container rounded-xl p-3.5 text-[14px] flex gap-2">
              <Icon name="error" size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 2 */}
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-on-surface-variant pt-1">
            <span className="w-6 h-6 rounded-full bg-on-surface text-white flex items-center justify-center text-[12px]">2</span>
            Analyse
          </div>
          <button
            type="button"
            onClick={analyze}
            disabled={!clip || isAnalyzing || isRecording}
            className="w-full py-4 bg-on-surface text-white rounded-xl text-[16px] font-bold hover:bg-primary transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Icon name="graphic_eq" size={20} />
                {clip ? "Analyse this clip" : "Add audio to analyse"}
              </>
            )}
          </button>
          <p className="text-[12px] text-on-surface-variant text-center -mt-2">
            Audio is sent to your VERA server for analysis and deleted straight after.
          </p>
        </div>
      </div>

      <div ref={resultsRef} className="lg:col-span-7 scroll-mt-20">
        <AnalysisResults result={result} fileName={clip?.file.name ?? ""} isLoading={isAnalyzing} />
      </div>
    </div>
  );
}
