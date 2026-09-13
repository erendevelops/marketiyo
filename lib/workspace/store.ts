import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  articleSchema,
  brandProfileSchema,
  calendarSlotSchema,
  campaignSchema,
  defaultSettings,
  ideaSchema,
  settingsSchema,
  type BrandProfile,
  type CalendarSlot,
  type Article,
  type Campaign,
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
const campaignsSchema = z.array(campaignSchema);
const articlesSchema = z.array(articleSchema);

export function createStore(root: string) {
  const enqueue = createQueue();
  const file = (name: string) => path.join(root, name);
  const expansionPath = (ideaId: string) =>
    path.join(root, workspaceFiles.expansions, `${ideaId}.md`);
  const campaignDocPath = (campaignId: string) =>
    path.join(root, workspaceFiles.campaignDocs, `${campaignId}.md`);

  const articleDraftPath = (articleId: string) =>
    path.join(root, workspaceFiles.articleDrafts, `${articleId}.md`);

  async function readArticles(): Promise<Article[]> {
    return (await readJson(file(workspaceFiles.articles), articlesSchema)) ?? [];
  }

  async function writeArticles(articles: Article[]): Promise<void> {
    await writeAtomic(file(workspaceFiles.articles), JSON.stringify(articles, null, 2));
  }

  async function readCampaigns(): Promise<Campaign[]> {
    return (await readJson(file(workspaceFiles.campaigns), campaignsSchema)) ?? [];
  }

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

    readCampaigns,
    appendCampaign: (campaign: Campaign): Promise<Campaign[]> =>
      enqueue(async () => {
        const merged = [...(await readCampaigns()), campaign];
        await writeAtomic(file(workspaceFiles.campaigns), JSON.stringify(merged, null, 2));
        return merged;
      }),
    deleteCampaign: (id: string): Promise<Campaign[]> =>
      enqueue(async () => {
        const next = (await readCampaigns()).filter((campaign) => campaign.id !== id);
        await writeAtomic(file(workspaceFiles.campaigns), JSON.stringify(next, null, 2));
        return next;
      }),
    readCampaignDoc: async (campaignId: string): Promise<string | null> => {
      try {
        return await readFile(campaignDocPath(campaignId), 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    },
    writeCampaignDoc: (campaignId: string, markdown: string): Promise<void> =>
      enqueue(() => writeAtomic(campaignDocPath(campaignId), markdown)),
    updateCampaign: (id: string, patch: Partial<Campaign>): Promise<Campaign[]> =>
      enqueue(async () => {
        const next = (await readCampaigns()).map((campaign) =>
          campaign.id === id ? { ...campaign, ...patch } : campaign,
        );
        await writeAtomic(file(workspaceFiles.campaigns), JSON.stringify(next, null, 2));
        return next;
      }),

    readArticles,
    appendArticles: (incoming: Article[]): Promise<Article[]> =>
      enqueue(async () => {
        const merged = [...(await readArticles()), ...incoming];
        await writeArticles(merged);
        return merged;
      }),
    updateArticle: (id: string, patch: Partial<Article>): Promise<Article[]> =>
      enqueue(async () => {
        const next = (await readArticles()).map((article) =>
          article.id === id ? { ...article, ...patch } : article,
        );
        await writeArticles(next);
        return next;
      }),
    readArticleDraft: async (articleId: string): Promise<string | null> => {
      try {
        return await readFile(articleDraftPath(articleId), 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    },
    writeArticleDraft: (articleId: string, markdown: string): Promise<void> =>
      enqueue(() => writeAtomic(articleDraftPath(articleId), markdown)),

    /**
     * Permanently deletes everything the app has written, returning the
     * workspace to its first-run state. Only names from workspaceFiles are
     * removed, so anything else a user keeps in the folder is left alone. It
     * runs through the queue so it cannot interleave with a pending write.
     */
    resetWorkspace: (): Promise<void> =>
      enqueue(async () => {
        const owned = Object.values(workspaceFiles).map((name) => path.join(root, name));
        await Promise.all(owned.map((target) => rm(target, { recursive: true, force: true })));
      }),
  };
}

export type Store = ReturnType<typeof createStore>;
