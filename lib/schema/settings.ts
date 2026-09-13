import { z } from 'zod';
import { languageSchema } from './brand';

export const providerIdSchema = z.enum(['claude-code', 'gemini', 'stub']);
export type ProviderId = z.infer<typeof providerIdSchema>;

export const themeSchema = z.enum(['dark', 'light']);
export type Theme = z.infer<typeof themeSchema>;

/**
 * Models offered in setup, recommended first. Free tier limits differ a lot:
 * the Flash Lite models allow 500 requests a day, the Flash models only 20.
 */
export const geminiModels = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
] as const;

export const defaultGeminiModel = geminiModels[0];

/** Google shut these down. A saved one would fail every request, so it is replaced. */
function isRetiredGeminiModel(model: string): boolean {
  return model.startsWith('gemini-2.0-') || model.startsWith('gemini-1.');
}

export const settingsSchema = z.object({
  providerId: providerIdSchema.default('claude-code'),
  geminiApiKey: z.string().default(''),
  geminiModel: z
    .string()
    .default(defaultGeminiModel)
    .transform((model) => (isRetiredGeminiModel(model) ? defaultGeminiModel : model)),
  claudeBinary: z.string().default('claude'),
  interfaceLanguage: languageSchema.default('tr'),
  theme: themeSchema.default('dark'),
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
