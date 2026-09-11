import type { CompletionResult, GenerateRequest, Provider } from './types';

/** Test double. Returns queued responses in order, repeating the last one. */
export function createStubProvider(responses: string[]): Provider {
  let index = 0;
  return {
    id: 'stub',
    async isAvailable() {
      return { available: true, detail: 'stub provider' };
    },
    async complete(_req: GenerateRequest): Promise<CompletionResult> {
      const raw = responses[Math.min(index, responses.length - 1)] ?? '';
      index += 1;
      return { ok: true, raw };
    },
  };
}
