import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  brandProfileSchema,
  calendarSlotSchema,
  defaultSettings,
  ideaSchema,
  settingsSchema,
  type BrandProfile,
  type CalendarSlot,
  type Idea,
  type Settings,
} from '@/lib/schema';
import { WorkspaceCorruptError } from './errors';
import { workspaceFiles } from './paths';
import { createQueue } from './queue';

async function readJson<T>(
  filePath: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T | null> {
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new WorkspaceCorruptError(filePath, (error as Error).message);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new WorkspaceCorruptError(
      filePath,
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    );
  }
  return result.data;
}

async function writeAtomic(filePath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(temp, contents, 'utf8');
  await rename(temp, filePath);
}

const ideasSchema = z.array(ideaSchema);
const calendarSchema = z.array(calendarSlotSchema);

export function createStore(root: string) {
  const enqueue = createQueue();
  const file = (name: string) => path.join(root, name);
  const expansionPath = (ideaId: string) =>
    path.join(root, workspaceFiles.expansions, `${ideaId}.md`);

  async function readIdeas(): Promise<Idea[]> {
    return (await readJson(file(workspaceFiles.ideas), ideasSchema)) ?? [];
  }

  async function writeIdeas(ideas: Idea[]): Promise<void> {
    await writeAtomic(file(workspaceFiles.ideas), JSON.stringify(ideas, null, 2));
  }

  return {
    root,

    readBrand: (): Promise<BrandProfile | null> =>
      readJson(file(workspaceFiles.brand), brandProfileSchema),
    writeBrand: (profile: BrandProfile): Promise<void> =>
      enqueue(() => writeAtomic(file(workspaceFiles.brand), JSON.stringify(profile, null, 2))),

    readIdeas,
    writeIdeas: (ideas: Idea[]): Promise<void> => enqueue(() => writeIdeas(ideas)),
    appendIdeas: (incoming: Idea[]): Promise<Idea[]> =>
      enqueue(async () => {
        const merged = [...(await readIdeas()), ...incoming];
        await writeIdeas(merged);
        return merged;
      }),
    updateIdea: (id: string, patch: Partial<Idea>): Promise<Idea[]> =>
      enqueue(async () => {
        const next = (await readIdeas()).map((idea) =>
          idea.id === id ? { ...idea, ...patch } : idea,
        );
        await writeIdeas(next);
        return next;
      }),

    readCalendar: async (): Promise<CalendarSlot[]> =>
      (await readJson(file(workspaceFiles.calendar), calendarSchema)) ?? [],
    writeCalendar: (slots: CalendarSlot[]): Promise<void> =>
      enqueue(() => writeAtomic(file(workspaceFiles.calendar), JSON.stringify(slots, null, 2))),

    readSettings: async (): Promise<Settings> =>
      (await readJson(file(workspaceFiles.settings), settingsSchema)) ?? defaultSettings,
    writeSettings: (settings: Settings): Promise<void> =>
      enqueue(() => writeAtomic(file(workspaceFiles.settings), JSON.stringify(settings, null, 2))),

    readExpansion: async (ideaId: string): Promise<string | null> => {
      try {
        return await readFile(expansionPath(ideaId), 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    },
    writeExpansion: (ideaId: string, markdown: string): Promise<void> =>
      enqueue(() => writeAtomic(expansionPath(ideaId), markdown)),
  };
}

export type Store = ReturnType<typeof createStore>;
