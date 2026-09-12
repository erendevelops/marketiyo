import { z } from 'zod';
import { platformSchema } from './brand';

export const angleSchema = z.enum(['education', 'proof', 'contrarian', 'story', 'offer']);
export type Angle = z.infer<typeof angleSchema>;

export const ideaStatusSchema = z.enum(['new', 'kept', 'rejected', 'expanded', 'scheduled']);
export type IdeaStatus = z.infer<typeof ideaStatusSchema>;

export const rejectionReasonSchema = z.enum([
  'off-brand',
  'too-generic',
  'already-done',
  'wrong-audience',
  'weak-hook',
  'other',
]);
export type RejectionReason = z.infer<typeof rejectionReasonSchema>;

/**
 * The shape the model returns. No identifiers, no status, and no platform:
 * the app assigns all three. Asking the model to echo back a value the user
 * already chose only creates a way for the batch to fail.
 */
export const generatedIdeaSchema = z.object({
  format: z.string().min(1),
  angle: angleSchema,
  hook: z.string().min(1).max(300),
  premise: z.string().min(1),
  whyItWorks: z.string().min(1),
  audienceRef: z.string(),
  score: z.number().min(0).max(10),
  tags: z.array(z.string()).default([]),
});
export type GeneratedIdea = z.infer<typeof generatedIdeaSchema>;

/**
 * Only the envelope is validated here. Items stay unknown on purpose, so that
 * one malformed idea cannot void an entire batch; the caller parses each item
 * with generatedIdeaSchema and counts what it discards.
 */
export const ideaBatchResponseSchema = z.object({
  ideas: z.array(z.unknown()),
});
export type IdeaBatchResponse = z.infer<typeof ideaBatchResponseSchema>;

export const ideaSchema = generatedIdeaSchema.extend({
  platform: platformSchema,
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  batchId: z.string().min(1),
  status: ideaStatusSchema.default('new'),
  rejectionReason: rejectionReasonSchema.optional(),
  promptVersion: z.string().min(1),
});
export type Idea = z.infer<typeof ideaSchema>;

export const expansionResponseSchema = z.object({
  markdown: z.string().min(1),
});
export type ExpansionResponse = z.infer<typeof expansionResponseSchema>;
