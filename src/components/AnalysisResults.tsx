"use client";

import { PredictionResponse } from "@/types";

interface AnalysisResultsProps {
  result: PredictionResponse | null;
  fileName: string;
  isLoading: boolean;
}

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-lowest">
      <span className="text-[12px] leading-[1.2] font-semibold text-on-surface-variant block mb-1 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[24px] leading-[1.3] font-semibold text-on-surface">
        {value}
        {unit && (
          <span className="text-[14px] text-on-surface-variant ml-1">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-lowest">
      <div className="skeleton h-3 w-20 rounded mb-2" />
      <div className="skeleton h-7 w-16 rounded" />
    </div>
  );
}

function formatEmotion(emotion: string): string {
  return emotion
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getEmotionColor(emotion: string): string {
  const map: Record<string, string> = {
    neutral: "bg-surface-container-high text-on-surface",
    happy: "bg-success-container text-[#16a34a]",
    sad: "bg-secondary-fixed text-on-secondary-fixed-variant",
    angry: "bg-error-container text-on-error-container",
    fear: "bg-warning-container text-[#ca8a04]",
    surprise: "bg-[#f3e8ff] text-[#7c3aed]",
    disgust: "bg-[#fef3c7] text-[#92400e]",
    calm: "bg-secondary-fixed text-secondary",
  };
  return map[emotion.toLowerCase()] || "bg-surface-container-high text-on-surface";
}

export default function AnalysisResults({
  result,
  fileName,
  isLoading,
}: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <div className="flex items-center justify-between mb-md pb-md border-b border-outline-variant/50">
          <div>
            <div className="skeleton h-6 w-48 rounded mb-2" />
            <div className="skeleton h-4 w-32 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-sm mb-md">
          <div className="bg-surface rounded-lg p-4 border border-outline-variant/50">
            <div className="skeleton h-3 w-24 rounded mb-3" />
            <div className="skeleton h-8 w-36 rounded mb-2" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
          <div className="bg-surface rounded-lg p-4 border border-outline-variant/50">
            <div className="skeleton h-3 w-24 rounded mb-3" />
            <div className="skeleton h-8 w-36 rounded mb-2" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-sm">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center min-h-[420px] shadow-sm">
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
          <span
            className="material-symbols-outlined text-[48px] text-outline-variant"
            style={{ fontVariationSettings: "'wght' 200" }}
          >
            analytics
          </span>
        </div>
        <h2 className="text-[28px] leading-tight font-bold text-on-surface mb-3 tracking-tight">
          No Analysis Yet
        </h2>
        <p className="text-[17px] leading-relaxed text-on-surface-variant text-center max-w-[340px] w-full mx-auto">
          Upload or record an audio session to begin emotional metrics extraction and clinical analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-outline-variant/30">
        <div>
          <h2 className="text-[24px] leading-[1.3] font-semibold text-on-surface">
            Analysis Results
          </h2>
          <p className="text-[12px] leading-[1.2] font-semibold text-on-surface-variant">
            {fileName}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Download Report"
            className="p-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
          <button className="bg-primary-container text-on-primary px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-primary transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Primary Emotion Cards */}
      <div className="grid grid-cols-2 gap-sm mb-md">
        {/* Dominant Emotion */}
        <div className="bg-surface rounded-lg p-4 border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-sm">
            <span className="material-symbols-outlined text-secondary">
              vital_signs
            </span>
            <span className="text-[12px] leading-[1.2] font-semibold text-on-surface-variant uppercase">
              Dominant Affect
            </span>
          </div>
          <div>
            <div className="text-[32px] leading-[1.2] tracking-[-0.01em] font-semibold text-on-surface">
              {formatEmotion(result.emotion)}
            </div>
            <div className="text-[14px] font-medium text-secondary mt-1">
              {(result.confidence * 100).toFixed(0)}% Confidence
            </div>
          </div>
        </div>

        {/* Trust Score */}
        <div className="bg-surface rounded-lg p-4 border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-sm">
            <span className="material-symbols-outlined text-outline">
              verified_user
            </span>
            <span className="text-[12px] leading-[1.2] font-semibold text-on-surface-variant uppercase">
              Trust Assessment
            </span>
          </div>
          <div>
            <div className="text-[32px] leading-[1.2] tracking-[-0.01em] font-semibold text-on-surface">
              {(result.trust_score * 100).toFixed(0)}%
            </div>
            <div className="text-[14px] font-medium text-on-surface-variant mt-1">
              Deception: {(result.deception_probability * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Badge */}
      <div className="mb-md flex items-center gap-3">
        <span className="text-[12px] font-semibold text-on-surface-variant uppercase">
          Classification:
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-medium ${getEmotionColor(
            result.emotion
          )}`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          {formatEmotion(result.emotion)}
        </span>
      </div>

      {/* VAD Metrics */}
      <div className="grid grid-cols-3 gap-sm mb-md">
        <MetricCard
          label="Valence"
          value={result.valence.toFixed(2)}
        />
        <MetricCard
          label="Arousal"
          value={result.arousal.toFixed(2)}
        />
        <MetricCard
          label="Dominance"
          value={result.dominance.toFixed(2)}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-sm">
        <MetricCard
          label="Engagement"
          value={(result.engagement * 100).toFixed(0)}
          unit="%"
        />
        <MetricCard
          label="Stability"
          value={(result.stability * 100).toFixed(0)}
          unit="%"
        />
        <MetricCard
          label="Stress"
          value={(result.stress * 100).toFixed(0)}
          unit="%"
        />
      </div>
    </div>
  );
}
