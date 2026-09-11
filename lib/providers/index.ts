import { schemaByName, type Settings } from '@/lib/schema';
import { createClaudeCodeProvider } from './claude-code';
import { createGeminiProvider } from './gemini';
import { extractJson } from './json';
import type { GenerateRequest, GenerateResult, Provider } from './types';

export * from './types';
export { extractJson } from './json';
export { createStubProvider } from './stub';
export { createClaudeCodeProvider } from './claude-code';
export { createGeminiProvider } from './gemini';

function repairPrompt(original: string, raw: string, issues: string): string {
  return [
    original,
    '',
    '---',
    'Önceki yanıtın geçersizdi. Sadece geçerli JSON döndür, açıklama yazma.',
    `Doğrulama hataları: ${issues}`,
    'Geçersiz yanıt:',
    raw.slice(0, 2000),
  ].join('\n');
}

/** One generation with, at most, one repair retry on malformed or off-schema output. */
export async function runWithRepair<T>(
  provider: Provider,
  req: GenerateRequest,
): Promise<GenerateResult<T>> {
  const schema = schemaByName(req.schemaName);

  async function attempt(prompt: string) {
    const completion = await provider.complete({ ...req, prompt });
    if (!completion.ok) return { kind: 'transport', error: completion.error } as const;

    const json = extractJson(completion.raw);
    if (json === null) {
      return {
        kind: 'invalid',
        raw: completion.raw,
        issues: 'yanıt içinde JSON nesnesi bulunamadı',
      } as const;
    }

    const result = schema.safeParse(json);
    if (!result.success) {
      return {
        kind: 'invalid',
        raw: completion.raw,
        issues: result.error.issues
          .map((issue) => `${issue.path.join('.') || 'ideas'}: ${issue.message}`)
          .join('; '),
      } as const;
    }
    return { kind: 'ok', raw: completion.raw, data: result.data as T } as const;
  }

  const first = await attempt(req.prompt);
  if (first.kind === 'transport') return { ok: false, error: first.error };
  if (first.kind === 'ok') return { ok: true, data: first.data, raw: first.raw };

  const second = await attempt(repairPrompt(req.prompt, first.raw, first.issues));
  if (second.kind === 'transport') return { ok: false, error: second.error };
  if (second.kind === 'ok') return { ok: true, data: second.data, raw: second.raw };

  return {
    ok: false,
    error: { code: 'malformed-output', message: second.issues },
    raw: second.raw,
  };
}

export function getProvider(settings: Settings): Provider {
  if (settings.providerId === 'gemini') {
    return createGeminiProvider({ apiKey: settings.geminiApiKey, model: settings.geminiModel });
  }
  return createClaudeCodeProvider({ binary: settings.claudeBinary });
}
