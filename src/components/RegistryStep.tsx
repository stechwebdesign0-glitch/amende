"use client";

import { useState } from "react";
import {
  deleteHistoryEntry,
  formatConducteurName,
  getHistory,
  type HistoryEntry,
} from "@/lib/history";
import { ScreenHeader } from "@/components/ScreenHeader";

function formatSavedAt(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RegistryStep({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (entry: HistoryEntry) => void;
}) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory());

  function handleDelete(id: string) {
    deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-app-bg text-ink">
      <ScreenHeader title="Registre" onBack={onBack} />

      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <div>
          <h1 className="font-display m-0 mb-2 text-[28px] font-bold leading-tight">
            Vos désignations
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-muted">
            Retrouvez les informations déjà saisies et reprenez-les en un geste.
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="m-0 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-[14px] leading-relaxed text-muted">
            Aucune désignation enregistrée pour le moment. Elles apparaîtront ici dès votre
            première analyse de documents.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <div
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(entry)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(entry);
                }}
                className="flex items-start gap-3 rounded-[14px] border border-line bg-card p-3.5 text-left"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[15px] font-semibold">
                    {formatConducteurName(entry.result)}
                  </span>
                  <span className="font-mono text-[13px] text-muted">
                    {entry.result.amende.numero_avis || "N° d'avis inconnu"}
                  </span>
                  <span className="text-xs text-muted">
                    Enregistré le {formatSavedAt(entry.savedAt)}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Supprimer cette désignation"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-muted"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
