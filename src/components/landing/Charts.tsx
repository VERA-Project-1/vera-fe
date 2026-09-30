"use client";

import { useCallback, useRef, useState } from "react";
import {
  CHANCE_ACCURACY,
  CLASS_SUPPORT,
  EMOTIONS,
  EMOTION_COLOR,
  EMOTION_INK,
  F1_RESULTS,
  RUNS,
  type Family,
} from "@/lib/research";

// ─── Shared chrome ───

interface TipState {
  x: number;
  y: number;
  value: string;
  label: string;
  extra?: string;
}

function useTooltip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const bind = useCallback(
    (content: Omit<TipState, "x" | "y">) => {
      const show = (e: React.SyntheticEvent<HTMLElement>) => {
        const box = containerRef.current?.getBoundingClientRect();
        const mark = e.currentTarget.getBoundingClientRect();
        if (!box) return;
        setTip({ ...content, x: mark.left - box.left + mark.width / 2, y: mark.top - box.top });
      };
      return {
        tabIndex: 0,
        onPointerEnter: show,
        onFocus: show,
        onPointerLeave: () => setTip(null),
        onBlur: () => setTip(null),
      };
    },
    []
  );

  const tooltip = tip && (
    <div
      role="status"
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full -mt-2 rounded-lg bg-[#1a1c1d] px-3 py-2 text-white shadow-lg whitespace-nowrap"
      style={{ left: tip.x, top: tip.y - 6 }}
    >
      <div className="text-[15px] font-bold leading-tight">{tip.value}</div>
      <div className="text-[12px] text-white/70">{tip.label}</div>
      {tip.extra && <div className="text-[12px] text-white/70">{tip.extra}</div>}
    </div>
  );

  return { containerRef, bind, tooltip };
}

function ChartCard({
  title,
  subtitle,
  takeaway,
  legend,
  table,
  children,
}: {
  title: string;
  subtitle: string;
  takeaway: string;
  legend?: React.ReactNode;
  table: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className="viz-root bg-white border border-outline-variant rounded-2xl p-5 md:p-8 flex flex-col gap-5">
      <figcaption>
        <h3 className="text-[20px] md:text-[22px] font-bold tracking-tight text-on-surface">{title}</h3>
        <p className="text-[14px] text-on-surface-variant mt-1">{subtitle}</p>
      </figcaption>
      <p className="flex gap-2 rounded-xl bg-[#f4f8fd] border border-[#d7e3ff] px-4 py-3 text-[14px] leading-relaxed text-on-surface">
        <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: 20 }} aria-hidden>
          lightbulb
        </span>
        <span>
          <strong>What this shows:</strong> {takeaway}
        </span>
      </p>
      {legend}
      {children}
      <details className="group text-[13px] border-t border-surface-container-high pt-4">
        <summary className="cursor-pointer select-none text-on-surface-variant hover:text-on-surface font-semibold inline-flex items-center gap-1">
          <span className="material-symbols-outlined transition-transform group-open:rotate-90" style={{ fontSize: 18 }} aria-hidden>
            chevron_right
          </span>
          Show the exact numbers
        </summary>
        <div className="mt-3 overflow-x-auto rounded-xl border border-outline-variant">{table}</div>
      </details>
    </figure>
  );
}

function Legend({ items }: { items: { label: string; color: string; shape?: "bar" | "dot" }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-on-surface-variant">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            className={item.shape === "dot" ? "w-2.5 h-2.5 rounded-full" : "w-3 h-3 rounded-[3px]"}
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

const isNumeric = (cell: string | number) => typeof cell === "number" || /^[+−-]?\d[\d.,]*\s?(%|pp)?(\s\(.*\))?$/.test(cell);

function DataTable({ head, rows, highlight }: { head: string[]; rows: (string | number)[][]; highlight?: number }) {
  // Right-align a column when its body cells are numbers.
  const numericCol = head.map((_, j) => rows.every((r) => isNumeric(r[j])));
  return (
    <table className="w-full tabular-nums border-collapse text-[13px]">
      <thead>
        <tr className="bg-surface-container-low text-on-surface-variant">
          {head.map((h, j) => (
            <th
              key={h}
              className={`px-3 py-2.5 font-bold whitespace-nowrap border-b border-outline-variant ${numericCol[j] ? "text-right" : "text-left"}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            className={`${i === highlight ? "bg-[#f4f8fd] font-bold" : i % 2 ? "bg-surface-container-low/60" : "bg-white"} border-b border-surface-container-high last:border-0`}
          >
            {row.map((cell, j) => (
              <td key={j} className={`px-3 py-2.5 whitespace-nowrap text-on-surface ${numericCol[j] ? "text-right" : "text-left"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Axis({ ticks, format }: { ticks: number[]; format: (t: number) => string }) {
  const max = ticks[ticks.length - 1];
  return (
    <div className="relative h-5 text-[11px] text-[var(--viz-muted)] tabular-nums">
      {ticks.map((t) => (
        <span key={t} className="absolute -translate-x-1/2" style={{ left: `${(t / max) * 100}%` }}>
          {format(t)}
        </span>
      ))}
    </div>
  );
}

function Gridlines({ ticks }: { ticks: number[] }) {
  const max = ticks[ticks.length - 1];
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {ticks.map((t) => (
        <span
          key={t}
          className="absolute top-0 bottom-0 w-px"
          style={{ left: `${(t / max) * 100}%`, background: t === 0 ? "var(--viz-baseline)" : "var(--viz-grid)" }}
        />
      ))}
    </div>
  );
}

const runLabel = (r: (typeof RUNS)[number]) =>
  `${r.model} · ${r.config}${r.epochs !== 10 ? ` · ${r.epochs} ep` : ""}`;

const FAMILY_COLOR: Record<Family, string> = {
  DistilHuBERT: "var(--viz-accent)",
  Emotion2Vec: "var(--viz-deemph)",
};

// ─── Test accuracy by configuration ───

export function AccuracyChart() {
  const { containerRef, bind, tooltip } = useTooltip();
  const ticks = [0, 25, 50, 75, 100];
  const rows = [...RUNS].sort((a, b) => b.test - a.test);

  return (
    <ChartCard
      title="How often each setup gets the emotion right"
      subtitle="Accuracy on clips the model never heard during training, best run per setup. The dark vertical line is random guessing (25%)."
      takeaway="DistilHuBERT's best setups reach ~47% — almost double random guessing — while Emotion2Vec tops out at 38% and falls to near-guessing on real podcasts."
      legend={
        <Legend
          items={[
            { label: "DistilHuBERT", color: FAMILY_COLOR.DistilHuBERT },
            { label: "Emotion2Vec", color: FAMILY_COLOR.Emotion2Vec },
          ]}
        />
      }
      table={
        <DataTable
          head={["Speech model", "Training setup", "Dataset", "Passes over data", "Accuracy on new clips"]}
          rows={rows.map((r) => [r.model, r.config, r.dataset, r.epochs, `${r.test.toFixed(1)}%`])}
          highlight={0}
        />
      }
    >
      <div ref={containerRef} className="relative">
        <div className="flex flex-col gap-3.5">
          {rows.map((r, i) => (
            <div key={i}>
              <div className="text-[12px] md:text-[13px] text-on-surface-variant mb-1">
                <span className="font-semibold text-on-surface">{r.model}</span> · {r.config}
                {r.epochs !== 10 && ` · ${r.epochs} ep`} <span className="opacity-70">— {r.dataset}</span>
              </div>
              <div className="relative h-[18px]">
                <Gridlines ticks={ticks} />
                <div
                  {...bind({ value: `${r.test.toFixed(1)}%`, label: runLabel(r), extra: r.dataset })}
                  className="relative h-full rounded-r-[4px] outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-secondary"
                  style={{ width: `${r.test}%`, background: FAMILY_COLOR[r.model] }}
                  aria-label={`${runLabel(r)}, ${r.dataset}: ${r.test}%`}
                />
                <span
                  className="absolute -top-[3px] -bottom-[3px] w-[2px] bg-[var(--viz-ref)] pointer-events-none"
                  style={{ left: `${CHANCE_ACCURACY}%` }}
                  aria-hidden
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 ml-2 text-[13px] font-bold text-on-surface tabular-nums"
                  style={{ left: `${r.test}%` }}
                >
                  {r.test.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Axis ticks={ticks} format={(t) => `${t}%`} />
        </div>
        <div className="text-[11px] text-[var(--viz-muted)] mt-1" style={{ paddingLeft: `calc(${CHANCE_ACCURACY}% + 6px)` }}>
          ↑ chance (25%)
        </div>
        {tooltip}
      </div>
    </ChartCard>
  );
}

// ─── Train vs test: the generalization gap ───

export function GapChart() {
  const { containerRef, bind, tooltip } = useTooltip();
  const ticks = [0, 25, 50, 75, 100];
  const rows = [...RUNS].sort((a, b) => a.train - a.test - (b.train - b.test));

  return (
    <ChartCard
      title="Did it learn, or just memorise?"
      subtitle="Grey dot: accuracy on the practice (training) clips. Blue dot: accuracy on new clips. The number on the right is the gap — smaller is healthier."
      takeaway="Fully retraining the model scores 82% on practice clips but only 36% on new ones — it memorised. The frozen encoder and the LoRA runs on the larger 30-hour dataset keep the gap under 10 points."
      legend={
        <Legend
          items={[
            { label: "New clips (test)", color: "var(--viz-accent)", shape: "dot" },
            { label: "Practice clips (train)", color: "var(--viz-deemph)", shape: "dot" },
          ]}
        />
      }
      table={
        <DataTable
          head={["Speech model", "Training setup", "Dataset", "Practice clips", "New clips", "Gap"]}
          rows={rows.map((r) => [
            r.model,
            r.config,
            r.dataset,
            `${r.train.toFixed(1)}%`,
            `${r.test.toFixed(1)}%`,
            `+${(r.train - r.test).toFixed(1)} pp`,
          ])}
        />
      }
    >
      <div ref={containerRef} className="relative">
        <div className="flex flex-col gap-4">
          {rows.map((r, i) => {
            const gap = r.train - r.test;
            const worst = gap > 30;
            return (
              <div key={i}>
                <div className="flex justify-between gap-3 text-[12px] md:text-[13px] text-on-surface-variant mb-1.5">
                  <span>
                    <span className="font-semibold text-on-surface">{r.model}</span> · {r.config}
                    {r.epochs !== 10 && ` · ${r.epochs} ep`} <span className="opacity-70">— {r.dataset}</span>
                  </span>
                  <span className={`shrink-0 whitespace-nowrap tabular-nums font-bold ${worst ? "text-error" : "text-on-surface"}`}>
                    +{gap.toFixed(1)} pp
                  </span>
                </div>
                <div className="relative h-4">
                  <Gridlines ticks={ticks} />
                  <span
                    className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--viz-baseline)]"
                    style={{ left: `${r.test}%`, width: `${gap}%` }}
                    aria-hidden
                  />
                  {[
                    { v: r.test, color: "var(--viz-accent)", name: "New clips" },
                    { v: r.train, color: "var(--viz-deemph)", name: "Practice clips" },
                  ].map((p) => (
                    <span
                      key={p.name}
                      {...bind({ value: `${p.v.toFixed(1)}%`, label: `${p.name} · ${runLabel(r)}`, extra: r.dataset })}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                      style={{ left: `${p.v}%` }}
                      aria-label={`${p.name} accuracy, ${runLabel(r)}: ${p.v}%`}
                    >
                      <span className="w-3 h-3 rounded-full ring-2 ring-white" style={{ background: p.color }} />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2">
          <Axis ticks={ticks} format={(t) => `${t}%`} />
        </div>
        {tooltip}
      </div>
    </ChartCard>
  );
}

// ─── Per-emotion F1, small multiples ───

export function F1Chart() {
  const { containerRef, bind, tooltip } = useTooltip();
  const max = 0.7;

  return (
    <ChartCard
      title="Which emotions each model gets right"
      subtitle="F1 score per emotion, from 0 (never right) to 1 (perfect). The big number is the average across all four — higher means more even-handed."
      takeaway="The frozen-encoder DistilHuBERT is the most even-handed. The LoRA version is best at Angry and Sad but misses most Happy clips (0.18), and every model struggles with Neutral."
      legend={<Legend items={EMOTIONS.map((e) => ({ label: e, color: EMOTION_COLOR[e] }))} />}
      table={
        <DataTable
          head={["Model", "Dataset", ...EMOTIONS.map((e) => `${e} F1`), "Average (macro F1)"]}
          rows={F1_RESULTS.map((r) => [
            r.model,
            r.dataset,
            ...EMOTIONS.map((e) => r.f1[e].toFixed(3)),
            r.macro.toFixed(3),
          ])}
          highlight={0}
        />
      }
    >
      <div ref={containerRef} className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        {F1_RESULTS.map((r, i) => (
          <div
            key={r.model + r.dataset}
            className={`rounded-xl border p-4 ${i === 0 ? "border-[var(--viz-accent)] bg-[#f4f8fd]" : "border-surface-container-high"}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[14px] font-bold text-on-surface leading-tight">{r.model}</div>
                <div className="text-[12px] text-on-surface-variant">{r.dataset}</div>
              </div>
              <div className="text-right">
                <div className="text-[28px] font-extrabold leading-none text-on-surface">{r.macro.toFixed(3)}</div>
                <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">average F1</div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {EMOTIONS.map((e) => (
                <div key={e} className="grid grid-cols-[56px_1fr] items-center gap-2">
                  <span className="text-[12px] text-on-surface-variant">{e}</span>
                  <div className="flex items-center gap-2">
                    <div
                      {...bind({ value: r.f1[e].toFixed(3), label: `${e} F1 · ${r.model}`, extra: r.dataset })}
                      className="h-[14px] rounded-r-[4px] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-secondary"
                      style={{ width: `${(r.f1[e] / max) * 100}%`, background: EMOTION_COLOR[e] }}
                      aria-label={`${e} F1 for ${r.model}, ${r.dataset}: ${r.f1[e]}`}
                    />
                    <span className="text-[12px] font-semibold text-on-surface tabular-nums">{r.f1[e].toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {tooltip}
      </div>
    </ChartCard>
  );
}

// ─── Class distribution shift between corpora ───

export function DistributionChart() {
  const { containerRef, bind, tooltip } = useTooltip();

  return (
    <ChartCard
      title="Same four emotions, very different mix"
      subtitle="Share of each emotion among the test clips of each dataset."
      takeaway="Real podcasts are mostly Neutral and Sad (65%); acted IEMOCAP is mostly Angry and Happy (61%). A model trained on one expects the wrong mix on the other."
      legend={<Legend items={EMOTIONS.map((e) => ({ label: e, color: EMOTION_COLOR[e] }))} />}
      table={
        <DataTable
          head={["Dataset", ...EMOTIONS.map((e) => `${e} clips`), "Total clips"]}
          rows={CLASS_SUPPORT.map((d) => {
            const total = EMOTIONS.reduce((s, e) => s + d.counts[e], 0);
            return [
              d.dataset,
              ...EMOTIONS.map((e) => `${d.counts[e].toLocaleString()} (${((d.counts[e] / total) * 100).toFixed(1)}%)`),
              total.toLocaleString(),
            ];
          })}
        />
      }
    >
      <div ref={containerRef} className="relative flex flex-col gap-6">
        {CLASS_SUPPORT.map((d) => {
          const total = EMOTIONS.reduce((s, e) => s + d.counts[e], 0);
          return (
            <div key={d.dataset}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[14px] font-bold text-on-surface">{d.dataset}</span>
                <span className="text-[12px] text-on-surface-variant">
                  {d.note} · n = {total.toLocaleString()}
                </span>
              </div>
              <div className="flex h-10 gap-[2px]">
                {EMOTIONS.map((e, i) => {
                  const pct = (d.counts[e] / total) * 100;
                  return (
                    <div
                      key={e}
                      {...bind({
                        value: `${pct.toFixed(1)}%`,
                        label: `${e} · ${d.dataset}`,
                        extra: `${d.counts[e].toLocaleString()} clips`,
                      })}
                      className={`flex items-center justify-center text-[12px] font-bold outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-secondary ${
                        i === 0 ? "rounded-l-[4px]" : ""
                      } ${i === EMOTIONS.length - 1 ? "rounded-r-[4px]" : ""}`}
                      style={{ width: `${pct}%`, background: EMOTION_COLOR[e], color: EMOTION_INK[e] }}
                      aria-label={`${e}, ${d.dataset}: ${pct.toFixed(1)}%`}
                    >
                      {/* Only label segments wide enough to hold the text on narrow screens */}
                      {pct >= 14 && <span>{pct.toFixed(0)}%</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {tooltip}
      </div>
    </ChartCard>
  );
}
