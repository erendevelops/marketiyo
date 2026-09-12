const bar = 'animate-pulse rounded bg-neutral-900 motion-reduce:animate-none';

/**
 * Shown while a page loads its workspace files. The shapes mirror the real
 * layout, so the page does not jump when the content arrives.
 */
export function PageSkeleton({
  width = 'max-w-4xl',
  rows = 3,
  panel = true,
}: {
  width?: string;
  rows?: number;
  panel?: boolean;
}) {
  return (
    <main className={`mx-auto ${width} p-8`} aria-busy="true">
      <div className={`${bar} mb-3 h-7 w-56`} />
      <div className={`${bar} mb-8 h-4 w-4/5 max-w-lg`} />

      {panel && <div className={`${bar} mb-8 h-28 w-full`} />}

      <div className="space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className={`${bar} h-24 w-full`} />
        ))}
      </div>
    </main>
  );
}
