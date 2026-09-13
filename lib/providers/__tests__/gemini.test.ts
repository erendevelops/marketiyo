import { describe, it, expect, vi, afterEach } from 'vitest';
import { createGeminiProvider } from '@/lib/providers/gemini';

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const req = { prompt: 'hi', schemaName: 'ideaBatchResponse' };

describe('gemini provider', () => {
  it('reports unavailable without a key', async () => {
    const provider = createGeminiProvider({ apiKey: '', model: 'gemini-3.1-flash-lite' });
    expect((await provider.isAvailable()).available).toBe(false);
  });

  it('returns the first candidate text', async () => {
    stubFetch({ candidates: [{ content: { parts: [{ text: '{"ideas":[]}' }] } }] });
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-3.1-flash-lite' });
    const result = await provider.complete(req);
    expect(result.ok && result.raw).toBe('{"ideas":[]}');
  });

  it('maps a 401 to an auth error', async () => {
    stubFetch({ error: { message: 'bad key' } }, 401);
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-3.1-flash-lite' });
    const result = await provider.complete(req);
    expect(!result.ok && result.error.code).toBe('auth');
  });

  it('maps a 500 to a transport error', async () => {
    stubFetch({ error: { message: 'boom' } }, 500);
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-3.1-flash-lite' });
    const result = await provider.complete(req);
    expect(!result.ok && result.error.code).toBe('transport');
  });

  it('maps a 429 to a readable quota error', async () => {
    stubFetch({ error: { message: 'RESOURCE_EXHAUSTED' } }, 429);
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-3.1-flash-lite' });
    const result = await provider.complete(req);
    expect(!result.ok && result.error.code).toBe('rate-limit');
    expect(!result.ok && result.error.message).toContain('kotası doldu');
  });

  it('explains a missing model instead of a bare 404', async () => {
    stubFetch({ error: { message: 'not found' } }, 404);
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-9-flash' });
    const report = await provider.isAvailable();
    expect(report.available).toBe(false);
    expect(report.detail).toContain('gemini-9-flash modeli bulunamadı');
  });

  it('sends the key in a header, never in the url', async () => {
    const fetchMock = stubFetch({ candidates: [{ content: { parts: [{ text: '{}' }] } }] });
    const provider = createGeminiProvider({ apiKey: 'secret', model: 'gemini-3.1-flash-lite' });
    await provider.complete(req);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain('secret');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('secret');
  });
});
