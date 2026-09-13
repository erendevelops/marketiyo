import { describe, it, expect, vi, beforeEach } from 'vitest';

const resetWorkspace = vi.fn();
vi.mock('@/lib/server/store', () => ({ getStore: () => ({ resetWorkspace }) }));

beforeEach(() => resetWorkspace.mockReset());

function post(body: unknown) {
  return new Request('http://localhost/api/workspace/reset', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/workspace/reset', () => {
  it('resets when the confirmation token is present', async () => {
    const { POST } = await import('@/app/api/workspace/reset/route');
    const response = await POST(post({ confirm: 'SIFIRLA' }));
    expect(response.status).toBe(200);
    expect(resetWorkspace).toHaveBeenCalledTimes(1);
  });

  it('refuses an empty body', async () => {
    const { POST } = await import('@/app/api/workspace/reset/route');
    const response = await POST(post({}));
    expect(response.status).toBe(400);
    expect(resetWorkspace).not.toHaveBeenCalled();
  });

  it('refuses the wrong token', async () => {
    const { POST } = await import('@/app/api/workspace/reset/route');
    const response = await POST(post({ confirm: 'evet' }));
    expect(response.status).toBe(400);
    expect(resetWorkspace).not.toHaveBeenCalled();
  });

  it('refuses a malformed body', async () => {
    const { POST } = await import('@/app/api/workspace/reset/route');
    const response = await POST(
      new Request('http://localhost/api/workspace/reset', { method: 'POST', body: 'not json' }),
    );
    expect(response.status).toBe(400);
    expect(resetWorkspace).not.toHaveBeenCalled();
  });
});
