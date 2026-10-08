"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DOCUMENT_SLOTS, type DocumentSlotKey, type ExtractionResult } from "@/lib/extraction";
import { WizardHeader } from "@/components/WizardHeader";
import { DesktopHeader } from "@/components/DesktopHeader";

const SHORT_LABELS: Record<DocumentSlotKey, string> = {
  cni_recto: "CNI R",
  cni_verso: "CNI V",
  permis_recto: "Permis R",
  permis_verso: "Permis V",
  avis_contravention: "Avis",
};

const CAPTION_FIELD_IDS: Record<DocumentSlotKey, string[]> = {
  cni_recto: ["nom_naissance", "nom_usage", "prenoms", "date_naissance", "ville_naissance", "numero_piece", "date_expiration"],
  cni_verso: ["nom_naissance", "nom_usage", "prenoms", "date_naissance", "ville_naissance", "numero_piece", "date_expiration"],
  permis_recto: ["numero_permis", "date_delivrance_categorie_b"],
  permis_verso: ["numero_permis", "date_delivrance_categorie_b"],
  avis_contravention: [
    "numero_avis",
    "numero_telepaiement",
    "nom_destinataire",
    "date_avis",
    "immatriculation",
    "date_infraction",
    "heure_infraction",
    "montant_euros",
    "date_limite_paiement",
    "lieu_infraction",
    "nature_infraction",
  ],
};

function Tag({
  background,
  color,
  children,
}: {
  background: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap"
      style={{ background, color }}
    >
      {children}
    </span>
  );
}

type FieldDesc = {
  id: string;
  label: string;
  value: string;
  full?: boolean;
  mono?: boolean;
  warn?: boolean;
  empty?: boolean;
  onChange: (v: string) => void;
};

function FieldInput({ field }: { field: FieldDesc }) {
  const state = field.empty ? "empty" : field.warn ? "warn" : "ok";
  const border =
    state === "warn" ? "2px solid #E5A50A" : state === "empty" ? "2px solid #C2410C" : "1px solid #CFCABD";
  const background = state === "warn" ? "#FFF7E3" : state === "empty" ? "#FFF4F0" : "#FFFFFF";

  return (
    <div style={{ gridColumn: field.full ? "span 2" : "span 1", minWidth: 0 }}>
      <label
        htmlFor={field.id}
        className="mb-1.5 flex items-center justify-between gap-1.5 text-[13px] font-medium text-[#3D4048]"
      >
        <span>{field.label}</span>
        {field.warn && !field.empty && (
          <span
            className="rounded-full px-[7px] py-0.5 text-[11px] font-semibold whitespace-nowrap"
            style={{ background: "#FCEBC2", color: "#5E3A00" }}
          >
            À vérifier
          </span>
        )}
        {field.empty && (
          <span
            className="rounded-full px-[7px] py-0.5 text-[11px] font-semibold whitespace-nowrap"
            style={{ background: "#F8DDD6", color: "#8A2410" }}
          >
            Illisible
          </span>
        )}
      </label>
      <input
        id={field.id}
        value={field.value}
        placeholder={field.empty ? "À saisir" : ""}
        onChange={(e) => field.onChange(e.target.value)}
        className={`h-[46px] w-full rounded-[10px] px-3 text-[15px] text-ink outline-none ${
          field.mono ? "font-mono text-[14px] tracking-wide" : ""
        }`}
        style={{ border, background, boxSizing: "border-box" }}
      />
    </div>
  );
}

export function ReviewStep({
  result,
  uncertain,
  reviewConfirmed,
  onToggleConfirmed,
  saveEnabled,
  onToggleSave,
  onBack,
  onContinue,
  onExportJson,
  updateResult,
  files,
}: {
  result: ExtractionResult;
  uncertain: Set<string>;
  reviewConfirmed: boolean;
  onToggleConfirmed: () => void;
  saveEnabled: boolean;
  onToggleSave: () => void;
  onBack: () => void;
  onContinue: () => void;
  onExportJson: () => void;
  updateResult: (mutate: (draft: ExtractionResult) => ExtractionResult) => void;
  files?: Partial<Record<DocumentSlotKey, File>>;
}) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(DOCUMENT_SLOTS.length - 1);
  const selectedSlot = DOCUMENT_SLOTS[selectedDocIndex];
  const selectedFile = files?.[selectedSlot.key];
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function field(
    id: string,
    label: string,
    value: string | null,
    opts: Partial<Pick<FieldDesc, "full" | "mono">> & { onChange: (v: string) => void },
  ): FieldDesc {
    const empty = !value;
    return {
      id,
      label,
      value: value ?? "",
      full: opts.full,
      mono: opts.mono,
      warn: uncertain.has(id),
      empty,
      onChange: opts.onChange,
    };
  }

  const sections: { title: string; fields: FieldDesc[] }[] = [
    {
      title: "Avis de contravention",
      fields: [
        field("numero_avis", "N° de l'avis", result.amende.numero_avis, {
          full: true,
          mono: true,
          onChange: (v) =>
            updateResult((d) => {
              d.amende.numero_avis = v || null;
              return d;
            }),
        }),
        field("numero_telepaiement", "N° de télépaiement", result.amende.numero_telepaiement, {
          full: true,
          mono: true,
          onChange: (v) =>
            updateResult((d) => {
              d.amende.numero_telepaiement = v || null;
              return d;
            }),
        }),
        field("nom_destinataire", "Nom du destinataire", result.amende.nom_destinataire, {
          full: true,
          onChange: (v) =>
            updateResult((d) => {
              d.amende.nom_destinataire = v || null;
              return d;
            }),
        }),
        field("date_avis", "Date de l'avis", result.amende.date_avis, {
          onChange: (v) =>
            updateResult((d) => {
              d.amende.date_avis = v || null;
              return d;
            }),
        }),
        field("immatriculation", "Immatriculation", result.amende.immatriculation, {
          mono: true,
          onChange: (v) =>
            updateResult((d) => {
              d.amende.immatriculation = v || null;
              return d;
            }),
        }),
        field("date_infraction", "Date de l'infraction", result.amende.date_infraction, {
          onChange: (v) =>
            updateResult((d) => {
              d.amende.date_infraction = v || null;
              return d;
            }),
        }),
        field("heure_infraction", "Heure de l'infraction", result.amende.heure_infraction, {
          onChange: (v) =>
            updateResult((d) => {
              d.amende.heure_infraction = v || null;
              return d;
            }),
        }),
        field("montant_euros", "Montant (€)", result.amende.montant_euros, {
          onChange: (v) =>
            updateResult((d) => {
              d.amende.montant_euros = v || null;
              return d;
            }),
        }),
        field("date_limite_paiement", "Date limite de paiement", result.amende.date_limite_paiement, {
          onChange: (v) =>
            updateResult((d) => {
              d.amende.date_limite_paiement = v || null;
              return d;
            }),
        }),
        field("lieu_infraction", "Lieu de l'infraction", result.amende.lieu_infraction, {
          full: true,
          onChange: (v) =>
            updateResult((d) => {
              d.amende.lieu_infraction = v || null;
              return d;
            }),
        }),
        field("nature_infraction", "Nature de l'infraction", result.amende.nature_infraction, {
          full: true,
          onChange: (v) =>
            updateResult((d) => {
              d.amende.nature_infraction = v || null;
              return d;
            }),
        }),
      ],
    },
    {
      title: "Conducteur désigné",
      fields: [
        field("nom_naissance", "Nom de naissance", result.conducteur.nom_naissance, {
          onChange: (v) =>
            updateResult((d) => {
              d.conducteur.nom_naissance = v || null;
              return d;
            }),
        }),
        field("nom_usage", "Nom d'usage", result.conducteur.nom_usage, {
          onChange: (v) =>
            updateResult((d) => {
              d.conducteur.nom_usage = v || null;
              return d;
            }),
        }),
        field("prenoms", "Prénoms", result.conducteur.prenoms.join(", "), {
          full: true,
          onChange: (v) =>
            updateResult((d) => {
              d.conducteur.prenoms = v
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);
              return d;
            }),
        }),
        field("date_naissance", "Né(e) le", result.conducteur.date_naissance, {
          onChange: (v) =>
            updateResult((d) => {
              d.conducteur.date_naissance = v || null;
              return d;
            }),
        }),
        field("ville_naissance", "À", result.conducteur.ville_naissance, {
          onChange: (v) =>
            updateResult((d) => {
              d.conducteur.ville_naissance = v || null;
              return d;
            }),
        }),
        field(
          "adresse_voie",
          "Numéro et voie",
          [result.conducteur.adresse.numero_rue, result.conducteur.adresse.nom_voie]
            .filter(Boolean)
            .join(" ") || null,
          {
            full: true,
            onChange: (v) =>
              updateResult((d) => {
                const [num, ...rest] = v.split(" ");
                d.conducteur.adresse.numero_rue = /^\d/.test(num) ? num : null;
                d.conducteur.adresse.nom_voie = (/^\d/.test(num) ? rest.join(" ") : v) || null;
                return d;
              }),
          },
        ),
        field(
          "adresse",
          "Code postal / ville",
          [result.conducteur.adresse.code_postal, result.conducteur.adresse.ville]
            .filter(Boolean)
            .join(" ") || null,
          {
            full: true,
            onChange: (v) =>
              updateResult((d) => {
                const [cp, ...rest] = v.split(" ");
                d.conducteur.adresse.code_postal = cp || null;
                d.conducteur.adresse.ville = rest.join(" ") || null;
                return d;
              }),
          },
        ),
      ],
    },
    {
      title: "Permis de conduire",
      fields: [
        field("numero_permis", "N° du permis", result.permis.numero_permis, {
          mono: true,
          onChange: (v) =>
            updateResult((d) => {
              d.permis.numero_permis = v || null;
              return d;
            }),
        }),
        field(
          "date_delivrance_categorie_b",
          "Délivré le (cat. B)",
          result.permis.date_delivrance_categorie_b,
          {
            onChange: (v) =>
              updateResult((d) => {
                d.permis.date_delivrance_categorie_b = v || null;
                return d;
              }),
          },
        ),
      ],
    },
    {
      title: "Pièce d'identité",
      fields: [
        field("numero_piece", "N° de la pièce", result.piece_identite.numero_piece, {
          mono: true,
          onChange: (v) =>
            updateResult((d) => {
              d.piece_identite.numero_piece = v || null;
              return d;
            }),
        }),
        field("date_expiration", "Expire le", result.piece_identite.date_expiration, {
          onChange: (v) =>
            updateResult((d) => {
              d.piece_identite.date_expiration = v || null;
              return d;
            }),
        }),
      ],
    },
  ];

  const allFields = sections.flatMap((s) => s.fields);
  const emptyFlagged = allFields.filter((f) => f.warn && f.empty).length;
  const uncertainWithValue = allFields.filter((f) => f.warn && !f.empty).length;
  const showBanner = emptyFlagged > 0 || uncertainWithValue > 0;

  const coherent = result.verification_croisee.identite_coherente;
  const labelMap = new Map(allFields.map((f) => [f.id, f.label]));
  const captionLabels = CAPTION_FIELD_IDS[selectedSlot.key]
    .filter((id) => uncertain.has(id))
    .map((id) => labelMap.get(id))
    .filter((label): label is string => Boolean(label));

  return (
    <>
    <div className="lg:hidden flex min-h-dvh w-full flex-col bg-app-bg text-ink">
      <WizardHeader currentStep={2} totalSteps={3} onBack={onBack} />

      <main className="flex flex-col gap-4 px-5 pb-6 pt-1">
        <div>
          <h1 className="font-display mb-2 text-[28px] font-bold leading-tight">
            Vérifiez chaque champ
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-muted">
            Corrigez directement si besoin. Les champs surlignés demandent votre attention.
          </p>
        </div>

        {showBanner && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[14px] leading-snug"
            style={{ background: "#FCEBC2", color: "#5E3A00" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none">
              <path d="M12 3l9.5 17H2.5z" />
              <path d="M12 10v4" />
              <path d="M12 17.5v.01" />
            </svg>
            <span>
              <strong>
                {emptyFlagged + uncertainWithValue} champ
                {emptyFlagged + uncertainWithValue > 1 ? "s" : ""} à vérifier
              </strong>
              {" — "}
              {[
                uncertainWithValue > 0 &&
                  `${uncertainWithValue} lecture${uncertainWithValue > 1 ? "s" : ""} incertaine${uncertainWithValue > 1 ? "s" : ""}`,
                emptyFlagged > 0 &&
                  `${emptyFlagged} champ${emptyFlagged > 1 ? "s" : ""} illisible${emptyFlagged > 1 ? "s" : ""} laissé${emptyFlagged > 1 ? "s" : ""} vide${emptyFlagged > 1 ? "s" : ""}`,
              ]
                .filter(Boolean)
                .join(", ")}
              .
            </span>
          </div>
        )}

        <div
          className="flex flex-col gap-2.5 rounded-xl p-3.5"
          style={{ background: "#FFFFFF", border: "1px solid #DCD8CE" }}
        >
          {coherent ? (
            <>
              <span className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "#1D6B43" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
                  <path d="M8.5 12l2.5 2.5L15.5 10" />
                </svg>
                Carte d&apos;identité et permis concordent
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Nom", "Prénom", "Date de naissance"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-[7px] py-0.5 text-[12px] font-semibold"
                    style={{ background: "#DDF0E3", color: "#1D6B43" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "#8A2410" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l9.5 17H2.5z" />
                  <path d="M12 10v4" />
                  <path d="M12 17.5v.01" />
                </svg>
                Incohérence entre la CNI et le permis
              </span>
              {result.verification_croisee.details_incoherence && (
                <p className="m-0 text-[13px] leading-relaxed text-muted">
                  {result.verification_croisee.details_incoherence}
                </p>
              )}
            </>
          )}
        </div>

        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3 pt-2">
            <h2 className="m-0 text-[13px] font-semibold uppercase tracking-wide text-muted">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5">
              {section.fields.map((f) => (
                <FieldInput key={f.id} field={f} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer
        className="mt-auto flex flex-col gap-3 px-5 pb-7 pt-[18px]"
        style={{ background: "#FFFFFF", borderTop: "1px solid #DCD8CE" }}
      >
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saveEnabled}
          className="flex min-h-11 items-start gap-3 bg-transparent p-0 text-left font-sans text-[14px] leading-relaxed text-ink"
        >
          <span
            className="box-border flex h-6 w-6 flex-none items-center justify-center rounded-md"
            style={
              saveEnabled
                ? { background: "#1E3FB8", border: "2px solid #1E3FB8" }
                : { background: "#FFFFFF", border: "2px solid #8A8E96" }
            }
          >
            {saveEnabled && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
          </span>
          Enregistrer ces informations dans le registre pour les retrouver plus tard.
        </button>

        <button
          type="button"
          onClick={onToggleConfirmed}
          aria-pressed={reviewConfirmed}
          className="flex min-h-11 items-start gap-3 bg-transparent p-0 text-left font-sans text-[14px] leading-relaxed text-ink"
        >
          <span
            className="box-border flex h-6 w-6 flex-none items-center justify-center rounded-md"
            style={
              reviewConfirmed
                ? { background: "#1E3FB8", border: "2px solid #1E3FB8" }
                : { background: "#FFFFFF", border: "2px solid #8A8E96" }
            }
          >
            {reviewConfirmed && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
          </span>
          J&apos;ai vérifié chaque champ et je confirme que ces informations sont exactes.
        </button>

        {reviewConfirmed ? (
          <button
            type="button"
            onClick={onContinue}
            className="flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-accent text-[16px] font-semibold text-white"
          >
            Continuer vers l&apos;ANTAI
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="h-[54px] cursor-not-allowed rounded-[14px] text-[15px] font-semibold"
            style={{ background: "#E4E1D8", color: "#5B5F68" }}
          >
            Cochez la case pour continuer
          </button>
        )}

        <button
          type="button"
          onClick={onExportJson}
          className="h-11 bg-transparent text-[14px] font-medium text-accent"
        >
          Exporter en JSON
        </button>
      </footer>
    </div>

    <div className="hidden min-h-dvh w-full flex-col bg-app-bg text-ink lg:flex">
      <DesktopHeader currentStep={2} onExportJson={onExportJson} />

      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-wrap items-start gap-7 px-6 py-7">
        <section aria-label="Documents" className="flex min-w-0 flex-1 basis-[380px] flex-col gap-3.5">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">{selectedSlot.label}</span>
              <span className="text-[13px] text-muted">
                {selectedDocIndex + 1} / {DOCUMENT_SLOTS.length}
              </span>
            </div>
            <div className="relative flex aspect-[1.55] items-center justify-center overflow-hidden rounded-[10px] border border-thumb-border bg-thumb">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="px-4 text-center text-[13px] text-muted">
                  Aperçu non disponible
                </span>
              )}
            </div>
            {captionLabels.length > 0 && (
              <p
                className="m-0 rounded-lg px-3 py-2 text-[13px] leading-snug"
                style={{ background: "#FCEBC2", color: "#5E3A00" }}
              >
                À vérifier sur ce document&nbsp;: {captionLabels.join(", ")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_SLOTS.map((slot, i) => (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setSelectedDocIndex(i)}
                  aria-pressed={i === selectedDocIndex}
                  aria-label={slot.label}
                  className="flex h-14 w-[76px] flex-none items-center justify-center rounded-lg bg-thumb text-[11px] font-medium text-ink"
                  style={{
                    border:
                      i === selectedDocIndex
                        ? "2px solid #1E3FB8"
                        : "1px solid var(--color-thumb-border)",
                  }}
                >
                  {SHORT_LABELS[slot.key]}
                </button>
              ))}
            </div>
          </div>
          <p className="m-0 flex gap-2 text-[13px] leading-relaxed text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Photos gardées uniquement dans ce navigateur, effacées à la fermeture.
          </p>
        </section>

        <section aria-label="Données extraites" className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display m-0 mb-1.5 text-[34px] font-bold leading-[1.1]">
                Vérifiez chaque champ
              </h1>
              <p className="m-0 text-[15px] text-muted">
                Corrigez directement dans les cases. Rien n&apos;a été deviné.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {uncertainWithValue > 0 && (
                <Tag background="#FCEBC2" color="#5E3A00">
                  {uncertainWithValue} incertain{uncertainWithValue > 1 ? "s" : ""}
                </Tag>
              )}
              {emptyFlagged > 0 && (
                <Tag background="#F8DDD6" color="#8A2410">
                  {emptyFlagged} illisible{emptyFlagged > 1 ? "s" : ""}
                </Tag>
              )}
              {coherent ? (
                <Tag background="#DDF0E3" color="#1D6B43">
                  CNI ↔ permis concordent
                </Tag>
              ) : (
                <Tag background="#F8DDD6" color="#8A2410">
                  Incohérence CNI / permis
                </Tag>
              )}
            </div>
          </div>

          {sections.map((section) => (
            <div
              key={section.title}
              className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-5"
            >
              <h2 className="m-0 text-[13px] font-semibold uppercase tracking-wide text-muted">
                {section.title}
              </h2>
              <div
                className="grid gap-x-3.5 gap-y-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
              >
                {section.fields.map((f) => (
                  <FieldInput key={f.id} field={f} />
                ))}
              </div>
            </div>
          ))}

          <div
            className="flex flex-col gap-3.5 rounded-2xl p-4"
            style={{ background: "#FFFFFF", border: "1px solid #17191E" }}
          >
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saveEnabled}
              className="flex min-h-11 items-start gap-3 bg-transparent p-0 text-left text-[14px] leading-relaxed text-ink"
            >
              <span
                className="box-border flex h-5 w-5 flex-none items-center justify-center rounded-md"
                style={
                  saveEnabled
                    ? { background: "#1E3FB8", border: "2px solid #1E3FB8" }
                    : { background: "#FFFFFF", border: "2px solid #8A8E96" }
                }
              >
                {saveEnabled && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </span>
              Enregistrer ces informations dans le registre pour les retrouver plus tard.
            </button>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={onToggleConfirmed}
                aria-pressed={reviewConfirmed}
                className="flex min-h-11 flex-[1_1_320px] items-center gap-3 bg-transparent p-0 text-left text-[15px] leading-relaxed text-ink"
              >
                <span
                  className="box-border flex h-6 w-6 flex-none items-center justify-center rounded-md"
                  style={
                    reviewConfirmed
                      ? { background: "#1E3FB8", border: "2px solid #1E3FB8" }
                      : { background: "#FFFFFF", border: "2px solid #8A8E96" }
                  }
                >
                  {reviewConfirmed && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </span>
                J&apos;ai vérifié chaque champ et je confirme que ces informations sont exactes.
              </button>
              {reviewConfirmed ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onContinue();
                  }}
                  className="flex h-12 flex-none items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[15px] font-semibold text-white no-underline"
                >
                  Continuer vers l&apos;ANTAI
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="h-12 flex-none cursor-not-allowed rounded-xl px-5 text-[15px] font-semibold"
                  style={{ background: "#E4E1D8", color: "#5B5F68" }}
                >
                  Continuer vers l&apos;ANTAI
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
