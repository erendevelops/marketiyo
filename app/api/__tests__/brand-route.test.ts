import { describe, it, expect, vi, beforeEach } from 'vitest';

const readBrand = vi.fn();
const writeBrand = vi.fn();

vi.mock('@/lib/server/store', () => ({ getStore: () => ({ readBrand, writeBrand }) }));

const blockUnlessAllowed = vi.fn();
vi.mock('@/lib/server/onboarding', () => ({ blockUnlessAllowed }));

const valid = {
  productName: 'Marketiyo',
  oneLiner: 'Test',
  category: 'tool',
  audiences: [{ label: 'A', pain: 'B', desire: 'C', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

beforeEach(() => {
  readBrand.mockReset();
  writeBrand.mockReset();
  blockUnlessAllowed.mockReset();
  blockUnlessAllowed.mockResolvedValue(null);
});

function put(body: unknown) {
  return new Request('http://localhost/api/brand', { method: 'PUT', body: JSON.stringify(body) });
}

describe('brand routes', () => {
  it('returns null when no profile exists', async () => {
    readBrand.mockResolvedValue(null);
    const { GET } = await import('@/app/api/brand/route');
    expect(await (await GET()).json()).toBeNull();
  });

  it('saves a valid profile and stamps updatedAt', async () => {
    const { PUT } = await import('@/app/api/brand/route');
    const response = await PUT(put({ ...valid, updatedAt: '2000-01-01T00:00:00.000Z' }));
    expect(response.status).toBe(200);
    const saved = writeBrand.mock.calls[0][0];
    expect(new Date(saved.updatedAt).getFullYear()).toBeGreaterThan(2000);
  });

  it('refuses to save before setup is complete', async () => {
    const { NextResponse } = await import('next/server');
    blockUnlessAllowed.mockResolvedValue(
      NextResponse.json({ code: 'onboarding-incomplete' }, { status: 403 }),
    );
    const { PUT } = await import('@/app/api/brand/route');
    const response = await PUT(put(valid));
    expect(response.status).toBe(403);
    expect(writeBrand).not.toHaveBeenCalled();
  });

  it('rejects a profile with no audiences', async () => {
    const { PUT } = await import('@/app/api/brand/route');
    const response = await PUT(put({ ...valid, audiences: [] }));
    expect(response.status).toBe(400);
    expect(writeBrand).not.toHaveBeenCalled();
  });

  it('rejects a profile with no platforms', async () => {
    const { PUT } = await import('@/app/api/brand/route');
    const response = await PUT(put({ ...valid, platforms: [] }));
    expect(response.status).toBe(400);
    expect(writeBrand).not.toHaveBeenCalled();
  });
});
