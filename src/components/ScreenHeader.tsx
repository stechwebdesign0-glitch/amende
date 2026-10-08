export function ScreenHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="-ml-2.5 flex h-11 w-11 items-center justify-center text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      ) : (
        <span className="h-11 w-11" />
      )}
      <span className="text-[13px] text-muted">{title}</span>
      <span className="h-11 w-11" />
    </header>
  );
}
