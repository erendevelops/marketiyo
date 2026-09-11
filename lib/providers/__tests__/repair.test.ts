import { describe, it, expect, vi } from 'vitest';
import { createStubProvider, runWithRepair } from '@/lib/providers';

const req = { prompt: 'ignored', schemaName: 'ideaBatchResponse' };

const validPayload = JSON.stringify({
  ideas: [
    {
      platform: 'x',
      format: 'thread',
      angle: 'education',
      hook: 'h',
      premise: 'p',
      whyItWorks: 'w',
      audienceRef: 'A',
      score: 4,
      tags: [],
    },
  ],
});

describe('runWithRepair', () => {
  it('returns data on a first valid response', async () => {
    const result = await runWithRepair(createStubProvider([validPayload]), req);
    expect(result.ok).toBe(true);
  });

  it('retries exactly once when the first response is malformed', async () => {
    const provider = createStubProvider(['not json at all', validPayload]);
    const spy = vi.spyOn(provider, 'complete');
    const result = await runWithRepair(provider, req);
    expect(result.ok).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('gives up after one repair attempt', async () => {
    const provider = createStubProvider(['bad', 'still bad']);
    const spy = vi.spyOn(provider, 'complete');
    const result = await runWithRepair(provider, req);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('malformed-output');
  });

  it('includes the validation errors in the repair prompt', async () => {
    const provider = createStubProvider([JSON.stringify({ notIdeas: true }), validPayload]);
    const spy = vi.spyOn(provider, 'complete');
    await runWithRepair(provider, req);
    expect(spy.mock.calls[1][0].prompt).toContain('ideas');
  });

  it('surfaces a transport failure without retrying', async () => {
    const provider = createStubProvider([]);
    vi.spyOn(provider, 'complete').mockResolvedValue({
      ok: false,
      error: { code: 'timeout', message: 'zaman asimi' },
    });
    const result = await runWithRepair(provider, req);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('timeout');
  });

  it('throws for an unregistered schema name', async () => {
    await expect(
      runWithRepair(createStubProvider([validPayload]), { prompt: 'x', schemaName: 'nope' }),
    ).rejects.toThrow(/unknown schema/i);
  });
});
