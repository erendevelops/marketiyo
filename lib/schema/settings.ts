import { z } from 'zod';
import { languageSchema } from './brand';

export const providerIdSchema = z.enum(['claude-code', 'gemini', 'stub']);
export type ProviderId = z.infer<typeof providerIdSchema>;

export const settingsSchema = z.object({
  providerId: providerIdSchema.default('claude-code'),
  geminiApiKey: z.string().default(''),
  geminiModel: z.string().default('gemini-2.0-flash'),
  claudeBinary: z.string().default('claude'),
  interfaceLanguage: languageSchema.default('tr'),
  onboarded: z.boolean().default(false),
});
export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = settingsSchema.parse({});

export type RedactedSettings = Omit<Settings, 'geminiApiKey'> & { hasGeminiKey: boolean };

/** Never send the key to the browser. */
export function redactSettings(settings: Settings): RedactedSettings {
  const { geminiApiKey, ...rest } = settings;
  return { ...rest, hasGeminiKey: geminiApiKey.length > 0 };
}
