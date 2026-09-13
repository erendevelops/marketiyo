import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = {
  readSettings: vi.fn(),
  readBrand: vi.fn(),
  readIdeas: vi.fn(),
  readCalendar: vi.fn(),
  readCampaigns: vi.fn(),
  readArticles: vi.fn(),
};

const redirect = vi.fn((target: string) => {
  throw new Error(`REDIRECT:${target}`);
});

vi.mock('@/lib/server/store', () => ({ getStore: () => store }));
vi.mock('next/navigation', () => ({ redirect }));

beforeEach(() => {
  Object.values(store).forEach((fn) => fn.mockReset());
  redirect.mockClear();
  store.readBrand.mockResolvedValue(null);
  store.readIdeas.mockResolvedValue([]);
  store.readCalendar.mockResolvedValue([]);
  store.readCampaigns.mockResolvedValue([]);
  store.readArticles.mockResolvedValue([]);
});

async function renderHome() {
  const { default: Home } = await import('@/app/page');
  return Home().catch((error: Error) => error);
}

describe('home page', () => {
  it('shows the dashboard to a fresh install instead of redirecting to setup', async () => {
    store.readSettings.mockResolvedValue({ onboarded: false, interfaceLanguage: 'tr' });
    const result = await renderHome();
    expect(redirect).not.toHaveBeenCalled();
    expect(result).not.toBeInstanceOf(Error);
  });

  it('shows the dashboard to an onboarded install with no brand, rather than redirecting', async () => {
    store.readSettings.mockResolvedValue({ onboarded: true, interfaceLanguage: 'tr' });
    const result = await renderHome();
    expect(redirect).not.toHaveBeenCalled();
    expect(result).not.toBeInstanceOf(Error);
  });

  it('shows the dashboard to a ready install', async () => {
    store.readSettings.mockResolvedValue({ onboarded: true, interfaceLanguage: 'tr' });
    store.readBrand.mockResolvedValue({ productName: 'Uzayalım' });
    const result = await renderHome();
    expect(redirect).not.toHaveBeenCalled();
    expect(result).not.toBeInstanceOf(Error);
  });
});
