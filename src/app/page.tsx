"use client";

import { useState } from "react";
import { type DocumentSlotKey, type ExtractionResult } from "@/lib/extraction";
import { compressImage } from "@/lib/image-compress";
import {
  addHistoryEntry,
  deleteHistoryEntry,
  updateHistoryEntry,
  type HistoryEntry,
} from "@/lib/history";
import { CaptureStep } from "@/components/CaptureStep";
import { AnalyseStep } from "@/components/AnalyseStep";
import { ReviewStep } from "@/components/ReviewStep";
import { TransmissionStep } from "@/components/TransmissionStep";
import { RegistryStep } from "@/components/RegistryStep";

type Files = Partial<Record<DocumentSlotKey, File>>;
type Step = "capture" | "analyse" | "registry" | "review" | "transmission";

export default function Home() {
  const [step, setStep] = useState<Step>("capture");
  const [files, setFiles] = useState<Files>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);

  const uncertain = new Set(result?.metadata_ocr.champs_incertains ?? []);

  async function handleFile(key: DocumentSlotKey, file: File | null) {
    if (!file) {
      setFiles((prev) => ({ ...prev, [key]: undefined }));
      return;
    }
    const compressed = await compressImage(file);
    setFiles((prev) => ({ ...prev, [key]: compressed }));
  }

  async function handleExtract() {
    setStatus("loading");
    setError(null);
    setStep("analyse");
    const formData = new FormData();
    for (const [key, file] of Object.entries(files)) {
      if (file) formData.append(key, file);
    }
    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur inconnue");
        setStatus("error");
        setStep("capture");
        return;
      }
      const extracted = data as ExtractionResult;
      setResult(extracted);
      setCurrentEntryId(null);
      setReviewConfirmed(false);
      setSaveEnabled(false);
      setStatus("done");
      setStep("review");
    } catch {
      setError("Impossible de contacter le serveur.");
      setStatus("error");
      setStep("capture");
    }
  }

  function updateResult(mutate: (draft: ExtractionResult) => ExtractionResult) {
    setResult((prev) => {
      if (!prev) return prev;
      const next = mutate(structuredClone(prev));
      if (currentEntryId) updateHistoryEntry(currentEntryId, next);
      return next;
    });
  }

  function handleSelectFromRegistry(entry: HistoryEntry) {
    setResult(entry.result);
    setCurrentEntryId(entry.id);
    setReviewConfirmed(false);
    setSaveEnabled(true);
    setStep("review");
  }

  function handleToggleSave() {
    setSaveEnabled((prev) => {
      const next = !prev;
      if (!result) return prev;
      if (next) {
        const entry = addHistoryEntry(result);
        setCurrentEntryId(entry.id);
      } else if (currentEntryId) {
        deleteHistoryEntry(currentEntryId);
        setCurrentEntryId(null);
      }
      return next;
    });
  }

  if (step === "capture") {
    return (
      <>
        <CaptureStep
          files={files}
          onCapture={handleFile}
          onAnalyze={handleExtract}
          onOpenHistory={() => setStep("registry")}
          loading={status === "loading"}
        />
        {error && (
          <div className="fixed inset-x-5 bottom-28 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
            {error}
          </div>
        )}
      </>
    );
  }

  if (step === "analyse") {
    return <AnalyseStep onBack={() => setStep("capture")} />;
  }

  if (step === "registry") {
    return <RegistryStep onBack={() => setStep("capture")} onSelect={handleSelectFromRegistry} />;
  }

  if (!result) {
    return null;
  }

  if (step === "transmission") {
    return <TransmissionStep result={result} onBack={() => setStep("review")} />;
  }

  return (
    <ReviewStep
      result={result}
      uncertain={uncertain}
      reviewConfirmed={reviewConfirmed}
      onToggleConfirmed={() => setReviewConfirmed((v) => !v)}
      saveEnabled={saveEnabled}
      onToggleSave={handleToggleSave}
      onBack={() => setStep("capture")}
      onContinue={() => setStep("transmission")}
      onExportJson={() => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "designation-conducteur.json";
        a.click();
        URL.revokeObjectURL(url);
      }}
      updateResult={updateResult}
      files={files}
    />
  );
}
