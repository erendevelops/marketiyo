import { z } from 'zod';

export const adNetworkSchema = z.enum(['meta', 'google-search', 'tiktok']);
export type AdNetwork = z.infer<typeof adNetworkSchema>;

export const campaignObjectiveSchema = z.enum([
  'awareness',
  'traffic',
  'leads',
  'sales',
  'app-installs',
]);
export type CampaignObjective = z.infer<typeof campaignObjectiveSchema>;

/**
 * Character limits are enforced here rather than in the prompt alone, so copy
 * that would be truncated inside an ad manager never reaches the workspace.
 */
export const metaCreativeSchema = z.object({
  primaryTexts: z.array(z.string().min(1).max(125)).min(1),
  headlines: z.array(z.string().min(1).max(40)).min(1),
  descriptions: z.array(z.string().min(1).max(30)).min(1),
  visualDirection: z.string().min(1),
});

export const googleSearchCreativeSchema = z.object({
  headlines: z.array(z.string().min(1).max(30)).min(3).max(15),
  descriptions: z.array(z.string().min(1).max(90)).min(2).max(4),
  keywordGroups: z
    .array(z.object({ theme: z.string().min(1), keywords: z.array(z.string().min(1)).min(1) }))
    .min(1),
});

export const tiktokCreativeSchema = z.object({
  adTexts: z.array(z.string().min(1).max(100)).min(1),
  hook: z.string().min(1),
  script: z.string().min(1),
});

export const creativesSchema = z.object({
  meta: metaCreativeSchema.optional(),
  'google-search': googleSearchCreativeSchema.optional(),
  tiktok: tiktokCreativeSchema.optional(),
});
export type Creatives = z.infer<typeof creativesSchema>;

/** One ad set as the model returns it. Identifiers are assigned by the app. */
export const generatedAdSetSchema = z.object({
  angle: z.string().min(1),
  hypothesis: z.string().min(1),
  targeting: z.string().min(1),
  budgetShare: z.number().min(1).max(100),
  budgetRationale: z.string().min(1),
  creatives: creativesSchema,
});
export type GeneratedAdSet = z.infer<typeof generatedAdSetSchema>;

export const adSetSchema = generatedAdSetSchema.extend({
  id: z.string().min(1),
  budgetAmount: z.number().min(0),
});
export type AdSet = z.infer<typeof adSetSchema>;

/** Only the envelope is validated. Ad sets are parsed one by one by the caller. */
export const campaignPlanResponseSchema = z.object({
  positioning: z.string().min(1),
  adSets: z.array(z.unknown()),
});
export type CampaignPlanResponse = z.infer<typeof campaignPlanResponseSchema>;

export const campaignInputSchema = z.object({
  name: z.string().min(1),
  objective: campaignObjectiveSchema,
  audienceRef: z.string().min(1),
  networks: z.array(adNetworkSchema).min(1),
  totalBudget: z.number().min(0),
  currency: z.string().min(1).max(8),
  periodDays: z.number().int().min(1).max(365),
  notes: z.string().default(''),
});
export type CampaignInput = z.infer<typeof campaignInputSchema>;

export const campaignSchema = campaignInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  positioning: z.string().min(1),
  adSets: z.array(adSetSchema),
  promptVersion: z.string().min(1),
});
export type Campaign = z.infer<typeof campaignSchema>;
