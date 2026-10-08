"use client";

import { useState, type ReactNode } from "react";
import type { ExtractionResult } from "@/lib/extraction";
import { WizardHeader } from "@/components/WizardHeader";
import { DesktopHeader } from "@/components/DesktopHeader";
import { copyText } from "@/lib/clipboard";
import { getBookmarkletHref } from "@/lib/bookmarklet";
import { formatAntaiPasteBlock } from "@/lib/transmission";

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-ink font-mono text-[14px] text-app-bg">
        {number}
      </span>
      <div className="flex flex-1 flex-col gap-2.5 pt-1">
        <span className="text-[15px] font-semibold">{title}</span>
        {children}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function BigCopyButton({
  copied,
  idleLabel,
  doneLabel,
  onClick,
}: {
  copied: boolean;
  idleLabel: string;
  doneLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white"
      style={{ background: copied ? "#1D6B43" : "#1E3FB8" }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? doneLabel : idleLabel}
    </button>
  );
}

function CopyRow({
  id,
  label,
  value,
  copied,
  last,
  onCopy,
}: {
  id: string;
  label: string;
  value: string;
  copied: boolean;
  last?: boolean;
  onCopy: (id: string, value: string) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${last ? "" : "border-b border-line"}`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted">{label}</span>
        <span className="truncate font-mono text-[14px]">{value || "—"}</span>
      </div>
      <button
        type="button"
        onClick={() => onCopy(id, value)}
        aria-label={`Copier ${label}`}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
        style={{ color: copied ? "#1D6B43" : "#5B5F68" }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

export function TransmissionStep({
  result,
  onBack,
}: {
  result: ExtractionResult;
  onBack: () => void;
}) {
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false);
  const [infoCopied, setInfoCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [desktopCopiedField, setDesktopCopiedField] = useState<string | null>(null);
  const [desktopAllCopied, setDesktopAllCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);

  const fields = [
    { id: "numero_avis", label: "N° de l'avis", value: result.amende.numero_avis ?? "" },
    {
      id: "nom_destinataire",
      label: "Nom du destinataire",
      value: result.amende.nom_destinataire ?? "",
    },
    { id: "date_avis", label: "Date de l'avis", value: result.amende.date_avis ?? "" },
  ];

  const bookmarkletHref = getBookmarkletHref();

  async function handleCopyBookmarklet() {
    const ok = await copyText(bookmarkletHref);
    if (ok) {
      setCopyFailed(false);
      setBookmarkletCopied(true);
      setTimeout(() => setBookmarkletCopied(false), 2500);
    } else {
      setCopyFailed(true);
    }
  }

  async function handleCopyInfoBlock() {
    const text = formatAntaiPasteBlock({
      numeroAvis: result.amende.numero_avis ?? "",
      nomDestinataire: result.amende.nom_destinataire ?? "",
      dateAvis: result.amende.date_avis ?? "",
    });
    const ok = await copyText(text);
    if (ok) {
      setCopyFailed(false);
      setInfoCopied(true);
      setTimeout(() => setInfoCopied(false), 2500);
    } else {
      setCopyFailed(true);
    }
  }

  async function handleCopyField(id: string, value: string) {
    const ok = await copyText(value);
    if (ok) {
      setCopyFailed(false);
      setCopiedField(id);
      setTimeout(() => {
        setCopiedField((current) => (current === id ? null : current));
      }, 2000);
    } else {
      setCopyFailed(true);
    }
  }

  async function handleDesktopCopyField(id: string, value: string) {
    const ok = await copyText(value);
    if (ok) {
      setCopyFailed(false);
      setDesktopCopiedField(id);
      setTimeout(() => {
        setDesktopCopiedField((current) => (current === id ? null : current));
      }, 2000);
    } else {
      setCopyFailed(true);
    }
  }

  async function handleDesktopCopyAll() {
    const text = fields.map((f) => `${f.label} : ${f.value || "—"}`).join("\n");
    const ok = await copyText(text);
    if (ok) {
      setCopyFailed(false);
      setDesktopAllCopied(true);
      setTimeout(() => setDesktopAllCopied(false), 2500);
    } else {
      setCopyFailed(true);
    }
  }

  const conducteurAddress = [
    [result.conducteur.adresse.numero_rue, result.conducteur.adresse.nom_voie]
      .filter(Boolean)
      .join(" "),
    [result.conducteur.adresse.code_postal, result.conducteur.adresse.ville]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const conducteurName = [
    result.conducteur.prenoms[0],
    result.conducteur.nom_usage || result.conducteur.nom_naissance,
  ]
    .filter(Boolean)
    .join(" ");

  const conducteurBirth = [result.conducteur.date_naissance, result.conducteur.ville_naissance]
    .filter(Boolean)
    .join(", ");

  function exportJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "designation-conducteur.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
    <div className="lg:hidden flex min-h-dvh w-full flex-col bg-app-bg text-ink">
      <WizardHeader currentStep={3} totalSteps={3} onBack={onBack} />

      <main className="flex flex-1 flex-col gap-[22px] px-5 py-6">
        <div>
          <h1 className="font-display m-0 mb-2 text-[30px] font-bold leading-[1.1]">
            Terminez sur le site officiel
          </h1>
          <p className="m-0 text-[15px] leading-relaxed text-muted">
            Le site de l&apos;ANTAI demande un captcha&nbsp;: c&apos;est vous qui le validez. Un
            favori se charge de remplir le reste automatiquement.
          </p>
        </div>

        <Step number={1} title="Ajoutez le favori (une seule fois)">
          <div className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-card p-3.5">
            <p className="m-0 text-[13px] leading-relaxed text-muted">
              Créez un nouveau favori dans votre navigateur (sur n&apos;importe quelle page),
              puis modifiez son adresse pour y coller le code ci-dessous. Nommez-le par exemple
              « Remplir ANTAI ». À ne faire qu&apos;une fois.
            </p>
            <BigCopyButton
              copied={bookmarkletCopied}
              idleLabel="Copier le code du favori"
              doneLabel="Code copié"
              onClick={handleCopyBookmarklet}
            />
            <a
              href={bookmarkletHref}
              className="text-center text-xs text-accent underline"
              onClick={(e) => e.preventDefault()}
            >
              Sur ordinateur&nbsp;: faites glisser ce lien vers votre barre de favoris
            </a>
          </div>
        </Step>

        <Step number={2} title="Ouvrez le formulaire ANTAI">
          <a
            href="https://usagers.antai.gouv.fr/fr/contestation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[50px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink text-[15px] font-semibold text-ink no-underline"
          >
            Ouvrir dans un nouvel onglet
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4h6v6" />
              <path d="M20 4l-9 9" />
              <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
        </Step>

        <Step number={3} title="Copiez vos informations, puis activez le favori">
          <div className="flex flex-col gap-2.5">
            <BigCopyButton
              copied={infoCopied}
              idleLabel="Copier mes informations"
              doneLabel="Informations copiées"
              onClick={handleCopyInfoBlock}
            />
            <p className="m-0 text-[13px] leading-relaxed text-muted">
              Sur le site ANTAI, appuyez sur votre favori « Remplir ANTAI ». Collez le texte
              copié dans la fenêtre qui s&apos;ouvre et validez&nbsp;: les 3 champs se
              remplissent seuls.
            </p>
          </div>
        </Step>

        <Step number={4} title="Résolvez le captcha et validez">
          <span className="text-[14px] leading-relaxed text-muted">
            C&apos;est la seule étape qui reste à faire vous-même sur le site de l&apos;ANTAI.
          </span>
        </Step>

        {copyFailed && (
          <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            La copie automatique n&apos;a pas fonctionné sur cet appareil. Maintenez votre doigt
            sur un texte ci-dessus pour le sélectionner, puis copiez-le manuellement.
          </span>
        )}

        <button
          type="button"
          onClick={() => setShowManualFallback((v) => !v)}
          className="text-left text-[13px] font-medium text-accent"
        >
          {showManualFallback
            ? "Masquer la copie champ par champ"
            : "Le favori ne fonctionne pas chez vous ? Copiez un champ à la fois"}
        </button>

        {showManualFallback && (
          <div className="rounded-[14px] border border-line bg-card px-3.5 pt-0.5">
            {fields.map((field, i) => (
              <CopyRow
                key={field.id}
                id={field.id}
                label={field.label}
                value={field.value}
                copied={copiedField === field.id}
                last={i === fields.length - 1}
                onCopy={handleCopyField}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="flex flex-col items-center gap-1 px-5 pb-6">
        <button
          type="button"
          onClick={exportJson}
          className="h-11 bg-transparent text-[14px] font-medium text-accent"
        >
          Exporter le dossier en JSON
        </button>
        <span className="text-xs text-muted">
          Service indépendant, non affilié à l&apos;ANTAI.
        </span>
      </footer>
    </div>

    <div className="hidden min-h-dvh w-full flex-col bg-app-bg text-ink lg:flex">
      <DesktopHeader currentStep={3} onExportJson={exportJson} />

      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-wrap items-start gap-10 px-6 py-10">
        <section className="flex min-w-0 flex-1 basis-[440px] flex-col gap-[22px]">
          <div>
            <h1 className="font-display m-0 mb-2.5 max-w-[560px] text-[40px] font-bold leading-[1.08]">
              Terminez sur le site officiel de l&apos;ANTAI
            </h1>
            <p className="m-0 max-w-[540px] text-base text-muted">
              Le formulaire officiel est protégé par un captcha que vous seul pouvez valider.
              Tout le reste est prêt à coller.
            </p>
          </div>

          <ol className="m-0 flex list-none flex-col gap-[22px] p-0">
            <li className="flex gap-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink font-mono text-[15px] text-app-bg">
                1
              </span>
              <div className="pt-1.5">
                <span className="mb-1 block text-base font-semibold">Copiez les 3 champs</span>
                <span className="text-sm text-muted">
                  Un seul clic sur « Copier les 3 champs », à droite.
                </span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink font-mono text-[15px] text-app-bg">
                2
              </span>
              <div className="flex flex-col items-start gap-3 pt-1.5">
                <span className="text-base font-semibold">Ouvrez le formulaire de désignation</span>
                <a
                  href="https://usagers.antai.gouv.fr/fr/contestation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center gap-2 rounded-xl bg-ink px-5 text-[15px] font-semibold text-white no-underline"
                >
                  Ouvrir le site ANTAI
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 4h6v6" />
                    <path d="M20 4l-9 9" />
                    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                  </svg>
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink font-mono text-[15px] text-app-bg">
                3
              </span>
              <div className="pt-1.5">
                <span className="mb-1 block text-base font-semibold">
                  Collez, résolvez le captcha, puis désignez le conducteur
                </span>
                <span className="text-sm text-muted">
                  Ses informations restent affichées ici pour la suite du formulaire.
                </span>
              </div>
            </li>
          </ol>

          {copyFailed && (
            <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              La copie automatique n&apos;a pas fonctionné sur cet appareil. Sélectionnez le
              texte manuellement, puis copiez-le (Ctrl/Cmd+C).
            </span>
          )}

          <p className="m-0 text-[13px] text-muted">
            Service indépendant, non affilié à l&apos;ANTAI ni à l&apos;administration.
          </p>
        </section>

        <aside className="flex min-w-0 flex-1 basis-[420px] flex-col gap-[18px]">
          <div
            className="flex flex-col gap-0.5 rounded-2xl p-5"
            style={{ background: "#FFFFFF", border: "2px solid #1E3FB8" }}
          >
            <span className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-accent">
              À coller sur l&apos;ANTAI
            </span>
            {fields.map((f, i) => (
              <CopyRow
                key={f.id}
                id={f.id}
                label={f.label}
                value={f.value}
                copied={desktopCopiedField === f.id}
                last={i === fields.length - 1}
                onCopy={handleDesktopCopyField}
              />
            ))}
            <div className="mt-3">
              <BigCopyButton
                copied={desktopAllCopied}
                idleLabel="Copier les 3 champs"
                doneLabel="Copié dans le presse-papiers"
                onClick={handleDesktopCopyAll}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-[18px]">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              Conducteur désigné
            </span>
            <div
              className="grid gap-x-4.5 gap-y-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
            >
              <div>
                <span className="block text-xs text-muted">Nom, prénom</span>
                <span className="text-[15px]">{conducteurName || "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-muted">Né(e) le</span>
                <span className="text-[15px]">{conducteurBirth || "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-muted">N° du permis</span>
                <span className="font-mono text-[14px]">
                  {result.permis.numero_permis || "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted">Délivré le</span>
                <span className="text-[15px]">
                  {result.permis.date_delivrance_categorie_b || "—"}
                </span>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span className="block text-xs text-muted">Adresse</span>
                <span className="text-[15px]">{conducteurAddress || "—"}</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
    </>
  );
}
