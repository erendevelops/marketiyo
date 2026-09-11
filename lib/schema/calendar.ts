import { z } from 'zod';
import { platformSchema } from './brand';

export const slotStatusSchema = z.enum(['planned', 'ready', 'posted', 'skipped']);
export type SlotStatus = z.infer<typeof slotStatusSchema>;

export const calendarSlotSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
  platform: platformSchema,
  ideaId: z.string().nullable(),
  status: slotStatusSchema.default('planned'),
  note: z.string().default(''),
});
export type CalendarSlot = z.infer<typeof calendarSlotSchema>;
