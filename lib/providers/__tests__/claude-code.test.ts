import { describe, it, expect } from 'vitest';
import { classifyCliFailure } from '@/lib/providers/claude-code';

describe('classifyCliFailure', () => {
  it('reads the message from stderr when present', () => {
    expect(classifyCliFailure('boom on stderr', 'ignored stdout').message).toBe('boom on stderr');
  });

  it('falls back to stdout, which is where the cli prints some failures', () => {
    const result = classifyCliFailure('', 'Failed to authenticate: OAuth session expired');
    expect(result.message).toContain('OAuth session expired');
  });

  it('classifies an expired login as an auth failure', () => {
    expect(
      classifyCliFailure('', 'Failed to authenticate: OAuth session expired').code,
    ).toBe('auth');
  });

  it('classifies a login prompt as an auth failure', () => {
    expect(classifyCliFailure('Please run /login first', '').code).toBe('auth');
  });

  it('treats anything else as transport', () => {
    expect(classifyCliFailure('segfault', '').code).toBe('transport');
  });

  it('still produces a message when both streams are empty', () => {
    expect(classifyCliFailure('', '').message.length).toBeGreaterThan(0);
  });
});
