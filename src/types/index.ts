// API response type from VERA backend (/predict endpoint) — mirrors vera-server app/model.py predict().
// All values are 0–1 except emotion.
export interface PredictionResponse {
  emotion: string; // "Angry" | "Happy" | "Neutral" | "Sad"
  emotion_confidence: number; // softmax probability of the predicted emotion
  valence: number;
  arousal: number;
  dominance: number;
  trust: number; // 0.4·V + 0.4·D·(1 − A) + 0.2·P_emotion
  confidence: number; // speaker confidence: 0.5·D + 0.3·A + 0.2·(2·|V − 0.5|)
  audio_seconds?: number; // full clip length
  analyzed_seconds?: number; // the model only reads the first 8 s
}

export const PREDICTION_NUMBER_FIELDS = [
  "emotion_confidence",
  "valence",
  "arousal",
  "dominance",
  "trust",
  "confidence",
] as const satisfies readonly (keyof PredictionResponse)[];

// Analysis result used in the UI
export interface AnalysisResult {
  prediction: PredictionResponse;
  fileName: string;
  fileSize: number;
  duration?: number;
  timestamp: Date;
}
