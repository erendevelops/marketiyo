import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSettings = vi.fn();
const writeSettings = vi.fn();

vi.mock('@/lib/server/store', () => ({ getStore: () => ({ readSettings, writeSettings }) }));

const stored = {
  providerId: 'claude-code',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  claudeBinary: 'claude',
  interfaceLanguage: 'tr',
  onboarded: false,
};

beforeEach(() => {
  readSettings.mockReset();
  writeSettings.mockReset();
  readSettings.mockResolvedValue(stored);
});

function put(body: unknown) {
  return new Request('http://localhost/api/settings', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

describe('GET /api/settings', () => {
  it('never returns the raw gemini key', async () => {
    readSettings.mockResolvedValue({ ...stored, providerId: 'gemini', geminiApiKey: 'super-secret' });
    const { GET } = await import('@/app/api/settings/route');
    const body = await (await GET()).json();
    expect(JSON.stringify(body)).not.toContain('super-secret');
    expect(body.hasGeminiKey).toBe(true);
  });
});

describe('PUT /api/settings', () => {
  it('merges the patch onto the existing settings', async () => {
    const { PUT } = await import('@/app/api/settings/route');
    const response = await PUT(put({ providerId: 'gemini', geminiApiKey: 'k' }));
    expect(response.status).toBe(200);
    expect(writeSettings).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'gemini', geminiApiKey: 'k', claudeBinary: 'claude' }),
    );
  });

  it('rejects an invalid provider id', async () => {
    const { PUT } = await import('@/app/api/settings/route');
    const response = await PUT(put({ providerId: 'openai' }));
    expect(response.status).toBe(400);
    expect(writeSettings).not.toHaveBeenCalled();
  });

  it('rejects a malformed body', async () => {
    const { PUT } = await import('@/app/api/settings/route');
    const response = await PUT(
      new Request('http://localhost/api/settings', { method: 'PUT', body: 'not json' }),
    );
    expect(response.status).toBe(400);
    expect(writeSettings).not.toHaveBeenCalled();
  });

  it('does not echo the key back in the response', async () => {
    const { PUT } = await import('@/app/api/settings/route');
    const response = await PUT(put({ providerId: 'gemini', geminiApiKey: 'leak-me' }));
    expect(JSON.stringify(await response.json())).not.toContain('leak-me');
  });
});
