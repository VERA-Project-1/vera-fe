import Link from "next/link";
import { AccuracyChart, DistributionChart, F1Chart, GapChart } from "@/components/landing/Charts";
import Credits from "@/components/landing/Credits";
import Figure from "@/components/landing/Figure";
import Publication from "@/components/landing/Publication";
import { ACCENT_BIAS, BEST_MODEL_CONFIG, DATASETS, FIGURES, FUTURE_WORK, GLOSSARY, HEADLINE_STATS, INSIGHTS, MODEL_LINKS, PUBLICATION, WINNER } from "@/lib/research";

const DOMAINS = [
  { icon: "badge", title: "Interview assessment", body: "How composed and assured does a candidate actually sound?" },
  { icon: "support_agent", title: "Sales & customer support", body: "Spot rising tension or eroding trust while the call is still live." },
  { icon: "smart_toy", title: "Human–AI interaction", body: "Give assistants the tone of voice that transcripts throw away." },
];

const PIPELINE: { step: string; title: string; body: string; href?: string }[] = [
  { step: "01", title: "Raw speech", body: "Resampled to 16 kHz mono, normalised, capped at an 8-second window." },
  { step: "02", title: "DistilHuBERT", href: MODEL_LINKS.DistilHuBERT, body: "7-layer CNN encoder + 2 Transformer layers, 768-d. LoRA on q, k, v." },
  { step: "03", title: "Temporal pooling", body: "Variable-length frames → one 768-d utterance vector, dropout 0.2." },
  { step: "04", title: "Two heads", body: "Emotion classifier (4 classes, focal loss γ=2) + VAD regressor (MSE)." },
  { step: "05", title: "Translation layer", body: "Closed-form formulas turn VAD + emotion into Confidence, Trust and Tone." },
];

const TRAINING_CHIPS = ["AdamW · lr 1e-4", "weight decay 0.01", "10 epochs", "batch 8", "λemo = λvad = 0.3", "PyTorch Lightning"];

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 underline decoration-1 underline-offset-4 hover:decoration-2 ${className}`}
    >
      {children}
      <span className="material-symbols-outlined no-underline" style={{ fontSize: "0.9em" }} aria-hidden>
        open_in_new
      </span>
    </a>
  );
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-block text-[12px] md:text-[13px] font-bold uppercase tracking-[0.2em] mb-5 ${
        dark ? "text-[#5095fe]" : "text-secondary"
      }`}
    >
      {children}
    </span>
  );
}

function SectionTitle({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2
      className={`text-[36px] md:text-[56px] leading-[1.02] tracking-[-0.035em] font-extrabold max-w-4xl ${
        dark ? "text-white" : "text-on-surface"
      }`}
    >
      {children}
    </h2>
  );
}

function Waveform() {
  // Deterministic bar heights so server and client render identically.
  const bars = Array.from({ length: 64 }, (_, i) => 18 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)) * 82);
  return (
    <div className="flex items-center gap-[3px] h-24 md:h-32 w-full" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-full bg-gradient-to-t from-[#005cba] to-[#5095fe] animate-wave motion-reduce:animate-none"
          style={{ height: `${h}%`, animationDelay: `${(i % 16) * 90}ms`, opacity: 0.35 + (h / 100) * 0.65 }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#030304] text-white">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(60% 50% at 80% 0%, rgba(80,149,254,0.28), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 pt-20 md:pt-28 pb-16 md:pb-24">
          <a
            href="#publication"
            className="flex w-fit max-w-full items-center gap-2 mb-6 rounded-full border border-white/15 bg-white/[0.06] pl-2 pr-3.5 py-1.5 text-[13px] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-[#09e6a0] text-[#030304] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 14 }} aria-hidden>
                verified
              </span>
              Peer-reviewed
            </span>
            Paper accepted at {PUBLICATION.shortName}
            <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
              arrow_forward
            </span>
          </a>
          <Eyebrow dark>VERA · Voice Emotion &amp; Real-Time Analysis</Eyebrow>
          <h1 className="text-[48px] sm:text-[72px] md:text-[104px] leading-[0.92] tracking-[-0.045em] font-extrabold max-w-6xl animate-fade-in">
            Hear what the words{" "}
            <span className="bg-gradient-to-r from-[#5095fe] to-[#aac7ff] bg-clip-text text-transparent">leave out.</span>
          </h1>
          <p className="mt-8 text-[18px] md:text-[22px] leading-[1.5] text-white/70 max-w-3xl animate-fade-in">
            A deployable speech-emotion system that listens to <em className="not-italic text-white">how</em> something is said —
            and turns it into three numbers people can act on: <strong className="text-white">Confidence</strong>,{" "}
            <strong className="text-white">Trust</strong> and <strong className="text-white">Tone</strong>.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-slide-up">
            <Link
              href="/audio"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-7 py-4 rounded-full text-[16px] font-bold hover:bg-[#d7e3ff] transition-colors"
            >
              Try the live model
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white px-7 py-4 rounded-full text-[16px] font-bold hover:bg-white/10 transition-colors"
            >
              Read the research
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_downward</span>
            </a>
          </div>

          <div className="mt-16 md:mt-20">
            <Waveform />
          </div>

          <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {HEADLINE_STATS.map((s) => (
              <div key={s.label} className="bg-[#030304] p-5 md:p-7">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <div className="text-[40px] md:text-[64px] font-extrabold leading-none tracking-[-0.03em]">{s.value}</div>
                  <div className="mt-3 text-[14px] md:text-[15px] font-bold text-white">{s.label}</div>
                  <div className="mt-1 text-[12px] md:text-[13px] text-white/50 leading-snug">{s.detail}</div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section id="problem" className="scroll-mt-16 max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>The problem</Eyebrow>
            <SectionTitle>
              Voice assistants hear words.
              <br />
              <span className="text-on-surface-variant/60">Not people.</span>
            </SectionTitle>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-5 text-[17px] leading-[1.7] text-on-surface-variant lg:pt-14">
            <p>
              Alexa, Google Assistant and Siri are built on Automatic Speech Recognition — they transcribe what was said and
              discard everything else. But pitch, energy, rhythm and voice quality reveal more about a speaker&apos;s
              psychological state than the words themselves.
            </p>
            <p>
              Most Speech Emotion Recognition research stops at a categorical label. VERA asks a more applied question:{" "}
              <strong className="text-on-surface">how confident, how trustworthy, and in what tone does this person sound?</strong>
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOMAINS.map((d) => (
            <div key={d.title} className="rounded-2xl border border-outline-variant bg-white p-7 hover:border-on-surface transition-colors">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 36 }}>{d.icon}</span>
              <h3 className="mt-5 text-[20px] font-bold tracking-tight">{d.title}</h3>
              <p className="mt-2 text-[15px] text-on-surface-variant leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Architecture ─── */}
      <section className="bg-surface-container-low border-y border-outline-variant/60">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-32">
          <Eyebrow>The system</Eyebrow>
          <SectionTitle>One encoder. Two heads. Three scores.</SectionTitle>
          <p className="mt-6 text-[17px] leading-[1.7] text-on-surface-variant max-w-3xl">
            A self-supervised speech backbone produces a pooled utterance embedding. A classification head names the emotion, a
            regression head places it in Valence–Arousal–Dominance space, and a fixed translation layer turns both into scores a
            listener would recognise.
          </p>

          <ol className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-3">
            {PIPELINE.map((p, i) => (
              <li
                key={p.step}
                className={`relative rounded-2xl p-6 border ${
                  i === PIPELINE.length - 1
                    ? "bg-[#030304] text-white border-[#030304]"
                    : "bg-white border-outline-variant"
                }`}
              >
                <span className={`text-[13px] font-extrabold ${i === PIPELINE.length - 1 ? "text-[#5095fe]" : "text-secondary"}`}>
                  {p.step}
                </span>
                <h3 className="mt-3 text-[18px] font-bold tracking-tight">
                  {p.href ? <ExternalLink href={p.href}>{p.title}</ExternalLink> : p.title}
                </h3>
                <p className={`mt-2 text-[14px] leading-relaxed ${i === PIPELINE.length - 1 ? "text-white/70" : "text-on-surface-variant"}`}>
                  {p.body}
                </p>
                {i < PIPELINE.length - 1 && (
                  <span
                    className="material-symbols-outlined hidden md:block absolute -right-[18px] top-1/2 -translate-y-1/2 z-10 text-[20px] text-outline bg-surface-container-low rounded-full"
                    aria-hidden
                  >
                    chevron_right
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-2">
            {TRAINING_CHIPS.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full bg-white border border-outline-variant text-[13px] font-semibold text-on-surface-variant">
                {c}
              </span>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-4">
            <Figure {...FIGURES.architecture} label="Figure 1" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <Figure {...FIGURES.flow} label="Figure 2" className="lg:col-span-8" />
              <div className="lg:col-span-4 rounded-2xl bg-white border border-outline-variant p-6 md:p-7">
                <h3 className="text-[18px] font-bold tracking-tight">Reading the flow</h3>
                <ol className="mt-4 flex flex-col gap-4 text-[14px] leading-relaxed text-on-surface-variant">
                  <li>
                    <strong className="text-on-surface">Normalise the input.</strong> Anything that isn&apos;t already 16 kHz
                    mono WAV is converted first, so every clip reaches the model in the same shape.
                  </li>
                  <li>
                    <strong className="text-on-surface">Keep the first 8 seconds.</strong> Audio is pre-emphasised,
                    normalised and truncated — the model only hears this window.
                  </li>
                  <li>
                    <strong className="text-on-surface">Listen once, answer twice.</strong> One backbone pass feeds both
                    heads: an emotion label and Valence–Arousal–Dominance scores.
                  </li>
                  <li>
                    <strong className="text-on-surface">Aggregate.</strong> Emotion and VAD are combined into Confidence and
                    Trust and returned as one result you can download.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Data ─── */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-32">
        <Eyebrow>The data</Eyebrow>
        <SectionTitle>Acted drama vs. real conversation.</SectionTitle>
        <p className="mt-6 text-[17px] leading-[1.7] text-on-surface-variant max-w-3xl">
          Both corpora were consolidated to four emotions — e.g. frustrated → Angry, excited → Happy — and VAD ratings min-max
          normalised to [0, 1]. Audio is pre-emphasised (α = 0.97), resampled to 16 kHz mono, peak- and loudness-normalised.
        </p>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DATASETS.map((d) => (
            <div key={d.name} className="rounded-2xl border border-outline-variant bg-white p-7 md:p-9">
              <div className="text-[13px] font-bold uppercase tracking-[0.14em] text-secondary">{d.tagline}</div>
              <h3 className="mt-2 text-[32px] font-extrabold tracking-tight">
                <ExternalLink href={d.url}>{d.name}</ExternalLink>
              </h3>
              <dl className="mt-6 grid grid-cols-3 gap-4">
                {d.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <div className="text-[26px] md:text-[36px] font-extrabold leading-none tracking-tight">{s.value}</div>
                      <div className="mt-2 text-[12px] md:text-[13px] text-on-surface-variant leading-snug">{s.label}</div>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-[15px] leading-relaxed text-on-surface-variant">{d.body}</p>
              <ExternalLink href={d.url} className="mt-4 text-[14px] font-semibold text-secondary">
                Official dataset page
              </ExternalLink>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border-2 border-[#ca8a04] bg-warning-container/50 p-6 md:p-8 flex flex-col md:flex-row gap-5">
          <span className="material-symbols-outlined text-[#a16207] shrink-0" style={{ fontSize: 40 }} aria-hidden>
            record_voice_over
          </span>
          <div>
            <h3 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-on-surface">Known limitation: {ACCENT_BIAS.title}</h3>
            <p className="mt-2 text-[15px] md:text-[16px] leading-relaxed text-on-surface">{ACCENT_BIAS.body}</p>
          </div>
        </div>

        <div className="mt-4">
          <DistributionChart />
        </div>
      </section>

      {/* ─── Results ─── */}
      <section id="results" className="bg-surface-container-low border-y border-outline-variant/60">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-32">
          <Eyebrow>The results</Eyebrow>
          <SectionTitle>101 runs. One clear winner.</SectionTitle>
          <p className="mt-6 text-[17px] leading-[1.7] text-on-surface-variant max-w-3xl">
            Two pretrained speech models were trained in different ways and on different datasets, then scored on clips they had
            never heard. Here is what held up.
          </p>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Winner */}
            <div className="lg:col-span-5 rounded-2xl bg-[#030304] text-white p-7 md:p-9 flex flex-col">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-[#aac7ff]">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
                  trophy
                </span>
                The winner
              </div>
              <h3 className="mt-5 text-[40px] md:text-[48px] font-extrabold leading-none tracking-[-0.03em]">{WINNER.model}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">{WINNER.summary}</p>
              <ExternalLink href={WINNER.url} className="mt-4 self-start text-[14px] font-semibold text-[#aac7ff]">
                ntu-spml/distilhubert on Hugging Face
              </ExternalLink>
              <dl className="mt-auto pt-8 grid grid-cols-3 gap-4">
                {WINNER.stats.map((st) => (
                  <div key={st.label}>
                    <dt className="sr-only">{st.label}</dt>
                    <dd>
                      <div className="text-[26px] md:text-[32px] font-extrabold leading-none">{st.value}</div>
                      <div className="mt-2 text-[12px] text-white/60 leading-snug">{st.label}</div>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Glossary */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-outline-variant p-7 md:p-9">
              <h3 className="text-[20px] font-bold tracking-tight">New to these terms?</h3>
              <p className="text-[14px] text-on-surface-variant mt-1">Everything the charts below use, in plain language.</p>
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {GLOSSARY.map((g) => (
                  <div key={g.term}>
                    <dt className="text-[14px] font-bold text-on-surface">{g.term}</dt>
                    <dd className="text-[14px] leading-relaxed text-on-surface-variant mt-0.5">
                      {g.definition}
                      {g.links && (
                        <span className="flex flex-wrap gap-x-4 mt-1">
                          {g.links.map((l) => (
                            <ExternalLink key={l.href} href={l.href} className="font-semibold text-secondary">
                              {l.label}
                            </ExternalLink>
                          ))}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <h3 className="mt-16 text-[22px] md:text-[28px] font-extrabold tracking-tight">Under the hood of the deployed model</h3>
          <p className="mt-2 text-[15px] text-on-surface-variant max-w-3xl">
            The model behind the live demo: DistilHuBERT with LoRA adapters, trained on 30 hours of MSP-Podcast. Only about
            42 thousand weights were trained.
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <Figure {...FIGURES.hubertLora} label="Figure 3" className="lg:col-span-7" />
            <div className="lg:col-span-5 rounded-2xl bg-white border border-outline-variant p-6 md:p-7">
              <h4 className="text-[18px] font-bold tracking-tight">Configuration</h4>
              <div className="mt-4 flex flex-col gap-5">
                {BEST_MODEL_CONFIG.map((g) => (
                  <table key={g.group} className="w-full text-[14px]">
                    <caption className="text-left text-[12px] font-bold uppercase tracking-[0.14em] text-secondary pb-2">{g.group}</caption>
                    <tbody>
                      {g.rows.map((r) => (
                        <tr key={r.label} className="border-t border-outline-variant/60">
                          <th scope="row" className="py-2 pr-4 text-left font-medium text-on-surface-variant">
                            {r.label}
                          </th>
                          <td className="py-2 text-right font-bold text-on-surface tabular-nums">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
              </div>
            </div>
          </div>

          <h3 className="mt-16 text-[22px] md:text-[28px] font-extrabold tracking-tight">How every configuration compared</h3>
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <AccuracyChart />
            <GapChart />
          </div>
          <div className="mt-4">
            <F1Chart />
          </div>
        </div>
      </section>

      {/* ─── Insights ─── */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-32">
        <Eyebrow>What we learned</Eyebrow>
        <SectionTitle>No single configuration wins everywhere.</SectionTitle>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {INSIGHTS.map((ins) => (
            <article key={ins.title} className="rounded-2xl border border-outline-variant bg-white p-7 flex flex-col">
              <div className="text-[40px] md:text-[48px] font-extrabold leading-none tracking-[-0.03em] text-on-surface">
                {ins.figure}
              </div>
              <h3 className="mt-5 text-[18px] font-bold tracking-tight">{ins.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">{ins.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>What&apos;s next</Eyebrow>
            <h3 className="text-[28px] md:text-[40px] leading-[1.05] tracking-[-0.03em] font-extrabold">
              47% on four emotions is a foundation, not a ceiling.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-on-surface-variant">
              Models trained on acted speech generalise poorly to spontaneous conversation, Neutral remains hard for every
              backbone, and because both corpora are mostly American-English speech, other accents are read less reliably.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FUTURE_WORK.map((f) => (
              <div key={f.title} className="rounded-2xl bg-surface-container-low border border-outline-variant/60 p-6">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 28 }}>{f.icon}</span>
                <h4 className="mt-4 text-[16px] font-bold">{f.title}</h4>
                <p className="mt-2 text-[14px] leading-relaxed text-on-surface-variant">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-[#030304] text-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div>
            <Eyebrow dark>Live model</Eyebrow>
            <h2 className="text-[44px] md:text-[80px] leading-[0.95] tracking-[-0.045em] font-extrabold max-w-4xl">
              Hear it for yourself.
            </h2>
            <p className="mt-6 text-[17px] text-white/60 max-w-xl">
              Record a few seconds of speech or upload a clip. The deployed DistilHuBERT model returns emotion, VAD, Confidence
              and Trust in real time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/audio"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-7 py-4 rounded-full text-[16px] font-bold hover:bg-[#d7e3ff] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mic</span>
              Analyse audio
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Team & credits ─── */}
      <div className="bg-surface-container-low border-t border-outline-variant/60">
        <Publication />
      </div>

      <Credits />
    </div>
  );
}
