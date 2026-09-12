import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandForm } from '@/components/BrandForm';
import { IdeaBoard } from '@/components/IdeaBoard';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** A request that never settles, so the pending state stays on screen. */
function hangingFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => undefined)),
  );
}

describe('loading states', () => {
  it('shows a spinner and a busy label while the brand draft runs', async () => {
    hangingFetch();
    const user = userEvent.setup();
    render(<BrandForm initial={null} language="tr" />);

    const draftButton = screen.getByRole('button', { name: /taslağı oluştur/i });
    expect(draftButton).toBeDisabled();

    await user.type(
      screen.getByRole('textbox', { name: /ürününü anlat/i }),
      'Tek kişilik geliştiriciler için yerel çalışan bir pazarlama aracı.',
    );
    expect(draftButton).toBeEnabled();

    await user.click(draftButton);

    await waitFor(() => expect(screen.getByText(/taslak çıkarılıyor/i)).toBeInTheDocument());
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /taslak çıkarılıyor/i })).toBeDisabled();
  });

  it('shows a spinner while an idea batch is generating', async () => {
    hangingFetch();
    const user = userEvent.setup();
    render(<IdeaBoard initial={[]} language="tr" activePlatforms={['x']} />);

    await user.click(screen.getByRole('button', { name: /fikirleri üret/i }));

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /üretiliyor/i })).toBeDisabled();
  });

  it('returns the button to its resting label once the request settles', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ideas: [], discarded: 0 }), { status: 200 })),
    );
    const user = userEvent.setup();
    render(<IdeaBoard initial={[]} language="tr" activePlatforms={['x']} />);

    await user.click(screen.getByRole('button', { name: /fikirleri üret/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /fikirleri üret/i })).toBeEnabled(),
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
