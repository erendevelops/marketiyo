import { spawn } from 'node:child_process';
import type {
  AvailabilityReport,
  CompletionResult,
  GenerateRequest,
  Provider,
  ProviderError,
} from './types';

type Options = { binary: string };

export type RunResult = {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  spawnFailed: boolean;
};

function run(binary: string, args: string[], input: string, timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve) => {
    // Windows needs the shell to find claude.cmd, and the shell splits unquoted paths on spaces.
    const command =
      process.platform === 'win32' && binary.includes(' ') && !binary.startsWith('"')
        ? `"${binary}"`
        : binary;
    const child = spawn(command, args, {
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

export const CLAUDE_INSTALL_HINT =
  'Claude Code kurulu değil veya bu uygulamayı başlatan terminal onu göremiyor. Kurduktan sonra yeni bir terminal açıp uygulamayı yeniden başlat ya da aşağıya claude dosyasının tam yolunu yaz.';

export const CLAUDE_LOGIN_HINT =
  'Claude Code kurulu ama giriş yapılmamış. Bir terminalde "claude" komutunu çalıştırıp Pro veya Max hesabınla giriş yap, sonra tekrar sına.';

/**
 * `--version` succeeds without a login, so it only proves the binary exists.
 * The login is only proven by a real, tiny prompt.
 */
export function availabilityFrom(version: RunResult, ping: RunResult | null): AvailabilityReport {
  if (version.spawnFailed || version.code !== 0) {
    return { available: false, detail: CLAUDE_INSTALL_HINT };
  }
  const versionText = version.stdout.trim();
  if (!ping) return { available: false, detail: CLAUDE_INSTALL_HINT };
  if (ping.timedOut) {
    return {
      available: false,
      detail: `${versionText} bulundu ama yanıt vermedi. Terminalde "claude" komutunu bir kez çalıştırıp açılış sorularını tamamla.`,
    };
  }

  const loggedOut = /failed to authenticate|session expired|please run .login|not logged in|invalid api key/i;
  if (ping.code !== 0 || loggedOut.test(ping.stdout)) {
    const failure = classifyCliFailure(ping.stderr, ping.stdout);
    if (failure.code === 'auth' || loggedOut.test(ping.stdout)) {
      return { available: false, detail: CLAUDE_LOGIN_HINT };
    }
    return { available: false, detail: `${versionText}: ${failure.message}` };
  }
  return { available: true, detail: `${versionText}, giriş yapılmış` };
}

type Runner = typeof run;

/**
 * Drives the locally installed Claude Code binary in headless print mode.
 * Uses the user's existing subscription login, so no API key is involved.
 */
export function createClaudeCodeProvider({ binary, runner = run }: Options & { runner?: Runner }): Provider {
  return {
    id: 'claude-code',

    async isAvailable() {
      const version = await runner(binary, ['--version'], '', 15_000);
      if (version.spawnFailed || version.code !== 0) return availabilityFrom(version, null);
      // Costs a few tokens of the user's plan, but catches a missing login at setup
      // instead of on the first generation.
      const ping = await runner(binary, ['-p', '--output-format', 'text'], 'Reply with OK.', 90_000);
      return availabilityFrom(version, ping);
    },

    async complete(req: GenerateRequest): Promise<CompletionResult> {
      const result = await runner(
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
