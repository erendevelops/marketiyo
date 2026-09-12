'use client';

import { useEffect, useState } from 'react';

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

/**
 * Button content while an action is running. Long operations pass showElapsed
 * so the seconds are visible, because a spinner alone cannot tell the
 * difference between working and hung.
 */
export function Busy({ label, showElapsed = false }: { label: string; showElapsed?: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!showElapsed) return;
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [showElapsed]);

  return (
    <span className="inline-flex items-center gap-2">
      <Spinner />
      {label}
      {showElapsed && seconds > 0 && <span className="tabular-nums opacity-70">{seconds} sn</span>}
    </span>
  );
}
