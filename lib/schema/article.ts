import { z } from 'zod';

export const searchIntentSchema = z.enum([
  'informational',
  'commercial',
  'transactional',
  'navigational',
]);
export type SearchIntent = z.infer<typeof searchIntentSchema>;

export const funnelStageSchema = z.enum(['awareness', 'consideration', 'decision']);
export type FunnelStage = z.infer<typeof funnelStageSchema>;

export const articleStatusSchema = z.enum(['new', 'kept', 'rejected', 'drafted']);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

/**
 * No search volume or difficulty score is modelled anywhere. The engine has no
 * access to that data, and a fabricated number is worse than no number.
 */
export const generatedArticleSchema = z.object({
  title: z.string().min(1).max(120),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string().min(1)).default([]),
  searchIntent: searchIntentSchema,
  funnelStage: funnelStageSchema,
  angle: z.string().min(1),
  whyItWorks: z.string().min(1),
  outlinePoints: z.array(z.string().min(1)).min(3),
});
export type GeneratedArticle = z.infer<typeof generatedArticleSchema>;

/** Only the envelope is validated. Items are parsed one by one by the caller. */
export const articleBatchResponseSchema = z.object({
  articles: z.array(z.unknown()),
});
export type ArticleBatchResponse = z.infer<typeof articleBatchResponseSchema>;

export const articleSchema = generatedArticleSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  batchId: z.string().min(1),
  status: articleStatusSchema.default('new'),
  promptVersion: z.string().min(1),
});
export type Article = z.infer<typeof articleSchema>;

export const articleDraftResponseSchema = z.object({
  markdown: z.string().min(1),
  metaTitle: z.string().min(1).max(60),
  metaDescription: z.string().min(1).max(160),
});
export type ArticleDraftResponse = z.infer<typeof articleDraftResponseSchema>;
