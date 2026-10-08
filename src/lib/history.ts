import type { ExtractionResult } from "@/lib/extraction";

const STORAGE_KEY = "amende-saas:history";

export type HistoryEntry = {
  id: string;
  savedAt: string;
  result: ExtractionResult;
};

function readAll(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getHistory(): HistoryEntry[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function addHistoryEntry(result: ExtractionResult): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    result,
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function updateHistoryEntry(id: string, result: ExtractionResult) {
  const entries = readAll();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  entries[index] = { ...entries[index], result };
  writeAll(entries);
}

export function deleteHistoryEntry(id: string) {
  writeAll(readAll().filter((entry) => entry.id !== id));
}

export function formatConducteurName(result: ExtractionResult): string {
  const nom = result.conducteur.nom_usage || result.conducteur.nom_naissance;
  const prenom = result.conducteur.prenoms[0];
  const parts = [prenom, nom].filter(Boolean);
  return parts.length ? parts.join(" ") : "Conducteur inconnu";
}
