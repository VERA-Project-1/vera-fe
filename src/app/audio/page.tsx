"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnalysisResults from "@/components/AnalysisResults";
import { PredictionResponse } from "@/types";

type InputMode = "upload" | "record";
type RecordingState = "idle" | "recording" | "recorded";

function AudioContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<InputMode>("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Waveform animation state
  const [waveformBars, setWaveformBars] = useState<number[]>(
    Array(40).fill(5)
  );
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Load review data if redirected from history
  useEffect(() => {
    if (searchParams.get("review") === "true") {
      const storedResult = localStorage.getItem("vera_review_result");
      const storedFilename = localStorage.getItem("vera_review_filename");
      if (storedResult) {
        setResult(JSON.parse(storedResult));
        setFileName(storedFilename || "Review Session");
        // Clear them so they don't persist on refresh
        localStorage.removeItem("vera_review_result");
        localStorage.removeItem("vera_review_filename");
      }
    }
  }, [searchParams]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  // ─── Upload handlers ───
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    []
  );

  const processFile = useCallback((file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  // ─── Recording handlers ───
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setFileName(`Recording_${new Date().toISOString().slice(0, 16)}.webm`);
        setRecordingState("recorded");
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(100);
      setRecordingState("recording");
      setRecordingTime(0);
      setError(null);
      setResult(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      const updateWaveform = () => {
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          const bars = Array.from({ length: 40 }, (_, i) => {
            const idx = Math.floor((i / 40) * data.length);
            return Math.max(5, (data[idx] / 255) * 100);
          });
          setWaveformBars(bars);
        }
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setWaveformBars(Array(40).fill(5));
    }
  }, [recordingState]);

  const resetRecording = useCallback(() => {
    setRecordingState("idle");
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setResult(null);
  }, [audioUrl]);

  const analyzeAudio = useCallback(async () => {
    const file = mode === "upload" ? selectedFile : audioBlob ? new File([audioBlob], fileName || "recording.webm", { type: "audio/webm" }) : null;
    if (!file) { setError("No audio file selected."); return; }
    if (!backendUrl || backendUrl.includes("your-ngrok-url")) { setError("Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL in .env.local"); return; }
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${backendUrl}/predict`, { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data: PredictionResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally { setIsAnalyzing(false); }
  }, [mode, selectedFile, audioBlob, fileName, backendUrl]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="mb-4">
          <h1 className="text-[32px] leading-tight tracking-tight font-bold text-on-surface mb-2">Audio Analysis</h1>
          <p className="text-[17px] leading-relaxed text-on-surface-variant">Upload or record an audio session for precise emotional metrics extraction.</p>
        </div>
        <div className="bg-white border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm relative z-20">
          <div className="flex bg-surface-container rounded-xl p-1 w-full border border-outline-variant/30">
            <button type="button" onClick={() => { setMode("upload"); resetRecording(); }} className={`flex-1 py-2 text-center rounded-lg text-sm font-bold transition-all cursor-pointer ${mode === "upload" ? "bg-white shadow-md text-on-surface border border-outline-variant/20" : "text-on-surface-variant hover:text-on-surface"}`}>Upload File</button>
            <button type="button" onClick={() => { setMode("record"); setSelectedFile(null); }} className={`flex-1 py-2 text-center rounded-lg text-sm font-bold transition-all cursor-pointer ${mode === "record" ? "bg-white shadow-md text-on-surface border border-outline-variant/20" : "text-on-surface-variant hover:text-on-surface"}`}>Record Live</button>
          </div>
          {mode === "upload" && (
            <div>
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[240px] transition-all ${dragActive ? "border-secondary bg-secondary-fixed/20" : selectedFile ? "border-secondary bg-surface-container-low" : "border-outline-variant hover:border-secondary bg-surface hover:bg-surface-container-low"}`} onClick={() => fileInputRef.current?.click()} id="drop-zone">
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-success-container text-[#16a34a] flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[32px] icon-fill">check_circle</span></div>
                    <span className="text-[14px] font-medium text-on-surface mb-1">{selectedFile.name}</span>
                    <span className="text-[12px] text-on-surface-variant">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileName(""); }} className="mt-3 text-[12px] text-error hover:underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[32px]">cloud_upload</span></div>
                    <span className="text-[14px] font-medium text-on-surface mb-1">Drag and drop audio file here</span>
                    <span className="text-[12px] text-on-surface-variant mb-4 font-medium opacity-60">MP3, WAV, FLAC, WebM (Max 50MB)</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-primary-container text-on-primary px-5 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-primary transition-all active:scale-95 shadow-sm cursor-pointer">Browse Files</button>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" id="file-input" />
            </div>
          )}
          {mode === "record" && (
            <div className="flex flex-col items-center justify-center min-h-[240px] gap-6">
              <div className="w-full h-24 bg-surface rounded-lg border border-outline-variant relative overflow-hidden flex items-center justify-center px-4">
                <div className="flex items-center gap-[2px] h-full py-4">{waveformBars.map((h, i) => (<div key={i} className={`w-1 rounded-full transition-all duration-75 ${recordingState === "recording" ? "bg-error" : "bg-outline-variant"}`} style={{ height: `${h}%` }} />))}</div>
                {recordingState === "recording" && <div className="absolute top-2 right-3 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error animate-pulse" /><span className="text-[12px] font-semibold text-error">REC</span></div>}
              </div>
              <div className="text-[32px] font-semibold text-on-surface tabular-nums">{formatTime(recordingTime)}</div>
              <div className="flex items-center gap-4">
                {recordingState === "idle" && <button type="button" onClick={startRecording} className="w-16 h-16 rounded-full bg-error text-on-error flex items-center justify-center hover:bg-error/90 shadow-lg cursor-pointer transition-transform active:scale-95"><span className="material-symbols-outlined text-[32px] icon-fill">mic</span></button>}
                {recordingState === "recording" && <button type="button" onClick={stopRecording} className="w-16 h-16 rounded-full bg-error text-on-error flex items-center justify-center hover:bg-error/90 shadow-lg cursor-pointer transition-transform active:scale-95"><span className="material-symbols-outlined text-[32px] icon-fill">stop</span></button>}
                {recordingState === "recorded" && (
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={resetRecording} className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-all cursor-pointer"><span className="material-symbols-outlined text-[24px]">delete</span></button>
                    {audioUrl && <audio controls src={audioUrl} className="h-10 max-w-[200px]" />}
                  </div>
                )}
              </div>
            </div>
          )}
          {error && <div className="bg-error-container text-on-error-container rounded-lg p-3 text-[14px] flex items-center gap-2 underline decoration-error/30"><span className="material-symbols-outlined text-[20px]">error</span>{error}</div>}
          <button type="button" onClick={analyzeAudio} disabled={isAnalyzing || (mode === "upload" && !selectedFile) || (mode === "record" && recordingState !== "recorded")} className="w-full py-4 bg-primary-container text-on-primary rounded-xl text-[15px] font-bold hover:bg-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-md cursor-pointer">{isAnalyzing ? "Analyzing Session..." : "Generate Emotional Analysis"}</button>
        </div>
      </div>
      <div className="lg:col-span-7 flex flex-col gap-6 relative z-10">
        <AnalysisResults result={result} fileName={fileName} isLoading={isAnalyzing} />
      </div>
    </div>
  );
}

export default function AudioPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-on-surface-variant font-medium">Initializing VERA Workspace...</div>}>
      <AudioContent />
    </Suspense>
  );
}
