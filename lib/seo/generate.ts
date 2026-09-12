import { randomUUID } from 'node:crypto';
import { runWithRepair, type Provider } from '@/lib/providers';
import { composeArticleBatchPrompt, composeArticleDraftPrompt } from '@/lib/prompts/seo';
import { ARTICLE_PROMPT_VERSION, ARTICLE_DRAFT_PROMPT_VERSION } from '@/lib/prompts/version';
import {
  articleSchema,
  generatedArticleSchema,
  type Article,
  type ArticleBatchResponse,
  type ArticleDraftResponse,
} from '@/lib/schema';
import type { Store } from '@/lib/workspace/store';

export type GenerateArticlesInput = {
  store: Store;
  provider: Provider;
  count: number;
};

export type GenerateArticlesResult = {
  articles: Article[];
  discarded: number;
};

/** One batch of article topics. Items are validated individually. */
export async function generateArticles(
  input: GenerateArticlesInput,
): Promise<GenerateArticlesResult> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Önce marka profili oluşturulmalı.');

  const existing = await input.store.readArticles();

  const prompt = composeArticleBatchPrompt({
    brand,
    count: input.count,
    existingTitles: existing.map((article) => article.title),
  });

  const result = await runWithRepair<ArticleBatchResponse>(input.provider, {
    prompt,
    schemaName: 'articleBatchResponse',
    maxOutputTokens: 12_000,
  });
  if (!result.ok) throw new Error(result.error.message);

  const batchId = randomUUID();
  const createdAt = new Date().toISOString();

  let discarded = 0;
  const articles: Article[] = [];

  for (const candidate of result.data.articles) {
    const generated = generatedArticleSchema.safeParse(candidate);
    if (!generated.success) {
      discarded += 1;
      continue;
    }

    const article = articleSchema.safeParse({
      ...generated.data,
      id: randomUUID(),
      createdAt,
      batchId,
      status: 'new',
      promptVersion: ARTICLE_PROMPT_VERSION,
    });
    if (!article.success) {
      discarded += 1;
      continue;
    }

    articles.push(article.data);
  }

  if (articles.length) await input.store.appendArticles(articles);
  return { articles, discarded };
}

/** Turns one kept topic into a publishable draft with its meta tags. */
export async function draftArticle(input: {
  store: Store;
  provider: Provider;
  articleId: string;
}): Promise<string> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Önce marka profili oluşturulmalı.');

  const articles = await input.store.readArticles();
  const article = articles.find((candidate) => candidate.id === input.articleId);
  if (!article) throw new Error('Konu bulunamadı.');

  const result = await runWithRepair<ArticleDraftResponse>(input.provider, {
    prompt: composeArticleDraftPrompt({ brand, article }),
    schemaName: 'articleDraftResponse',
    maxOutputTokens: 12_000,
  });
  if (!result.ok) throw new Error(result.error.message);

  const frontMatter = [
    '---',
    `articleId: ${article.id}`,
    `title: ${article.title}`,
    `primaryKeyword: ${article.primaryKeyword}`,
    `metaTitle: ${result.data.metaTitle}`,
    `metaDescription: ${result.data.metaDescription}`,
    `generatedAt: ${new Date().toISOString()}`,
    `promptVersion: ${ARTICLE_DRAFT_PROMPT_VERSION}`,
    '---',
    '',
  ].join('\n');

  const markdown = frontMatter + result.data.markdown;
  await input.store.writeArticleDraft(article.id, markdown);
  await input.store.updateArticle(article.id, { status: 'drafted' });
  return markdown;
}
