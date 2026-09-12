'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Spinner } from '@/components/Spinner';

export type NavItem = { href: string; label: string };

/**
 * Navigation is driven through a transition so the bar knows, for real, that a
 * move is in flight. The destination is marked active on click rather than when
 * the server answers, and the spinner reflects actual pending work.
 *
 * In development the first visit to a route compiles it, which costs a second
 * or two; prefetching is disabled there, so the pending state is what makes the
 * wait legible. Production serves compiled routes and prefetches them.
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
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
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                if (item.href === pathname) return;

                setTarget(item.href);
                startTransition(() => router.push(item.href));
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
