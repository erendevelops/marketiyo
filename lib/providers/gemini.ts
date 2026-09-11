import type { CompletionResult, GenerateRequest, Provider, ProviderError } from './types';

type Options = { apiKey: string; model: string };

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function createGeminiProvider({ apiKey, model }: Options): Provider {
  async function call(prompt: string, maxOutputTokens: number, timeoutMs: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    id: 'gemini',

    async isAvailable() {
      if (!apiKey) return { available: false, detail: 'Gemini API anahtarı girilmedi.' };
      try {
        const response = await call('ping', 16, 15_000);
        if (response.ok) return { available: true, detail: `Model: ${model}` };
        if (response.status === 401 || response.status === 403) {
          return { available: false, detail: 'API anahtarı reddedildi.' };
        }
        return { available: false, detail: `Gemini ${response.status} döndürdü.` };
      } catch (error) {
        return { available: false, detail: (error as Error).message };
      }
    },

    async complete(req: GenerateRequest): Promise<CompletionResult> {
      try {
        const response = await call(
          req.prompt,
          req.maxOutputTokens ?? 8192,
          req.timeoutMs ?? 180_000,
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: { message?: string };
          };
          const code: ProviderError['code'] =
            response.status === 401 || response.status === 403 ? 'auth' : 'transport';
          return {
            ok: false,
            error: { code, message: body.error?.message ?? `Gemini ${response.status}` },
          };
        }

        const body = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const raw =
          body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
        return { ok: true, raw };
      } catch (error) {
        const aborted = (error as Error).name === 'AbortError';
        return {
          ok: false,
          error: { code: aborted ? 'timeout' : 'transport', message: (error as Error).message },
        };
      }
    },
  };
}
