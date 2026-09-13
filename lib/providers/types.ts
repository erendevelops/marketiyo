import type { ProviderId } from '@/lib/schema';

export type ProviderErrorCode =
  | 'not-available'
  | 'auth'
  | 'rate-limit'
  | 'timeout'
  | 'transport'
  | 'malformed-output';

export type ProviderError = {
  code: ProviderErrorCode;
  message: string;
};

export type AvailabilityReport = {
  available: boolean;
  detail: string;
};

export type GenerateRequest = {
  prompt: string;
  schemaName: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
};

export type CompletionResult =
  | { ok: true; raw: string }
  | { ok: false; error: ProviderError };

export type GenerateResult<T> =
  | { ok: true; data: T; raw: string }
  | { ok: false; error: ProviderError; raw?: string };

export interface Provider {
  readonly id: ProviderId;
  isAvailable(): Promise<AvailabilityReport>;
  /** Returns the raw text of one completion. Validation happens in runWithRepair. */
  complete(req: GenerateRequest): Promise<CompletionResult>;
}
