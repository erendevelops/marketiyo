'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Spinner } from '@/components/Spinner';

export type NavItem = { href: string; label: string };

/**
 * Marks the destination active the moment it is clicked rather than when the
 * server responds, so the bar reacts immediately even though every page reads
 * files on the server.
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    setTarget(null);
  }, [pathname]);

  const activeHref = target ?? items.find((item) => pathname.startsWith(item.href))?.href ?? null;

  return (
    <ul className="flex flex-wrap gap-1">
      {items.map((item) => {
        const active = item.href === activeHref;
        const loading = pending && target === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                setTarget(item.href);
                startTransition(() => undefined);
              }}
              className={`inline-flex items-center gap-2 rounded px-3 py-1.5 transition-colors ${
                active
                  ? 'bg-neutral-800 text-neutral-50'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
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
