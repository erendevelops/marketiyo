'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Spinner } from '@/components/Spinner';

export type NavItem = { href: string; label: string; locked?: boolean };

/**
 * Navigation runs through a transition so the bar knows, for real, that a move
 * is in flight. Locked items stay visible so the user can see what finishing
 * setup opens up, but they do not navigate.
 */
export function NavLinks({ items, lockedHint }: { items: NavItem[]; lockedHint: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    setTarget(null);
  }, [pathname]);

  const activeHref = target ?? items.find((item) => pathname.startsWith(item.href))?.href ?? null;

  return (
    <ul className="flex flex-wrap gap-0.5">
      {items.map((item) => {
        if (item.locked) {
          return (
            <li key={item.href}>
              <span
                aria-disabled="true"
                title={lockedHint}
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded px-2.5 py-1 text-neutral-600"
              >
                <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3 fill-current">
                  <path d="M5 7V5a3 3 0 1 1 6 0v2h.5A1.5 1.5 0 0 1 13 8.5v5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5v-5A1.5 1.5 0 0 1 4.5 7H5Zm1.5 0h3V5a1.5 1.5 0 0 0-3 0v2Z" />
                </svg>
                {item.label}
              </span>
            </li>
          );
        }

        const active = item.href === activeHref;
        const loading = pending && target === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                if (item.href === pathname) return;

                setTarget(item.href);
                startTransition(() => router.push(item.href));
              }}
              className={`inline-flex items-center gap-2 rounded border px-2.5 py-1 transition-colors ${
                active
                  ? 'border-neutral-700 bg-neutral-900 text-neutral-50'
                  : 'border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
              }`}
            >
              {item.label}
              {loading && <Spinner className="h-3 w-3" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
