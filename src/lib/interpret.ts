// Plain-language explanations for every value the model returns, used on the results panel.

export type MetricKey = "valence" | "arousal" | "dominance" | "confidence" | "trust" | "emotion_confidence";

interface Band {
  max: number; // upper bound (exclusive) of this band on the 0–1 scale
  label: string;
  meaning: string;
}

interface MetricInfo {
  name: string;
  question: string; // what the number answers, in one line
  explain: string;
  formula?: string;
  scale?: [string, string]; // low ↔ high anchors for bipolar VAD scales
  bands: Band[];
}

export const METRICS: Record<MetricKey, MetricInfo> = {
  valence: {
    name: "Valence",
    question: "How pleasant does the voice sound?",
    explain: "Positive vs. negative feeling carried in the voice — independent of the words spoken.",
    scale: ["Unpleasant", "Pleasant"],
    bands: [
      { max: 0.35, label: "Negative", meaning: "sounds displeased, upset or negative" },
      { max: 0.65, label: "Neutral", meaning: "neither clearly positive nor negative" },
      { max: Infinity, label: "Positive", meaning: "sounds pleased, warm or positive" },
    ],
  },
  arousal: {
    name: "Arousal",
    question: "How much energy is in the voice?",
    explain: "Emotional intensity — from calm and relaxed to excited, tense or agitated.",
    scale: ["Calm", "Excited"],
    bands: [
      { max: 0.35, label: "Calm", meaning: "low energy, relaxed or subdued" },
      { max: 0.65, label: "Moderate", meaning: "a normal conversational energy level" },
      { max: Infinity, label: "Energetic", meaning: "high energy — excited, tense or animated" },
    ],
  },
  dominance: {
    name: "Dominance",
    question: "How in control does the speaker sound?",
    explain: "Assertiveness — from hesitant or submissive to firm and in command.",
    scale: ["Submissive", "In control"],
    bands: [
      { max: 0.35, label: "Tentative", meaning: "hesitant, yielding or unsure of footing" },
      { max: 0.65, label: "Balanced", meaning: "neither yielding nor forceful" },
      { max: Infinity, label: "Assertive", meaning: "firm, commanding and in control" },
    ],
  },
  confidence: {
    name: "Confidence",
    question: "How self-assured does the speaker sound?",
    explain: "Built mostly from dominance (50%), then energy (30%) and how strongly any emotion is expressed (20%).",
    formula: "0.5·Dominance + 0.3·Arousal + 0.2·(2·|Valence − 0.5|)",
    bands: [
      { max: 0.4, label: "Low", meaning: "sounds unsure or hesitant" },
      { max: 0.7, label: "Moderate", meaning: "reasonably assured" },
      { max: Infinity, label: "High", meaning: "sounds confident and certain" },
    ],
  },
  trust: {
    name: "Trust",
    question: "How reliable and non-threatening does the voice sound?",
    explain:
      "Rewards a positive tone (40%) and calm assertiveness — in control but not agitated (40%) — plus a prior from the detected emotion (20%). Shouting-like energy lowers it.",
    formula: "0.4·Valence + 0.4·Dominance·(1 − Arousal) + 0.2·EmotionPrior",
    bands: [
      { max: 0.4, label: "Low", meaning: "comes across as guarded, volatile or unsettled" },
      { max: 0.6, label: "Moderate", meaning: "comes across as fairly trustworthy" },
      { max: Infinity, label: "High", meaning: "comes across as calm, warm and trustworthy" },
    ],
  },
  emotion_confidence: {
    name: "Model certainty",
    question: "How sure is the model about the emotion label?",
    explain:
      "The probability the model assigns to its top emotion. There are four options, so 25% is a coin-flip-level guess — anything under ~40% means the voice sits between emotions.",
    bands: [
      { max: 0.4, label: "Low", meaning: "treat the emotion label as a tentative guess" },
      { max: 0.6, label: "Moderate", meaning: "a reasonable read, but not clear-cut" },
      { max: Infinity, label: "High", meaning: "a clear emotional signal" },
    ],
  },
};

export function bandFor(key: MetricKey, value: number): Band {
  return METRICS[key].bands.find((b) => value < b.max)!;
}

export const EMOTION_INFO: Record<string, { tone: string; description: string; prior: number }> = {
  neutral: { tone: "Logical / objective", description: "An even, matter-of-fact delivery without a strong emotional colour.", prior: 0.9 },
  happy: { tone: "Friendly / non-threatening", description: "Warm, upbeat or amused — positive emotion in the voice.", prior: 0.85 },
  sad: { tone: "Vulnerable / unsure", description: "Low, subdued or downcast — the voice carries disappointment or sadness.", prior: 0.6 },
  angry: { tone: "Volatile / threatening", description: "Irritated, frustrated or hostile — tension and force in the voice.", prior: 0.2 },
};

export function emotionInfo(emotion: string) {
  return EMOTION_INFO[emotion.toLowerCase()];
}

// "Sounds happy, confident and fairly trustworthy."
export function summarize(emotion: string, confidence: number, trust: number): string {
  const conf = { Low: "unsure", Moderate: "reasonably assured", High: "confident" }[bandFor("confidence", confidence).label];
  const tr = { Low: "not especially trustworthy", Moderate: "fairly trustworthy", High: "highly trustworthy" }[bandFor("trust", trust).label];
  return `Sounds ${emotion.toLowerCase()}, ${conf} and ${tr}.`;
}
