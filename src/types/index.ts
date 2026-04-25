// API response type from VERA backend (/predict endpoint)
export interface PredictionResponse {
  emotion: string;
  confidence: number;
  valence: number;
  arousal: number;
  dominance: number;
  trust_score: number;
  deception_probability: number;
  engagement: number;
  stability: number;
  stress: number;
}

// Analysis result used in the UI
export interface AnalysisResult {
  prediction: PredictionResponse;
  fileName: string;
  fileSize: number;
  duration?: number;
  timestamp: Date;
}

// History session item
export interface HistorySession {
  id: string;
  fileName: string;
  date: string;
  time: string;
  type: "audio" | "video";
  dominantEmotion: string;
  emotionCategory: "neutral" | "stress" | "calm" | "cognitive-load";
  duration: string;
  subject?: string;
}
