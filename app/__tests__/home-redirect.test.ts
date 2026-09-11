import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSettings = vi.fn();
const readBrand = vi.fn();
const redirect = vi.fn((target: string) => {
  throw new Error(`REDIRECT:${target}`);
});

vi.mock('@/lib/server/store', () => ({ getStore: () => ({ readSettings, readBrand }) }));
vi.mock('next/navigation', () => ({ redirect }));

beforeEach(() => {
  readSettings.mockReset();
  readBrand.mockReset();
  redirect.mockClear();
});

async function run() {
  const { default: Home } = await import('@/app/page');
  await Home().catch(() => undefined);
}

describe('home routing', () => {
  it('sends a fresh install to setup', async () => {
    readSettings.mockResolvedValue({ onboarded: false });
    readBrand.mockResolvedValue(null);
    await run();
    expect(redirect).toHaveBeenCalledWith('/setup');
  });

  it('sends an onboarded install with no brand to the brand page', async () => {
    readSettings.mockResolvedValue({ onboarded: true });
    readBrand.mockResolvedValue(null);
    await run();
    expect(redirect).toHaveBeenCalledWith('/brand');
  });

  it('sends a ready install to the idea bank', async () => {
    readSettings.mockResolvedValue({ onboarded: true });
    readBrand.mockResolvedValue({ productName: 'Marketiyo' });
    await run();
    expect(redirect).toHaveBeenCalledWith('/ideas');
  });
});
