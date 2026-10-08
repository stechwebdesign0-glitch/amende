"use client";

import { useEffect, useMemo, useRef } from "react";
import { DOCUMENT_SLOTS, type DocumentSlotKey } from "@/lib/extraction";
import { WizardHeader } from "@/components/WizardHeader";

type Files = Partial<Record<DocumentSlotKey, File>>;

function DocumentRow({
  label,
  file,
  onCapture,
}: {
  label: string;
  file: File | undefined;
  onCapture: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="flex items-center gap-3.5 rounded-[14px] border border-line bg-card p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => onCapture(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={file ? `Reprendre la photo : ${label}` : `Prendre la photo : ${label}`}
        className="flex h-11 w-16 flex-none items-center justify-center overflow-hidden rounded-md border border-thumb-border bg-thumb"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-thumb-line">
            <path d="M4 8a2 2 0 0 1 2-2h1.2a1 1 0 0 0 .86-.49l.68-1.13A1 1 0 0 1 9.6 4h4.8a1 1 0 0 1 .86.38l.68 1.13a1 1 0 0 0 .86.49H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
        )}
      </button>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{label}</span>
        {file ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            Photo prise
          </span>
        ) : (
          <span className="text-xs font-medium text-muted">Aucune photo</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="ml-auto min-h-11 shrink-0 rounded-full px-1 py-3 font-sans text-[13px] font-medium text-accent"
      >
        {file ? "Reprendre" : "Prendre"}
      </button>
    </div>
  );
}

export function CaptureStep({
  files,
  onCapture,
  onAnalyze,
  onOpenHistory,
  loading,
}: {
  files: Files;
  onCapture: (key: DocumentSlotKey, file: File | null) => void;
  onAnalyze: () => void;
  onOpenHistory: () => void;
  loading: boolean;
}) {
  const total = DOCUMENT_SLOTS.length;
  const ready = DOCUMENT_SLOTS.filter((slot) => files[slot.key]).length;
  const allReady = ready === total;

  return (
    <div className="flex min-h-dvh w-full flex-col bg-app-bg text-ink">
      <WizardHeader currentStep={1} totalSteps={3} />

      <main className="flex flex-1 flex-col gap-[18px] overflow-hidden px-5 pt-1">
        <div>
          <h1 className="font-display mb-2 text-[28px] font-bold leading-[1.1] tracking-tight">
            Photographiez les {total} documents
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Posez chaque document à plat, bien éclairé, sans reflet. L&apos;IA lit les
            informations à votre place.
          </p>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            Documents
          </span>
          <span
            className={`text-[13px] font-semibold ${allReady ? "text-success" : "text-muted"}`}
          >
            {ready} sur {total} prêts
          </span>
        </div>

        <div className="flex flex-col gap-2.5 overflow-y-auto pb-4">
          {DOCUMENT_SLOTS.map((slot) => (
            <DocumentRow
              key={slot.key}
              label={slot.label}
              file={files[slot.key]}
              onCapture={(file) => onCapture(slot.key, file)}
            />
          ))}
        </div>
      </main>

      <footer className="flex flex-col gap-3 border-t border-line bg-app-bg px-5 pb-7 pt-4">
        <p className="flex items-start gap-2 text-[13px] leading-snug text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Les photos restent dans votre navigateur. Rien n&apos;est enregistré après votre
          visite.
        </p>
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line text-[14px] font-medium text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Personne déjà enregistrée
        </button>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!allReady || loading}
          className="flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-accent text-[16px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyse en cours..." : "Analyser les documents"}
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </footer>
    </div>
  );
}
