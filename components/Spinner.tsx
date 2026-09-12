/** A small activity indicator, sized to sit inside a button next to its label. */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px] motion-reduce:animate-none ${className}`}
    />
  );
}

/** Button content while an action is running: the indicator plus what it is doing. */
export function Busy({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner />
      {label}
    </span>
  );
}
