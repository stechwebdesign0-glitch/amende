const STEPS: { step: 1 | 2 | 3; label: string }[] = [
  { step: 1, label: "Photos" },
  { step: 2, label: "Relecture" },
  { step: 3, label: "Transmission" },
];

export function DesktopHeader({
  currentStep,
  onExportJson,
}: {
  currentStep: 1 | 2 | 3;
  onExportJson: () => void;
}) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="font-display flex items-center gap-2.5 text-xl font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-ink text-app-bg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6" />
              <path d="M8 15l2.5 2.5L16 12" />
            </svg>
          </span>
          Désigner
        </div>

        <nav aria-label="Étapes" className="flex flex-wrap items-center gap-3.5">
          {STEPS.map((s, i) => {
            const done = s.step < currentStep;
            const active = s.step === currentStep;
            return (
              <div key={s.step} className="flex items-center gap-3.5">
                {i > 0 && <span className="h-px w-7 bg-line" />}
                <span
                  className={`flex items-center gap-2 text-sm ${
                    done ? "text-success" : active ? "font-semibold text-ink" : "text-muted"
                  }`}
                >
                  {done ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 12.5l2.7 2.7L16 10" />
                    </svg>
                  ) : (
                    <span
                      className="box-border flex h-5 w-5 items-center justify-center rounded-full text-[12px]"
                      style={
                        active
                          ? { background: "#1E3FB8", color: "#FFFFFF" }
                          : { border: "1.5px solid #8A8E96" }
                      }
                    >
                      {s.step}
                    </span>
                  )}
                  {s.label}
                </span>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onExportJson}
          className="h-10 rounded-[10px] border border-line bg-card px-3.5 text-sm text-ink"
        >
          Exporter en JSON
        </button>
      </div>
    </header>
  );
}
