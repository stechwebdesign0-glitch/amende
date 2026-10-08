export function WizardHeader({
  currentStep,
  totalSteps,
  onBack,
}: {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-lg font-bold">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Retour"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-app-bg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path d="M14 3v6h6" />
                <path d="M8 15l2.5 2.5L16 12" />
              </svg>
            </span>
          )}
          Désigner
        </div>
        <span className="text-[13px] text-muted">
          Étape {currentStep} sur {totalSteps}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i < currentStep ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
