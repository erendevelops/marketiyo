import type { ZodTypeAny } from 'zod';
import { brandProfileSchema } from './brand';
import { expansionResponseSchema, ideaBatchResponseSchema } from './idea';
import { campaignPlanResponseSchema } from './campaign';
import { articleBatchResponseSchema, articleDraftResponseSchema } from './article';

export * from './brand';
export * from './idea';
export * from './calendar';
export * from './campaign';
export * from './article';
export * from './settings';

const registry: Record<string, ZodTypeAny> = {
  ideaBatchResponse: ideaBatchResponseSchema,
  expansionResponse: expansionResponseSchema,
  brandProfile: brandProfileSchema,
  campaignPlanResponse: campaignPlanResponseSchema,
  articleBatchResponse: articleBatchResponseSchema,
  articleDraftResponse: articleDraftResponseSchema,
};

export function schemaByName(name: string): ZodTypeAny {
  const schema = registry[name];
  if (!schema) throw new Error(`Unknown schema: ${name}`);
  return schema;
}

export const schemaNames = Object.keys(registry);
