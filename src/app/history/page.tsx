"use client";

import { useState } from "react";
import { HistorySession, PredictionResponse } from "@/types";
import AnalysisResults from "@/components/AnalysisResults";

const mockSessions: HistorySession[] = [
  {
    id: "8492",
    fileName: "Session_Audio_Oct24.wav",
    date: "Oct 24, 2024",
    time: "09:30 AM",
    type: "audio",
    dominantEmotion: "Neutral / Baseline",
    emotionCategory: "neutral",
    duration: "45m 12s",
    subject: "Patient A-04",
  },
  {
    id: "8491",
    fileName: "Video_Intake_042.mp4",
    date: "Oct 22, 2024",
    time: "14:15 PM",
    type: "video",
    dominantEmotion: "Elevated Stress",
    emotionCategory: "stress",
    duration: "18m 05s",
    subject: "Patient B-12",
  },
  {
    id: "8488",
    fileName: "Follow_up_Audio.wav",
    date: "Oct 20, 2024",
    time: "10:00 AM",
    type: "audio",
    dominantEmotion: "Cognitive Load",
    emotionCategory: "cognitive-load",
    duration: "62m 30s",
    subject: "Research Grp-1",
  },
  {
    id: "8485",
    fileName: "Therapy_Session_08.mp4",
    date: "Oct 19, 2024",
    time: "15:00 PM",
    type: "video",
    dominantEmotion: "Measured Calm",
    emotionCategory: "calm",
    duration: "55m 30s",
    subject: "Patient C-07",
  },
  {
    id: "8480",
    fileName: "Baseline_Audio_Test.wav",
    date: "Oct 17, 2024",
    time: "11:45 AM",
    type: "audio",
    dominantEmotion: "Neutral / Baseline",
    emotionCategory: "neutral",
    duration: "28m 45s",
    subject: "Research Grp-2",
  },
];

function getEmotionBadge(category: string, label: string) {
  const styles: Record<string, string> = {
    neutral: "bg-secondary-fixed text-on-secondary-fixed",
    stress: "bg-error-container text-on-error-container",
    calm: "bg-secondary-fixed text-secondary",
    "cognitive-load": "bg-surface-variant text-on-surface-variant",
  };
  const dotStyles: Record<string, string> = {
    neutral: "bg-secondary",
    stress: "bg-error",
    calm: "bg-secondary",
    "cognitive-load": "bg-outline",
  };

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[14px] font-medium ${styles[category] || styles.neutral}`}>
      <span className={`w-2 h-2 rounded-full ${dotStyles[category] || dotStyles.neutral}`} />
      {label}
    </div>
  );
}

function MiniWaveform({ category }: { category: string }) {
  const isStress = category === "stress";
  const heights = isStress ? [30, 80, 90, 70, 50, 30] : [20, 40, 30, 60, 40, 20];
  return (
    <div className="w-[120px] h-8 opacity-50">
      <div className="w-full h-full bg-surface-container-high rounded flex items-end gap-[2px] overflow-hidden">
        {heights.map((h, i) => (
          <div key={i} className={`w-full rounded-t-sm ${isStress ? "bg-error" : "bg-on-surface-variant"}`} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<PredictionResponse | null>(null);
  const [selectedFilename, setSelectedFilename] = useState("");
  const totalPages = 12;

  const handleReview = (session: HistorySession) => {
    const dummyResult: PredictionResponse = {
      emotion: session.emotionCategory,
      confidence: 0.85,
      valence: 0.2,
      arousal: 0.6,
      dominance: -0.3,
      trust_score: 0.72,
      deception_probability: 0.12,
      engagement: 0.65,
      stability: 0.78,
      stress: session.emotionCategory === "stress" ? 0.82 : 0.15,
    };
    setSelectedResult(dummyResult);
    setSelectedFilename(session.fileName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredSessions = mockSessions.filter(
    (s) =>
      s.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.includes(searchQuery) ||
      s.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedResult) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-8 pt-10 pb-12 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedResult(null)} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-medium cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to History
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h2 className="text-[20px] font-bold text-on-surface mb-4">Session Context</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant text-sm">Filename</span>
                  <span className="text-on-surface font-semibold text-sm truncate max-w-[200px]">{selectedFilename}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant text-sm">Status</span>
                  <span className="text-success font-bold text-sm">Processed</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <AnalysisResults result={selectedResult} fileName={selectedFilename} isLoading={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 pt-10 pb-12 flex flex-col gap-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-outline-variant pb-6">
        <div>
          <h1 className="text-[32px] leading-tight tracking-tight font-bold text-on-surface mb-2">Analysis History</h1>
          <p className="text-[17px] leading-relaxed text-on-surface-variant">Review and manage past session recordings and emotional insights.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-3 bg-white border border-outline-variant rounded-lg text-[16px] outline-none focus:border-secondary transition-all" placeholder="Search sessions..." />
          </div>
          <button className="h-10 px-4 bg-white border border-outline-variant rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-[18px]">tune</span>Filter</button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {filteredSessions.map((session) => (
          <div key={session.id} onClick={() => handleReview(session)} className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container-low hover:border-secondary transition-all cursor-pointer group shadow-sm">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors"><span className="material-symbols-outlined">{session.type === "audio" ? "mic" : "videocam"}</span></div>
              <div>
                <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{session.date} • {session.time}</div>
                <div className="text-[20px] font-bold text-on-surface">Session {session.id}</div>
                <div className="text-sm text-on-surface-variant">Subject: {session.subject}</div>
              </div>
            </div>
            <div className="flex items-center gap-8 hidden lg:flex border-l border-outline-variant/30 pl-8">
              <div className="text-center">
                <div className="text-[11px] font-bold text-on-surface-variant mb-2">Dominant State</div>
                {getEmotionBadge(session.emotionCategory, session.dominantEmotion)}
              </div>
              <MiniWaveform category={session.emotionCategory} />
            </div>
            <div className="flex items-center justify-between md:justify-end gap-6">
              <div className="text-right hidden md:block">
                <div className="text-[11px] font-bold text-on-surface-variant mb-1">Duration</div>
                <div className="text-sm font-bold text-on-surface">{session.duration}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleReview(session); }} className="h-10 px-6 bg-primary-container text-on-primary text-sm font-bold rounded-lg hover:bg-primary transition-all shadow-sm cursor-pointer active:scale-95">Review</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-8">
        <button className="h-10 w-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-surface-container-low disabled:opacity-30" disabled={currentPage === 1}><span className="material-symbols-outlined">chevron_left</span></button>
        <div className="text-sm font-bold text-on-surface">Page {currentPage} of {totalPages}</div>
        <button className="h-10 w-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-surface-container-low"><span className="material-symbols-outlined">chevron_right</span></button>
      </div>
    </div>
  );
}
