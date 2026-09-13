import { describe, it, expect } from 'vitest';
import {
  CLAUDE_INSTALL_HINT,
  CLAUDE_LOGIN_HINT,
  availabilityFrom,
  classifyCliFailure,
  createClaudeCodeProvider,
  type RunResult,
} from '@/lib/providers/claude-code';

const ok = (stdout: string): RunResult => ({
  code: 0,
  stdout,
  stderr: '',
  timedOut: false,
  spawnFailed: false,
});

describe('availabilityFrom', () => {
  it('points to installation when the binary does not run', () => {
    const missing = { ...ok(''), code: 1, stderr: "'claude' is not recognized" };
    expect(availabilityFrom(missing, null)).toEqual({ available: false, detail: CLAUDE_INSTALL_HINT });
  });

  it('does not pass setup on a version check alone when logged out', () => {
    const report = availabilityFrom(
      ok('2.1.0 (Claude Code)'),
      ok('Invalid API key · Please run /login'),
    );
    expect(report).toEqual({ available: false, detail: CLAUDE_LOGIN_HINT });
  });

  it('treats a non-zero auth failure as a missing login', () => {
    const ping = { ...ok(''), code: 1, stderr: 'Failed to authenticate' };
    expect(availabilityFrom(ok('2.1.0'), ping).detail).toBe(CLAUDE_LOGIN_HINT);
  });

  it('passes when the prompt answers', () => {
    expect(availabilityFrom(ok('2.1.0 (Claude Code)'), ok('OK')).available).toBe(true);
  });
});

describe('claude code isAvailable', () => {
  it('skips the prompt when the binary is missing', async () => {
    const calls: string[][] = [];
    const provider = createClaudeCodeProvider({
      binary: 'claude',
      runner: async (_binary, args) => {
        calls.push(args);
        return { ...ok(''), spawnFailed: true };
      },
    });
    expect((await provider.isAvailable()).available).toBe(false);
    expect(calls).toEqual([['--version']]);
  });
});

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
