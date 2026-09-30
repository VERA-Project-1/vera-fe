// Figures from the VERA paper and docs/VERA_Research_Insights.docx (vera-system-models).
// Every number rendered on the landing page comes from here.

export type Emotion = "Sad" | "Angry" | "Neutral" | "Happy";

// Series order is the validated categorical slot order (blue, orange, aqua, yellow);
// keep it when rendering so adjacent colors stay colorblind-distinguishable.
export const EMOTIONS: Emotion[] = ["Sad", "Angry", "Neutral", "Happy"];

export const EMOTION_COLOR: Record<Emotion, string> = {
  Sad: "var(--viz-sad)",
  Angry: "var(--viz-angry)",
  Neutral: "var(--viz-neutral)",
  Happy: "var(--viz-happy)",
};

// Ink for a label placed inside a filled segment, chosen by the fill's luminance.
export const EMOTION_INK: Record<Emotion, string> = {
  Sad: "#ffffff",
  Angry: "#0b0b0b",
  Neutral: "#0b0b0b",
  Happy: "#0b0b0b",
};

export const HEADLINE_STATS = [
  { value: "101", label: "tracked training runs", detail: "Across backbones, fine-tuning strategies and datasets (Weights & Biases)" },
  { value: "47.3%", label: "test accuracy, 4 emotions", detail: "DistilHuBERT on MSP-Podcast — 1.9× the 25% chance rate" },
  { value: "0.468", label: "best macro F1", detail: "Frozen DistilHuBERT — the most balanced across all four emotions" },
  { value: "0.17%", label: "of parameters trained", detail: "LoRA r=2 adapts ~42K weights of a ~24M-parameter encoder" },
];

export type Family = "DistilHuBERT" | "Emotion2Vec";

export interface RunResult {
  model: Family;
  config: string;
  dataset: string;
  epochs: number;
  test: number;
  train: number;
}

// Table 1 / Table 3 — best completed run per configuration (Wav2Vec2 excluded: no test eval logged).
export const RUNS: RunResult[] = [
  { model: "DistilHuBERT", config: "LoRA adapters", dataset: "MSP-Podcast 30h", epochs: 10, test: 47.3, train: 50.9 },
  { model: "DistilHuBERT", config: "Small LoRA adapters", dataset: "MSP-Podcast 30h", epochs: 10, test: 47.3, train: 57.0 },
  { model: "DistilHuBERT", config: "Frozen encoder", dataset: "MSP-Podcast 12h", epochs: 10, test: 47.2, train: 55.3 },
  { model: "DistilHuBERT", config: "Small LoRA adapters", dataset: "MSP-Podcast 12h", epochs: 10, test: 45.0, train: 58.9 },
  { model: "DistilHuBERT", config: "Larger LoRA adapters", dataset: "MSP-Podcast 12h", epochs: 10, test: 43.3, train: 61.2 },
  { model: "DistilHuBERT", config: "LoRA, key projection skipped", dataset: "MSP-Podcast 12h", epochs: 10, test: 41.5, train: 61.0 },
  { model: "DistilHuBERT", config: "Fully retrained", dataset: "MSP-Podcast 12h", epochs: 10, test: 35.8, train: 82.3 },
  { model: "Emotion2Vec", config: "Frozen encoder + LoRA", dataset: "IEMOCAP", epochs: 50, test: 38.2, train: 42.2 },
  { model: "Emotion2Vec", config: "Frozen encoder + LoRA", dataset: "IEMOCAP", epochs: 10, test: 31.8, train: 32.6 },
  { model: "Emotion2Vec", config: "Frozen encoder + LoRA", dataset: "MSP-Podcast 30h", epochs: 10, test: 25.2, train: 27.9 },
];

export const CHANCE_ACCURACY = 25;

// Table 2 — per-emotion F1 on the test split.
export const F1_RESULTS: { model: string; dataset: string; f1: Record<Emotion, number>; macro: number }[] = [
  { model: "DistilHuBERT · Frozen encoder", dataset: "MSP-Podcast 12h", f1: { Angry: 0.488, Happy: 0.56, Neutral: 0.394, Sad: 0.427 }, macro: 0.468 },
  { model: "DistilHuBERT · LoRA adapters", dataset: "MSP-Podcast 30h", f1: { Angry: 0.615, Happy: 0.181, Neutral: 0.344, Sad: 0.52 }, macro: 0.415 },
  { model: "Emotion2Vec", dataset: "IEMOCAP", f1: { Angry: 0.378, Happy: 0.382, Neutral: 0.277, Sad: 0.49 }, macro: 0.382 },
  { model: "Emotion2Vec", dataset: "MSP-Podcast 30h", f1: { Angry: 0.296, Happy: 0.156, Neutral: 0.093, Sad: 0.409 }, macro: 0.239 },
];

// Test-split support per class (confusion-matrix tables, §4 of the insights doc).
export const CLASS_SUPPORT: { dataset: string; note: string; counts: Record<Emotion, number> }[] = [
  { dataset: "IEMOCAP", note: "Acted, studio-recorded", counts: { Angry: 551, Happy: 442, Neutral: 384, Sad: 245 } },
  { dataset: "MSP-Podcast 30h", note: "Spontaneous podcast speech", counts: { Angry: 2627, Happy: 935, Neutral: 3278, Sad: 3354 } },
];

export const DATASETS = [
  {
    name: "IEMOCAP",
    url: "https://sail.usc.edu/iemocap/",
    tagline: "Controlled · studio-recorded · acted",
    stats: [
      { value: "~12 h", label: "audiovisual recordings" },
      { value: "10", label: "professional actors (5F / 5M)" },
      { value: "4", label: "annotators per utterance" },
    ],
    body: "USC SAIL's dyadic corpus of scripted and improvised scenes — the most-cited SER benchmark, appearing in 30 of 39 English-language SER studies in a recent survey.",
  },
  {
    name: "MSP-Podcast",
    url: "https://www.lab-msp.com/MSP/MSP-Podcast.html",
    tagline: "Large-scale · real-world · spontaneous",
    stats: [
      { value: "~409 h", label: "of podcast speech" },
      { value: "3,641", label: "unique speakers" },
      { value: "267,905", label: "speaking turns, 2.7–11 s" },
    ],
    body: "Natural conversation from 6,007 podcasts, each turn labelled with primary and secondary emotions plus dimensional VAD ratings by 5 annotators.",
  },
];

export const MODEL_LINKS = {
  DistilHuBERT: "https://huggingface.co/ntu-spml/distilhubert",
  Emotion2Vec: "https://huggingface.co/emotion2vec",
};

// Both training corpora are dominated by American-English speakers; shown on the landing and audio pages.
export const ACCENT_BIAS = {
  title: "Biased toward American-English accents",
  body:
    "Both training datasets are predominantly American-English speech — IEMOCAP was recorded by 10 actors at USC, and MSP-Podcast is drawn mostly from US podcasts. VERA is therefore most reliable on American-English speakers. For other accents, accent-specific pitch, rhythm and stress patterns can be misread as emotional cues, so emotion labels and scores are less reliable.",
};

export const WINNER = {
  model: "DistilHuBERT",
  url: MODEL_LINKS.DistilHuBERT,
  summary:
    "A compact speech model (2 Transformer layers) pretrained on 960 hours of audiobooks. With its encoder frozen or lightly adapted, it beat every Emotion2Vec setup on real podcast speech.",
  stats: [
    { value: "47.3%", label: "accuracy on new clips" },
    { value: "0.468", label: "macro F1 (most balanced)" },
    { value: "0.17%", label: "of weights trained" },
  ],
};

// Diagrams from the final presentation deck; served from public/research/.
export const FIGURES = {
  architecture: {
    src: "/research/system-architecture.png",
    width: 1956,
    height: 666,
    title: "System architecture",
    caption:
      "Audio passes through the SDK (sampling, noise cleaning, model API) into a fine-tuned base model whose classification head gives the tone and whose regression head gives VAD values, which become Confidence and Trust.",
  },
  flow: {
    src: "/research/flow-chart.png",
    width: 1536,
    height: 1024,
    title: "Request flow",
    caption:
      "What happens to one upload: convert to 16 kHz mono WAV if needed, preprocess and truncate to 8 s, extract features, pool, then decode the emotion and VAD in parallel and aggregate the result.",
  },
  hubertLora: {
    src: "/research/hubert-lora-architecture.png",
    width: 2048,
    height: 600,
    title: "DistilHuBERT + LoRA",
    caption:
      "LoRA adapters sit on the query, key and value projections of the frozen encoder. Its output splits into two parallel heads, trained jointly.",
  },
};

// Hyperparameters of the deployed model (DistilHuBERT + LoRA on MSP-Podcast 30h), from the deck.
export const BEST_MODEL_CONFIG: { group: string; rows: { label: string; value: string }[] }[] = [
  {
    group: "Performance",
    rows: [
      { label: "Test accuracy", value: "47.3%" },
      { label: "Validation accuracy", value: "42.1%" },
      { label: "Train accuracy", value: "50.9%" },
      { label: "Macro F1", value: "0.415" },
    ],
  },
  {
    group: "LoRA",
    rows: [
      { label: "Rank (r)", value: "2" },
      { label: "Alpha", value: "4" },
      { label: "Alpha / r", value: "2" },
      { label: "Dropout", value: "0.1" },
      { label: "Target modules", value: "q_proj, k_proj, v_proj" },
      { label: "Trainable parameters", value: "≈42K" },
    ],
  },
  {
    group: "Training",
    rows: [
      { label: "Learning rate", value: "5e-5" },
      { label: "Batch size", value: "8" },
      { label: "Epochs", value: "10" },
      { label: "Weight decay", value: "0.01" },
      { label: "Emotion loss weight", value: "0.3" },
      { label: "VAD loss weight", value: "0.3" },
    ],
  },
];

export const PUBLICATION = {
  status: "Accepted after peer review",
  conference: "4th International Conference on Sustainability Innovation in Computing and Engineering",
  shortName: "ICSICE-2026",
  organizer: "Vasantdada Patil Pratishthan's College of Engineering & Visual Arts, Mumbai",
  dates: "17–18 April 2026",
  tracks: ["Green Computing & Sustainable Software", "IoT, Sensors & Smart Systems", "AI, Blockchain & Engineering Technologies"],
  photo: { src: "/research/icsice-2026-team.jpg", width: 1242, height: 864 },
};

// Plain-language definitions for the results section.
export const GLOSSARY: { term: string; definition: string; links?: { label: string; href: string }[] }[] = [
  { term: "Test accuracy", definition: "Share of never-before-heard clips labelled correctly. With four emotions, random guessing scores 25%." },
  { term: "Train vs. test gap", definition: "Accuracy on practice clips minus accuracy on new ones. A big gap means the model memorised instead of learning." },
  { term: "F1 score", definition: "For one emotion: how well the model catches it without false alarms. 0 is useless, 1 is perfect." },
  { term: "Macro F1", definition: "The average F1 over all four emotions — rewards being good at every emotion, not just the common ones." },
  { term: "Frozen encoder", definition: "The pretrained speech model is left untouched; only the small emotion and VAD heads on top are trained." },
  { term: "LoRA adapters", definition: "Tiny trainable add-ons (~0.2% of weights) bolted onto the pretrained model instead of retraining it." },
  { term: "Fully retrained", definition: "Every weight in the pretrained model is allowed to change. Powerful, but it memorises small datasets." },
  {
    term: "DistilHuBERT · Emotion2Vec",
    definition: "The two pretrained speech models compared — the “ears” that turn raw audio into features.",
    links: [
      { label: "DistilHuBERT", href: MODEL_LINKS.DistilHuBERT },
      { label: "Emotion2Vec", href: MODEL_LINKS.Emotion2Vec },
    ],
  },
];

export const INSIGHTS = [
  {
    figure: "0.181 → 0.560",
    title: "Freezing beats LoRA on balance",
    body: "Identical accuracy (47.2% vs 47.3%), but freezing the encoder lifts Happy F1 threefold. LoRA amplifies bias toward frequent classes; frozen features protect minority emotions.",
  },
  {
    figure: "+46.5 pp",
    title: "Full fine-tuning memorises",
    body: "Unfreezing the whole backbone hits 82.3% train accuracy but only 35.8% on test — train loss collapses to 0.023. Constrained adaptation is essential on small emotion datasets.",
  },
  {
    figure: "−13 pp",
    title: "Acted speech doesn't transfer",
    body: "Emotion2Vec drops from 38.2% on IEMOCAP to 25.2% on MSP-Podcast and predicts “Happy” for 52.9% of all test clips — a classic label-shift collapse.",
  },
  {
    figure: "0.394",
    title: "Neutral is the hardest emotion",
    body: "The best Neutral F1 in any run. Neutral speech lacks strong cues and overlaps acoustically with its neighbours; Emotion2Vec on MSP-Podcast manages just 0.093.",
  },
  {
    figure: "+3.5 pp",
    title: "Adapt the key projection",
    body: "LoRA on k, q and v beats q, v only. A conservative α/r = 2.0 also beats α/r = 4.0 at matched rank on every dataset tested.",
  },
  {
    figure: "3.4×",
    title: "Cheapest is also best",
    body: "Freeze-base delivers 74.1 accuracy-points per compute hour — 3.4× the LoRA runs on the same data, with the fewest trainable parameters.",
  },
];

export const FUTURE_WORK = [
  { icon: "graphic_eq", title: "Prosody-aware pretraining", body: "Fold Task-Adaptive and Prosody-Aware Pretraining (P-TAPT) into the production pipeline." },
  { icon: "subject", title: "Multimodal fusion", body: "Accept transcript text alongside audio so words and voice are read together." },
  { icon: "dataset", title: "Cross-corpus training", body: "Train across CREMA-D, RAVDESS and MSP-IMPROV to cut overfitting and generalise further." },
];
