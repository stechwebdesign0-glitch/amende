"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";

const CHECKLIST = [
  "Carte d'identité",
  "Permis de conduire",
  "Avis de contravention",
  "Vérification CNI ↔ permis",
] as const;

// Timeline of a simulated progress (ms elapsed -> percent / active step index).
// The real extraction is a single opaque API call with no incremental
// progress, so this gives the user a sense of motion without inventing
// specific attempt counts or statuses we can't actually observe.
const TIMELINE = [
  { at: 0, percent: 8, active: 0 },
  { at: 1500, percent: 28, active: 1 },
  { at: 3200, percent: 50, active: 2 },
  { at: 5200, percent: 72, active: 3 },
  { at: 7200, percent: 90, active: 3 },
] as const;

const SLOW_THRESHOLD_MS = 9000;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function deriveState(elapsedMs: number) {
  let current: (typeof TIMELINE)[number] = TIMELINE[0];
  for (const point of TIMELINE) {
    if (elapsedMs >= point.at) current = point;
  }
  return {
    percent: current.percent,
    active: current.active,
    doneCount: current.active + (current.percent >= 90 ? 1 : 0),
  };
}

function RowIcon({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="dot flex-none" style={{ background: "#DDF0E3", color: "#1D6B43" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="dot flex-none" style={{ background: "#E3E8FA", color: "#1E3FB8" }}>
        <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M21 12a9 9 0 1 1-9-9" />
        </svg>
      </span>
    );
  }
  return <span className="dot flex-none border-2 border-line box-border" />;
}

export function AnalyseStep({ onBack }: { onBack: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 200);
    return () => clearInterval(id);
  }, []);

  const { percent, active, doneCount } = deriveState(elapsed);
  const showSlowBanner = elapsed >= SLOW_THRESHOLD_MS;
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-app-bg text-ink">
      <style>{`
        @keyframes adc-spin { to { transform: rotate(360deg); } }
        .spin { animation: adc-spin 0.9s linear infinite; }
        .dot { width: 28px; height: 28px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; }
      `}</style>
      <ScreenHeader title="Analyse" onBack={onBack} />

      <main className="flex flex-1 flex-col gap-7 px-5 py-6">
        <div className="flex flex-col items-center gap-4 pt-3 text-center">
          <div className="relative h-24 w-24">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r={RADIUS} stroke="#DCD8CE" strokeWidth="6" />
              <circle
                cx="48"
                cy="48"
                r={RADIUS}
                stroke="#1E3FB8"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                transform="rotate(-90 48 48)"
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-xl">
              {percent}%
            </span>
          </div>
          <h1 className="font-display m-0 text-[28px] font-bold leading-tight">
            Lecture des documents
          </h1>
          <p className="m-0 max-w-[300px] text-[15px] leading-relaxed text-muted">
            Quelques secondes. Aucun champ n&apos;est deviné&nbsp;: ce qui est illisible sera
            laissé vide et signalé.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card px-[18px] py-1">
          {CHECKLIST.map((label, i) => {
            const state = i < doneCount ? "done" : i === active ? "active" : "pending";
            return (
              <div
                key={label}
                className={`flex items-center gap-3.5 py-3.5 ${
                  i < CHECKLIST.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <RowIcon state={state} />
                <span
                  className={`text-[15px] ${state === "active" ? "font-semibold" : ""} ${
                    state === "pending" ? "text-muted" : ""
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {showSlowBanner && (
          <p className="m-0 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[13px] leading-snug" style={{ background: "#FCEBC2", color: "#5E3A00" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
            Le service d&apos;analyse est très sollicité. Nouvelle tentative automatique en
            cours...
          </p>
        )}
      </main>
    </div>
  );
}
