import { z } from 'zod';

export const platformSchema = z.enum(['short-video', 'x', 'linkedin', 'instagram-static']);
export type Platform = z.infer<typeof platformSchema>;

export const languageSchema = z.enum(['tr', 'en']);
export type Language = z.infer<typeof languageSchema>;

export const brandProfileSchema = z.object({
  productName: z.string().min(1),
  oneLiner: z.string().min(1),
  category: z.string().min(1),
  audiences: z
    .array(
      z.object({
        label: z.string().min(1),
        pain: z.string().min(1),
        desire: z.string().min(1),
        whereTheyHangOut: z.string(),
      }),
    )
    .min(1),
  offers: z.array(z.object({ label: z.string(), cta: z.string(), url: z.string() })),
  voice: z.object({
    do: z.array(z.string()),
    dont: z.array(z.string()),
    referenceExamples: z.array(z.string()),
  }),
  proof: z.array(z.string()),
  competitors: z.array(
    z.object({ name: z.string(), positioning: z.string(), whatWeDoDifferently: z.string() }),
  ),
  bannedClaims: z.array(z.string()),
  outputLanguage: languageSchema,
  platforms: z.array(platformSchema).min(1),
  updatedAt: z.string().datetime(),
});

export type BrandProfile = z.infer<typeof brandProfileSchema>;
