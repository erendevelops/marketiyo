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
        detail: `Claude Code calistirilamadi. PATH uzerinde "${binary}" bulunamadi.`,
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
        return { ok: false, error: { code: 'timeout', message: 'Claude Code zaman asimina ugradi.' } };
      }
      if (result.spawnFailed) {
        return {
          ok: false,
          error: { code: 'not-available', message: `Claude Code baslatilamadi: ${result.stderr}` },
        };
      }
      if (result.code !== 0) {
        const message = result.stderr.trim() || 'Claude Code sifir disi cikis kodu dondurdu.';
        const code: ProviderError['code'] = /login|auth|unauthori/i.test(message)
          ? 'auth'
          : 'transport';
        return { ok: false, error: { code, message } };
      }
      return { ok: true, raw: result.stdout };
    },
  };
}
