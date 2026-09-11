import { spawn } from 'node:child_process';
import type { CompletionResult, GenerateRequest, Provider, ProviderError } from './types';

type Options = { binary: string };

type RunResult = {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  spawnFailed: boolean;
};

function run(binary: string, args: string[], input: string, timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn(binary, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;

    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => {
      finish({ code: null, stdout, stderr: `${stderr}${error.message}`, timedOut, spawnFailed: true });
    });
    child.on('close', (code) => {
      finish({ code, stdout, stderr, timedOut, spawnFailed: false });
    });

    child.stdin.on('error', () => undefined);
    child.stdin.write(input);
    child.stdin.end();
  });
}


/**
 * The CLI prints some failures to stdout rather than stderr, so both streams
 * are considered before deciding what went wrong.
 */
export function classifyCliFailure(stderr: string, stdout: string): ProviderError {
  const message =
    stderr.trim() || stdout.trim() || 'Claude Code beklenmeyen bir hata döndürdü.';
  const isAuth = /login|log in|authenticate|auth|unauthori|oauth|session expired/i.test(message);
  return { code: isAuth ? 'auth' : 'transport', message };
}

/**
 * Drives the locally installed Claude Code binary in headless print mode.
 * Uses the user's existing subscription login, so no API key is involved.
 */
export function createClaudeCodeProvider({ binary }: Options): Provider {
  return {
    id: 'claude-code',

    async isAvailable() {
      const result = await run(binary, ['--version'], '', 15_000);
      if (result.code === 0) return { available: true, detail: result.stdout.trim() };
      return {
        available: false,
        detail: `Claude Code çalıştırılamadı. PATH üzerinde "${binary}" bulunamadı.`,
      };
    },

    async complete(req: GenerateRequest): Promise<CompletionResult> {
      const result = await run(
        binary,
        ['-p', '--output-format', 'text'],
        req.prompt,
        req.timeoutMs ?? 180_000,
      );

      if (result.timedOut) {
        return { ok: false, error: { code: 'timeout', message: 'Claude Code zaman aşımına uğradı.' } };
      }
      if (result.spawnFailed) {
        return {
          ok: false,
          error: { code: 'not-available', message: `Claude Code başlatılamadı: ${result.stderr}` },
        };
      }
      if (result.code !== 0) {
        return { ok: false, error: classifyCliFailure(result.stderr, result.stdout) };
      }

      // A zero exit with an authentication notice and no usable output is still a failure.
      if (/failed to authenticate|session expired|please run .login/i.test(result.stdout)) {
        return { ok: false, error: classifyCliFailure('', result.stdout) };
      }

      return { ok: true, raw: result.stdout };
    },
  };
}
