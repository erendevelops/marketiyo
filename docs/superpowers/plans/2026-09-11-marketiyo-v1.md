# Marketiyo v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first Next.js application that generates social media ideas, expands them into platform-specific assets, and schedules them on a calendar, driven by either the Claude Code CLI or the Gemini API.

**Architecture:** A single Next.js App Router application. The browser never talks to a model provider; local route handlers do. Providers sit behind one `generate` interface with two real adapters and one stub used by tests. All prompts are Markdown files in the repository, composed in a fixed order and shared by both providers. All user data is plain files in a workspace directory, written atomically through a serialised queue. Every model response is validated against a Zod schema before it touches state.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript in strict mode, Zod, Tailwind CSS v4, Vitest with Testing Library, Node built-in `fs/promises` and `child_process`.

**Spec:** `docs/superpowers/specs/2026-09-11-marketiyo-design.md`

## Global Constraints

- Node 20 or newer. `package.json` declares `"engines": { "node": ">=20" }`.
- TypeScript strict mode on. No `any` in committed code; use `unknown` plus a schema parse.
- No model provider call may originate in a client component. All provider calls live in route handlers under `app/api/`.
- No API key may ever be sent to the browser. `settings.local.json` is read server-side only, and `GET /api/settings` returns a redacted view.
- The test suite makes zero live network calls and spawns zero real CLI processes. The stub provider covers both.
- Primary output language is Turkish, identifier `tr`. English, `en`, is secondary. Interface defaults to Turkish.
- Every prompt template and platform rule card must exist in `tr`. A missing `tr` file is a hard failure. A missing `en` file falls back to `tr` with a console warning.
- Rubric scores are a sort order only. No interface surface may render a raw numeric score.
- Avoidance context caps: most recent 150 hooks, most recent 40 rejections, newest first.
- Repair retries on malformed model output: exactly one, then surface the error.
- Licence is source-available with a contributor exception. The README must not call the project open source.
- Commit messages end with the `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` trailer.

---

### Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `postcss.config.mjs`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Test: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm test`, `npm run dev`, and `npm run build`. Path alias `@/*` resolves to the repository root.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "marketiyo",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `vitest.config.ts` and `vitest.setup.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Create `next.config.ts` and `postcss.config.mjs`**

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { typedRoutes: true },
};

export default nextConfig;
```

```js
// postcss.config.mjs
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

- [ ] **Step 5: Write the failing smoke test**

```ts
// lib/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest';
import { appName } from '@/lib/meta';

describe('app metadata', () => {
  it('exposes the project name', () => {
    expect(appName).toBe('Marketiyo');
  });
});
```

- [ ] **Step 6: Run the test and confirm it fails**

Run: `npm test`
Expected: FAIL, cannot resolve `@/lib/meta`.

- [ ] **Step 7: Create `lib/meta.ts`**

```ts
export const appName = 'Marketiyo';
export const defaultLocale = 'tr' as const;
```

- [ ] **Step 8: Create the root layout, home page, and stylesheet**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketiyo',
  description: 'Sosyal medya icerik motoru',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import { appName } from '@/lib/meta';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">{appName}</h1>
    </main>
  );
}
```

```css
/* app/globals.css */
@import "tailwindcss";
```

- [ ] **Step 9: Install and verify everything runs**

Run: `npm install`
Run: `npm test`
Expected: PASS.
Run: `npm run typecheck`
Expected: no errors.
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold next.js app with vitest and tailwind"
```

---

### Task 2: Workspace schemas

**Files:**
- Create: `lib/schema/brand.ts`, `lib/schema/idea.ts`, `lib/schema/calendar.ts`, `lib/schema/settings.ts`, `lib/schema/index.ts`
- Test: `lib/schema/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: Zod.
- Produces: `BrandProfile`, `Idea`, `CalendarSlot`, `Settings` types and their schemas. `Platform`, `Angle`, `IdeaStatus` union types. `ideaBatchResponseSchema` for validating model output. A registry `schemaByName(name: string)` used by the provider layer.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/schema/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest';
import { brandProfileSchema, ideaSchema, ideaBatchResponseSchema, schemaByName } from '@/lib/schema';

const validBrand = {
  productName: 'Marketiyo',
  oneLiner: 'Urunun icin sosyal medya icerigi uretir.',
  category: 'developer tool',
  audiences: [{ label: 'Indie hacker', pain: 'Pazarlama zamani yok', desire: 'Duzenli icerik', whereTheyHangOut: 'X' }],
  offers: [{ label: 'Repo', cta: 'Yildiz birak', url: 'https://example.com' }],
  voice: { do: ['Net ol'], dont: ['Abartma'], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: ['En iyi'],
  outputLanguage: 'tr',
  platforms: ['short-video'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

describe('brandProfileSchema', () => {
  it('accepts a complete profile', () => {
    expect(brandProfileSchema.parse(validBrand).productName).toBe('Marketiyo');
  });

  it('rejects an unknown output language', () => {
    expect(() => brandProfileSchema.parse({ ...validBrand, outputLanguage: 'de' })).toThrow();
  });

  it('requires at least one audience', () => {
    expect(() => brandProfileSchema.parse({ ...validBrand, audiences: [] })).toThrow();
  });
});

describe('ideaSchema', () => {
  it('defaults status to new', () => {
    const idea = ideaSchema.parse({
      id: 'i1',
      createdAt: '2026-09-11T00:00:00.000Z',
      batchId: 'b1',
      platform: 'short-video',
      format: 'talking-head',
      angle: 'education',
      hook: 'Bunu bilmiyordun',
      premise: 'Bir ozelligi gosterir.',
      whyItWorks: 'Merak uyandirir.',
      audienceRef: 'Indie hacker',
      score: 4,
      tags: [],
      promptVersion: 'idea-batch@1',
    });
    expect(idea.status).toBe('new');
  });
});

describe('ideaBatchResponseSchema', () => {
  it('keeps valid items and is strict about the envelope', () => {
    const parsed = ideaBatchResponseSchema.parse({
      ideas: [
        {
          platform: 'x',
          format: 'thread',
          angle: 'proof',
          hook: 'Su rakam ilginc',
          premise: 'Sonuclari paylas.',
          whyItWorks: 'Somut veri.',
          audienceRef: 'Indie hacker',
          score: 5,
          tags: ['veri'],
        },
      ],
    });
    expect(parsed.ideas).toHaveLength(1);
  });

  it('rejects a response with no ideas array', () => {
    expect(() => ideaBatchResponseSchema.parse({})).toThrow();
  });
});

describe('schemaByName', () => {
  it('resolves a registered schema', () => {
    expect(schemaByName('ideaBatchResponse')).toBe(ideaBatchResponseSchema);
  });

  it('throws for an unknown schema name', () => {
    expect(() => schemaByName('nope')).toThrow(/unknown schema/i);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- lib/schema`
Expected: FAIL, module `@/lib/schema` not found.

- [ ] **Step 3: Write `lib/schema/brand.ts`**

```ts
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
```

- [ ] **Step 4: Write `lib/schema/idea.ts`**

```ts
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

/** The shape the model returns. No identifiers, no status: the app assigns those. */
export const generatedIdeaSchema = z.object({
  platform: platformSchema,
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

export const ideaBatchResponseSchema = z.object({
  ideas: z.array(generatedIdeaSchema),
});
export type IdeaBatchResponse = z.infer<typeof ideaBatchResponseSchema>;

export const ideaSchema = generatedIdeaSchema.extend({
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
```

- [ ] **Step 5: Write `lib/schema/calendar.ts` and `lib/schema/settings.ts`**

```ts
// lib/schema/calendar.ts
import { z } from 'zod';
import { platformSchema } from './brand';

export const slotStatusSchema = z.enum(['planned', 'ready', 'posted', 'skipped']);

export const calendarSlotSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
  platform: platformSchema,
  ideaId: z.string().nullable(),
  status: slotStatusSchema.default('planned'),
  note: z.string().default(''),
});
export type CalendarSlot = z.infer<typeof calendarSlotSchema>;
```

```ts
// lib/schema/settings.ts
import { z } from 'zod';
import { languageSchema } from './brand';

export const providerIdSchema = z.enum(['claude-code', 'gemini', 'stub']);
export type ProviderId = z.infer<typeof providerIdSchema>;

export const settingsSchema = z.object({
  providerId: providerIdSchema.default('claude-code'),
  geminiApiKey: z.string().default(''),
  geminiModel: z.string().default('gemini-2.0-flash'),
  claudeBinary: z.string().default('claude'),
  interfaceLanguage: languageSchema.default('tr'),
  onboarded: z.boolean().default(false),
});
export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = settingsSchema.parse({});

/** Never send the key to the browser. */
export function redactSettings(settings: Settings) {
  const { geminiApiKey, ...rest } = settings;
  return { ...rest, hasGeminiKey: geminiApiKey.length > 0 };
}
```

- [ ] **Step 6: Write `lib/schema/index.ts` with the registry**

```ts
import type { ZodTypeAny } from 'zod';
import { ideaBatchResponseSchema } from './idea';
import { expansionResponseSchema } from './idea';
import { brandProfileSchema } from './brand';

export * from './brand';
export * from './idea';
export * from './calendar';
export * from './settings';

const registry: Record<string, ZodTypeAny> = {
  ideaBatchResponse: ideaBatchResponseSchema,
  expansionResponse: expansionResponseSchema,
  brandProfile: brandProfileSchema,
};

export function schemaByName(name: string): ZodTypeAny {
  const schema = registry[name];
  if (!schema) throw new Error(`Unknown schema: ${name}`);
  return schema;
}

export const schemaNames = Object.keys(registry);
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npm test -- lib/schema`
Expected: PASS, all cases green.

- [ ] **Step 8: Commit**

```bash
git add lib/schema
git commit -m "feat: add zod schemas for brand, ideas, calendar and settings"
```

---

### Task 3: Workspace file layer

**Files:**
- Create: `lib/workspace/paths.ts`, `lib/workspace/queue.ts`, `lib/workspace/store.ts`, `lib/workspace/errors.ts`
- Test: `lib/workspace/__tests__/store.test.ts`

**Interfaces:**
- Consumes: schemas from Task 2.
- Produces: `createStore(rootDir: string)` returning an object with `readBrand()`, `writeBrand(profile)`, `readIdeas()`, `writeIdeas(ideas)`, `appendIdeas(ideas)`, `readCalendar()`, `writeCalendar(slots)`, `readSettings()`, `writeSettings(settings)`, `readExpansion(ideaId)`, `writeExpansion(ideaId, markdown)`. Every read returns `null` when the file is absent. A corrupt file throws `WorkspaceCorruptError`. Also `defaultWorkspaceRoot()`.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/workspace/__tests__/store.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { WorkspaceCorruptError } from '@/lib/workspace/errors';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand = {
  productName: 'Marketiyo',
  oneLiner: 'Test',
  category: 'tool',
  audiences: [{ label: 'A', pain: 'B', desire: 'C', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr' as const,
  platforms: ['x' as const],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

describe('workspace store', () => {
  it('returns null when the brand profile does not exist', async () => {
    const store = createStore(root);
    expect(await store.readBrand()).toBeNull();
  });

  it('round-trips the brand profile', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    expect((await store.readBrand())?.productName).toBe('Marketiyo');
  });

  it('returns an empty array for a missing ideas file', async () => {
    const store = createStore(root);
    expect(await store.readIdeas()).toEqual([]);
  });

  it('appends ideas without dropping existing ones', async () => {
    const store = createStore(root);
    const base = {
      createdAt: '2026-09-11T00:00:00.000Z',
      batchId: 'b1',
      platform: 'x' as const,
      format: 'thread',
      angle: 'education' as const,
      hook: 'h',
      premise: 'p',
      whyItWorks: 'w',
      audienceRef: 'A',
      score: 3,
      tags: [],
      status: 'new' as const,
      promptVersion: 'idea-batch@1',
    };
    await store.appendIdeas([{ ...base, id: 'i1' }]);
    await store.appendIdeas([{ ...base, id: 'i2' }]);
    const ideas = await store.readIdeas();
    expect(ideas.map((i) => i.id)).toEqual(['i1', 'i2']);
  });

  it('throws WorkspaceCorruptError on unparseable json', async () => {
    await writeFile(path.join(root, 'brand.json'), '{ not json', 'utf8');
    const store = createStore(root);
    await expect(store.readBrand()).rejects.toBeInstanceOf(WorkspaceCorruptError);
  });

  it('throws WorkspaceCorruptError when json is valid but the shape is wrong', async () => {
    await writeFile(path.join(root, 'brand.json'), JSON.stringify({ productName: 1 }), 'utf8');
    const store = createStore(root);
    await expect(store.readBrand()).rejects.toBeInstanceOf(WorkspaceCorruptError);
  });

  it('serialises concurrent writes so no update is lost', async () => {
    const store = createStore(root);
    const base = {
      createdAt: '2026-09-11T00:00:00.000Z',
      batchId: 'b1',
      platform: 'x' as const,
      format: 'thread',
      angle: 'education' as const,
      hook: 'h',
      premise: 'p',
      whyItWorks: 'w',
      audienceRef: 'A',
      score: 3,
      tags: [],
      status: 'new' as const,
      promptVersion: 'idea-batch@1',
    };
    await Promise.all(
      Array.from({ length: 10 }, (_, n) => store.appendIdeas([{ ...base, id: `i${n}` }])),
    );
    expect(await store.readIdeas()).toHaveLength(10);
  });

  it('round-trips an expansion markdown file', async () => {
    const store = createStore(root);
    await store.writeExpansion('i1', '# Hook\n');
    expect(await store.readExpansion('i1')).toContain('# Hook');
    expect(await store.readExpansion('missing')).toBeNull();
  });

  it('leaves no temporary files behind after a write', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(root);
    expect(entries.some((e) => e.endsWith('.tmp'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- lib/workspace`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/workspace/errors.ts`**

```ts
export class WorkspaceCorruptError extends Error {
  constructor(
    readonly filePath: string,
    readonly detail: string,
  ) {
    super(`Workspace file is unreadable: ${filePath}. ${detail}`);
    this.name = 'WorkspaceCorruptError';
  }
}
```

- [ ] **Step 4: Write `lib/workspace/paths.ts`**

```ts
import path from 'node:path';

export function defaultWorkspaceRoot(): string {
  return process.env.MARKETIYO_WORKSPACE ?? path.join(process.cwd(), 'workspace');
}

export const workspaceFiles = {
  brand: 'brand.json',
  ideas: 'ideas.json',
  calendar: 'calendar.json',
  settings: 'settings.local.json',
  expansions: 'expansions',
} as const;
```

- [ ] **Step 5: Write `lib/workspace/queue.ts`**

```ts
/** Serialises async work so two writers never interleave a read-modify-write. */
export function createQueue() {
  let tail: Promise<unknown> = Promise.resolve();

  return function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = tail.then(job, job);
    tail = run.catch(() => undefined);
    return run;
  };
}
```

- [ ] **Step 6: Write `lib/workspace/store.ts`**

```ts
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  brandProfileSchema,
  calendarSlotSchema,
  ideaSchema,
  settingsSchema,
  defaultSettings,
  type BrandProfile,
  type CalendarSlot,
  type Idea,
  type Settings,
} from '@/lib/schema';
import { WorkspaceCorruptError } from './errors';
import { workspaceFiles } from './paths';
import { createQueue } from './queue';

async function readJson<T>(filePath: string, schema: z.ZodType<T>): Promise<T | null> {
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
    throw new WorkspaceCorruptError(filePath, result.error.issues.map((i) => i.message).join('; '));
  }
  return result.data;
}

async function writeAtomic(filePath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, contents, 'utf8');
  await rename(temp, filePath);
}

export function createStore(root: string) {
  const enqueue = createQueue();
  const file = (name: string) => path.join(root, name);
  const expansionPath = (ideaId: string) =>
    path.join(root, workspaceFiles.expansions, `${ideaId}.md`);

  const ideasSchema = z.array(ideaSchema);
  const calendarSchema = z.array(calendarSlotSchema);

  async function readIdeas(): Promise<Idea[]> {
    return (await readJson(file(workspaceFiles.ideas), ideasSchema)) ?? [];
  }

  return {
    root,

    readBrand: () => readJson(file(workspaceFiles.brand), brandProfileSchema),
    writeBrand: (profile: BrandProfile) =>
      enqueue(() => writeAtomic(file(workspaceFiles.brand), JSON.stringify(profile, null, 2))),

    readIdeas,
    writeIdeas: (ideas: Idea[]) =>
      enqueue(() => writeAtomic(file(workspaceFiles.ideas), JSON.stringify(ideas, null, 2))),
    appendIdeas: (incoming: Idea[]) =>
      enqueue(async () => {
        const existing = await readIdeas();
        const merged = [...existing, ...incoming];
        await writeAtomic(file(workspaceFiles.ideas), JSON.stringify(merged, null, 2));
        return merged;
      }),
    updateIdea: (id: string, patch: Partial<Idea>) =>
      enqueue(async () => {
        const existing = await readIdeas();
        const next = existing.map((idea) => (idea.id === id ? { ...idea, ...patch } : idea));
        await writeAtomic(file(workspaceFiles.ideas), JSON.stringify(next, null, 2));
        return next;
      }),

    readCalendar: async (): Promise<CalendarSlot[]> =>
      (await readJson(file(workspaceFiles.calendar), calendarSchema)) ?? [],
    writeCalendar: (slots: CalendarSlot[]) =>
      enqueue(() => writeAtomic(file(workspaceFiles.calendar), JSON.stringify(slots, null, 2))),

    readSettings: async (): Promise<Settings> =>
      (await readJson(file(workspaceFiles.settings), settingsSchema)) ?? defaultSettings,
    writeSettings: (settings: Settings) =>
      enqueue(() => writeAtomic(file(workspaceFiles.settings), JSON.stringify(settings, null, 2))),

    readExpansion: async (ideaId: string): Promise<string | null> => {
      try {
        return await readFile(expansionPath(ideaId), 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    },
    writeExpansion: (ideaId: string, markdown: string) =>
      enqueue(() => writeAtomic(expansionPath(ideaId), markdown)),
  };
}

export type Store = ReturnType<typeof createStore>;
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npm test -- lib/workspace`
Expected: PASS, including the concurrency and temporary-file cases.

- [ ] **Step 8: Commit**

```bash
git add lib/workspace
git commit -m "feat: add atomic, serialised workspace file store"
```

---

### Task 4: Provider interface, stub, and adapters

**Files:**
- Create: `lib/providers/types.ts`, `lib/providers/json.ts`, `lib/providers/stub.ts`, `lib/providers/claude-code.ts`, `lib/providers/gemini.ts`, `lib/providers/index.ts`
- Test: `lib/providers/__tests__/json.test.ts`, `lib/providers/__tests__/stub.test.ts`, `lib/providers/__tests__/gemini.test.ts`

**Interfaces:**
- Consumes: `schemaByName` from Task 2.
- Produces: `Provider` interface with `id`, `isAvailable()`, `generate(req)`. `extractJson(raw: string)` which strips code fences and locates the outermost JSON object. `runWithRepair(provider, req)` which performs exactly one repair retry. `getProvider(settings)` returning the configured adapter.

- [ ] **Step 1: Write the failing tests for JSON extraction**

```ts
// lib/providers/__tests__/json.test.ts
import { describe, it, expect } from 'vitest';
import { extractJson } from '@/lib/providers/json';

describe('extractJson', () => {
  it('parses bare json', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips a fenced block', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('ignores prose around the object', () => {
    expect(extractJson('Iste sonuc:\n{"a":1}\nUmarim yardimci olur.')).toEqual({ a: 1 });
  });

  it('handles braces inside strings', () => {
    expect(extractJson('{"a":"}{"}')).toEqual({ a: '}{' });
  });

  it('returns null when there is no object', () => {
    expect(extractJson('hicbir sey yok')).toBeNull();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- lib/providers`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/providers/json.ts`**

```ts
/** Finds the outermost JSON object in a model response, tolerating fences and prose. */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;

  const start = candidate.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < candidate.length; i += 1) {
    const char = candidate[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}
```

- [ ] **Step 4: Write `lib/providers/types.ts`**

```ts
import type { ProviderId } from '@/lib/schema';

export type ProviderErrorCode =
  | 'not-available'
  | 'auth'
  | 'timeout'
  | 'transport'
  | 'malformed-output'
  | 'schema-mismatch';

export type ProviderError = {
  code: ProviderErrorCode;
  message: string;
};

export type AvailabilityReport = {
  available: boolean;
  detail: string;
};

export type GenerateRequest = {
  prompt: string;
  schemaName: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
};

export type GenerateResult<T> =
  | { ok: true; data: T; raw: string }
  | { ok: false; error: ProviderError; raw?: string };

export interface Provider {
  readonly id: ProviderId;
  isAvailable(): Promise<AvailabilityReport>;
  /** Returns the raw text of one completion. Validation happens in runWithRepair. */
  complete(req: GenerateRequest): Promise<{ ok: true; raw: string } | { ok: false; error: ProviderError }>;
}
```

- [ ] **Step 5: Write the failing test for the repair loop**

```ts
// lib/providers/__tests__/stub.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createStubProvider } from '@/lib/providers/stub';
import { runWithRepair } from '@/lib/providers';

const req = { prompt: 'ignored', schemaName: 'ideaBatchResponse' };

const validPayload = JSON.stringify({
  ideas: [
    {
      platform: 'x',
      format: 'thread',
      angle: 'education',
      hook: 'h',
      premise: 'p',
      whyItWorks: 'w',
      audienceRef: 'A',
      score: 4,
      tags: [],
    },
  ],
});

describe('runWithRepair', () => {
  it('returns data on a first valid response', async () => {
    const provider = createStubProvider([validPayload]);
    const result = await runWithRepair(provider, req);
    expect(result.ok).toBe(true);
  });

  it('retries exactly once when the first response is malformed', async () => {
    const provider = createStubProvider(['not json at all', validPayload]);
    const spy = vi.spyOn(provider, 'complete');
    const result = await runWithRepair(provider, req);
    expect(result.ok).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('gives up after one repair attempt', async () => {
    const provider = createStubProvider(['bad', 'still bad']);
    const spy = vi.spyOn(provider, 'complete');
    const result = await runWithRepair(provider, req);
    expect(result.ok).toBe(false);
    expect(spy).toHaveBeenCalledTimes(2);
    if (!result.ok) expect(result.error.code).toBe('malformed-output');
  });

  it('includes the validation errors in the repair prompt', async () => {
    const provider = createStubProvider([JSON.stringify({ ideas: 'wrong' }), validPayload]);
    const spy = vi.spyOn(provider, 'complete');
    await runWithRepair(provider, req);
    const repairPrompt = spy.mock.calls[1][0].prompt;
    expect(repairPrompt).toContain('ideas');
  });
});
```

- [ ] **Step 6: Write `lib/providers/stub.ts`**

```ts
import type { GenerateRequest, Provider } from './types';

/** Test double. Returns queued responses in order, repeating the last one. */
export function createStubProvider(responses: string[]): Provider {
  let index = 0;
  return {
    id: 'stub',
    async isAvailable() {
      return { available: true, detail: 'stub provider' };
    },
    async complete(_req: GenerateRequest) {
      const raw = responses[Math.min(index, responses.length - 1)] ?? '';
      index += 1;
      return { ok: true as const, raw };
    },
  };
}
```

- [ ] **Step 7: Write `lib/providers/index.ts` with `runWithRepair`**

```ts
import { schemaByName } from '@/lib/schema';
import type { Settings } from '@/lib/schema';
import { extractJson } from './json';
import type { GenerateRequest, GenerateResult, Provider } from './types';
import { createClaudeCodeProvider } from './claude-code';
import { createGeminiProvider } from './gemini';

export * from './types';
export { extractJson } from './json';
export { createStubProvider } from './stub';

function repairPrompt(original: string, raw: string, issues: string): string {
  return [
    original,
    '',
    '---',
    'Onceki yanitin gecersizdi. Sadece gecerli JSON dondur, aciklama yazma.',
    `Dogrulama hatalari: ${issues}`,
    'Gecersiz yanit:',
    raw.slice(0, 2000),
  ].join('\n');
}

export async function runWithRepair<T>(
  provider: Provider,
  req: GenerateRequest,
): Promise<GenerateResult<T>> {
  const schema = schemaByName(req.schemaName);

  const attempt = async (prompt: string) => {
    const completion = await provider.complete({ ...req, prompt });
    if (!completion.ok) return { failed: true as const, error: completion.error };

    const json = extractJson(completion.raw);
    if (json === null) {
      return {
        failed: false as const,
        raw: completion.raw,
        parsed: null,
        issues: 'yanit icinde JSON nesnesi bulunamadi',
      };
    }

    const result = schema.safeParse(json);
    if (!result.success) {
      return {
        failed: false as const,
        raw: completion.raw,
        parsed: null,
        issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      };
    }
    return { failed: false as const, raw: completion.raw, parsed: result.data as T, issues: '' };
  };

  const first = await attempt(req.prompt);
  if (first.failed) return { ok: false, error: first.error };
  if (first.parsed !== null) return { ok: true, data: first.parsed, raw: first.raw };

  const second = await attempt(repairPrompt(req.prompt, first.raw, first.issues));
  if (second.failed) return { ok: false, error: second.error };
  if (second.parsed !== null) return { ok: true, data: second.parsed, raw: second.raw };

  return {
    ok: false,
    error: { code: 'malformed-output', message: second.issues },
    raw: second.raw,
  };
}

export function getProvider(settings: Settings): Provider {
  if (settings.providerId === 'gemini') {
    return createGeminiProvider({ apiKey: settings.geminiApiKey, model: settings.geminiModel });
  }
  return createClaudeCodeProvider({ binary: settings.claudeBinary });
}
```

- [ ] **Step 8: Write `lib/providers/claude-code.ts`**

```ts
import { spawn } from 'node:child_process';
import type { GenerateRequest, Provider, ProviderError } from './types';

type Options = { binary: string };

function run(
  binary: string,
  args: string[],
  input: string,
  timeoutMs: number,
): Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(binary, args, { stdio: ['pipe', 'pipe', 'pipe'], shell: process.platform === 'win32' });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on('data', (chunk) => (stdout += String(chunk)));
    child.stderr.on('data', (chunk) => (stderr += String(chunk)));
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: null, stdout, stderr: stderr + String(error), timedOut });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}

/**
 * Drives the locally installed Claude Code binary in headless print mode.
 * Uses the user's existing subscription login, so no API key is involved.
 */
export function createClaudeCodeProvider({ binary }: Options): Provider {
  return {
    id: 'claude-code',

    async isAvailable() {
      const result = await run(binary, ['--version'], '', 10_000);
      if (result.code === 0) {
        return { available: true, detail: result.stdout.trim() };
      }
      return {
        available: false,
        detail: `Claude Code bulunamadi. PATH uzerinde "${binary}" calistirilamadi.`,
      };
    },

    async complete(req: GenerateRequest) {
      const result = await run(
        binary,
        ['-p', '--output-format', 'text'],
        req.prompt,
        req.timeoutMs ?? 180_000,
      );

      if (result.timedOut) {
        const error: ProviderError = { code: 'timeout', message: 'Claude Code zaman asimina ugradi.' };
        return { ok: false, error };
      }
      if (result.code !== 0) {
        const message = result.stderr.trim() || 'Claude Code sifir disi cikis kodu dondurdu.';
        const code = /login|auth|unauthori/i.test(message) ? 'auth' : 'transport';
        return { ok: false, error: { code, message } as ProviderError };
      }
      return { ok: true, raw: result.stdout };
    },
  };
}
```

- [ ] **Step 9: Write the failing Gemini test**

```ts
// lib/providers/__tests__/gemini.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createGeminiProvider } from '@/lib/providers/gemini';

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('gemini provider', () => {
  it('reports unavailable without a key', async () => {
    const provider = createGeminiProvider({ apiKey: '', model: 'gemini-2.0-flash' });
    expect((await provider.isAvailable()).available).toBe(false);
  });

  it('returns the first candidate text', async () => {
    stubFetch({ candidates: [{ content: { parts: [{ text: '{"ideas":[]}' }] } }] });
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-2.0-flash' });
    const result = await provider.complete({ prompt: 'hi', schemaName: 'ideaBatchResponse' });
    expect(result.ok && result.raw).toBe('{"ideas":[]}');
  });

  it('maps a 401 to an auth error', async () => {
    stubFetch({ error: { message: 'bad key' } }, 401);
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-2.0-flash' });
    const result = await provider.complete({ prompt: 'hi', schemaName: 'ideaBatchResponse' });
    expect(!result.ok && result.error.code).toBe('auth');
  });

  it('sends the key in a header, never in the url', async () => {
    const fetchMock = stubFetch({ candidates: [{ content: { parts: [{ text: '{}' }] } }] });
    const provider = createGeminiProvider({ apiKey: 'secret', model: 'gemini-2.0-flash' });
    await provider.complete({ prompt: 'hi', schemaName: 'ideaBatchResponse' });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain('secret');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('secret');
  });
});
```

- [ ] **Step 10: Write `lib/providers/gemini.ts`**

```ts
import type { GenerateRequest, Provider, ProviderError } from './types';

type Options = { apiKey: string; model: string };

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function createGeminiProvider({ apiKey, model }: Options): Provider {
  async function call(prompt: string, maxOutputTokens: number, timeoutMs: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    id: 'gemini',

    async isAvailable() {
      if (!apiKey) return { available: false, detail: 'Gemini API anahtari girilmedi.' };
      try {
        const response = await call('ping', 16, 15_000);
        if (response.ok) return { available: true, detail: `Model: ${model}` };
        if (response.status === 401 || response.status === 403) {
          return { available: false, detail: 'API anahtari reddedildi.' };
        }
        return { available: false, detail: `Gemini ${response.status} dondurdu.` };
      } catch (error) {
        return { available: false, detail: (error as Error).message };
      }
    },

    async complete(req: GenerateRequest) {
      try {
        const response = await call(
          req.prompt,
          req.maxOutputTokens ?? 8192,
          req.timeoutMs ?? 180_000,
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
          const code: ProviderError['code'] =
            response.status === 401 || response.status === 403 ? 'auth' : 'transport';
          return {
            ok: false,
            error: { code, message: body.error?.message ?? `Gemini ${response.status}` },
          };
        }

        const body = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const raw = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
        return { ok: true, raw };
      } catch (error) {
        const isAbort = (error as Error).name === 'AbortError';
        return {
          ok: false,
          error: {
            code: isAbort ? 'timeout' : 'transport',
            message: (error as Error).message,
          },
        };
      }
    },
  };
}
```

- [ ] **Step 11: Run the provider tests**

Run: `npm test -- lib/providers`
Expected: PASS across all three files.

- [ ] **Step 12: Commit**

```bash
git add lib/providers
git commit -m "feat: add provider interface with claude code, gemini and stub adapters"
```

---

### Task 5: Prompt library and composition

**Files:**
- Create: `lib/prompts/templates/tr/idea-batch.md`, `lib/prompts/templates/en/idea-batch.md`
- Create: `lib/prompts/templates/tr/brand-draft.md`, `lib/prompts/templates/en/brand-draft.md`
- Create: `lib/prompts/templates/tr/expansion-short-video.md` and the same file for `x`, `linkedin`, `instagram-static`, in both `tr` and `en`
- Create: `lib/prompts/platforms/tr/short-video.md` plus `x`, `linkedin`, `instagram-static`, and the `en` mirror
- Create: `lib/prompts/load.ts`, `lib/prompts/compose.ts`, `lib/prompts/version.ts`
- Test: `lib/prompts/__tests__/compose.test.ts`

**Interfaces:**
- Consumes: `BrandProfile`, `Idea`, `Platform`, `Language` from Task 2.
- Produces: `loadTemplate(name, language)`, `loadPlatformCard(platform, language)`, both throwing when the `tr` file is absent and warning on an `en` fallback. `composeIdeaBatchPrompt({ brand, platform, count, angles, recentHooks, recentRejections })` returning a string. `composeExpansionPrompt({ brand, idea })`. `PROMPT_VERSION`.

- [ ] **Step 1: Write the failing composition tests**

```ts
// lib/prompts/__tests__/compose.test.ts
import { describe, it, expect } from 'vitest';
import { composeIdeaBatchPrompt } from '@/lib/prompts/compose';
import type { BrandProfile, Idea } from '@/lib/schema';

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Sosyal medya icerik motoru',
  category: 'developer tool',
  audiences: [{ label: 'Indie hacker', pain: 'Zaman yok', desire: 'Duzenli icerik', whereTheyHangOut: 'X' }],
  offers: [{ label: 'Repo', cta: 'Dene', url: 'https://example.com' }],
  voice: { do: ['Net ol'], dont: ['Abartma'], referenceExamples: [] },
  proof: ['200 kullanici'],
  competitors: [],
  bannedClaims: ['Piyasanin en iyisi'],
  outputLanguage: 'tr',
  platforms: ['short-video'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

function idea(n: number, status: Idea['status'] = 'rejected'): Idea {
  return {
    id: `i${n}`,
    createdAt: '2026-09-11T00:00:00.000Z',
    batchId: 'b1',
    platform: 'short-video',
    format: 'talking-head',
    angle: 'education',
    hook: `hook-${n}`,
    premise: 'p',
    whyItWorks: 'w',
    audienceRef: 'Indie hacker',
    score: 3,
    tags: [],
    status,
    promptVersion: 'idea-batch@1',
  };
}

describe('composeIdeaBatchPrompt', () => {
  const base = { brand, platform: 'short-video' as const, count: 10, angles: [], recentHooks: [], recentRejections: [] };

  it('includes the brand profile and the banned claims', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt).toContain('Marketiyo');
    expect(prompt).toContain('Piyasanin en iyisi');
  });

  it('includes the platform rule card for the requested platform only', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt.toLowerCase()).toContain('kisa video');
    expect(prompt.toLowerCase()).not.toContain('linkedin');
  });

  it('caps avoidance hooks at 150, newest first', () => {
    const hooks = Array.from({ length: 200 }, (_, n) => `hook-${n}`);
    const prompt = composeIdeaBatchPrompt({ ...base, recentHooks: hooks });
    expect(prompt).toContain('hook-199');
    expect(prompt).not.toContain('hook-10\n');
  });

  it('caps rejections at 40', () => {
    const rejections = Array.from({ length: 60 }, (_, n) => idea(n));
    const prompt = composeIdeaBatchPrompt({ ...base, recentRejections: rejections });
    const occurrences = prompt.split('hook-').length - 1;
    expect(occurrences).toBeLessThanOrEqual(40);
  });

  it('uses the output language of the brand, not the interface', () => {
    const prompt = composeIdeaBatchPrompt({ ...base, brand: { ...brand, outputLanguage: 'en' } });
    expect(prompt.toLowerCase()).toContain('short video');
  });

  it('asks for the requested number of ideas', () => {
    expect(composeIdeaBatchPrompt({ ...base, count: 25 })).toContain('25');
  });

  it('places sections in the fixed order', () => {
    const prompt = composeIdeaBatchPrompt(base);
    expect(prompt.indexOf('MARKA')).toBeLessThan(prompt.indexOf('PLATFORM'));
    expect(prompt.indexOf('PLATFORM')).toBeLessThan(prompt.indexOf('CIKTI'));
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- lib/prompts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the Turkish platform card for short video**

Create `lib/prompts/platforms/tr/short-video.md`:

```markdown
# Kisa video (TikTok, Reels, Shorts)

## Formatlar
- `talking-head`: kameraya konusma, 20-45 saniye
- `screen-demo`: ekran kaydi uzerine anlatim, 25-60 saniye
- `before-after`: problem ve cozum karsilastirmasi, 15-30 saniye
- `listicle`: hizli maddeler, 30-50 saniye

## Kancalar
- Ilk 2 saniye izleyiciyi durdurmali.
- Kanca somut olmali. Soyut vaat yok.
- Soru sorarak baslamak yerine iddia ile baslamak daha iyi calisir.

## Yapi
1. Kanca
2. Baglam, tek cumle
3. Gosterim veya kanit
4. Sonuc ve tek bir cagri

## Kacinilacaklar
- Uzun giris ve kendini tanitma
- Jenerik motivasyon cumleleri
- Ayni anda birden fazla cagri
```

- [ ] **Step 4: Write the remaining Turkish platform cards**

Create `lib/prompts/platforms/tr/x.md`:

```markdown
# X

## Formatlar
- `single`: tek gonderi, 280 karakter siniri
- `thread`: 4-9 gonderiden olusan dizi
- `quote-take`: bir goruse kisa ve net karsi cikis

## Kancalar
- Ilk satir tek basina anlam tasimali.
- Rakam, sonuc veya net bir iddia ile basla.

## Yapi
- Tek gonderi: iddia, kanit, kisa sonuc.
- Dizi: her gonderi tek fikir tasir, son gonderi cagri icerir.

## Kacinilacaklar
- Hashtag yigini
- "Bir dizi paylasacagim" gibi bos acilislar
```

Create `lib/prompts/platforms/tr/linkedin.md`:

```markdown
# LinkedIn

## Formatlar
- `narrative`: kisa hikaye ve cikarim, 120-250 kelime
- `build-in-public`: surec ve sayilar
- `document`: 6-10 sayfalik tasarim notu iceren dokuman

## Kancalar
- Ilk iki satir kirpilmadan gorunur. Merak orada olusmali.
- Kisisel deneyim genel tavsiyeden daha iyi calisir.

## Yapi
1. Sahne, tek cumle
2. Gerilim veya problem
3. Ne yaptin
4. Cikarim
5. Tartismayi acan kisa soru

## Kacinilacaklar
- Asiri satir arasi bosluk ile yapay ritim
- Bos motivasyon dili
```

Create `lib/prompts/platforms/tr/instagram-static.md`:

```markdown
# Instagram statik

## Formatlar
- `carousel`: 5-8 slayt
- `single`: tek gorsel

## Kancalar
- Ilk slayt tek cumlelik net bir vaat tasir.
- Metin gorselde okunabilir olmali, en fazla 12 kelime.

## Yapi
- Slayt 1: kanca
- Slayt 2-6: her slaytta tek fikir
- Son slayt: ozet ve cagri

## Kacinilacaklar
- Slayta paragraf sigdirmak
- Gorsel yonu belirtmeden sadece metin uretmek
```

- [ ] **Step 5: Write the English platform cards**

Mirror each Turkish card into `lib/prompts/platforms/en/` with the same structure and headings translated. The short video card's heading must read `# Short video (TikTok, Reels, Shorts)`, since a test asserts on that phrase.

- [ ] **Step 6: Write the Turkish idea batch template**

Create `lib/prompts/templates/tr/idea-batch.md`:

```markdown
Sen bir sosyal medya icerik stratejistisin. Belirli bir urun icin, o urune ozgu icerik fikirleri uretiyorsun.

Kurallar:
- Fikirler urune ozgu olmali. Baska bir urune kopyalanabiliyorsa fikir zayiftir.
- Marka sesine uy. Yasakli iddialari asla kullanma.
- Her fikir tek bir hedef kitleye konusur.
- Kanca cumlesi tek basina ilgi cekmeli.
- Ayni kanca kalibini tekrar etme.

Puanlama, sadece siralama icindir. Su eksenleri dusunerek 0 ile 10 arasi bir puan ver: kanca gucu, urune ozgulik, kitle uyumu, partinin geri kalanina gore ozgunluk.
```

- [ ] **Step 7: Write the English idea batch template**

Create `lib/prompts/templates/en/idea-batch.md` as a faithful translation of the Turkish file.

- [ ] **Step 8: Write the expansion templates**

Create `lib/prompts/templates/tr/expansion-short-video.md`:

```markdown
Verilen fikri cekime hazir bir kisa video paketine donustur.

Ciktida su bolumler olmali:
- Kanca: tek cumle, ilk 2 saniye
- Senaryo: saniye araliklariyla sahne sahne
- Ekran metni: her sahne icin kisa satirlar
- Cekim notlari: kamera, ortam, gorsel
- Aciklama metni: platform aciklamasi ve tek cagri
- Ses onerisi: tur olarak, marka adi vermeden
```

Create `lib/prompts/templates/tr/expansion-x.md`:

```markdown
Verilen fikri yayina hazir bir X icerigine donustur.

Ciktida su bolumler olmali:
- Gonderi veya dizi, her gonderi ayri satirda ve numarali
- Alternatif kanca: iki secenek
- Cagri: tek satir
```

Create `lib/prompts/templates/tr/expansion-linkedin.md`:

```markdown
Verilen fikri yayina hazir bir LinkedIn gonderisine donustur.

Ciktida su bolumler olmali:
- Gonderi metni, tam haliyle
- Alternatif acilis: bir secenek
- Tartisma sorusu: tek satir
```

Create `lib/prompts/templates/tr/expansion-instagram-static.md`:

```markdown
Verilen fikri yayina hazir bir Instagram karuseline donustur.

Ciktida su bolumler olmali:
- Slaytlar: her slayt icin metin ve tasarim yonu
- Aciklama metni
- Tek cagri
```

Mirror all four into `lib/prompts/templates/en/`.

- [ ] **Step 9: Write the brand draft templates**

Create `lib/prompts/templates/tr/brand-draft.md`:

```markdown
Sana bir urun aciklamasi verilecek. Bundan bir marka profili taslagi cikar.

Bilmedigin alanlari uydurma. Emin olmadigin yerleri bos birak. Ozellikle kanit alanina sadece metinde acikca gecen seyleri yaz.
```

Mirror into `lib/prompts/templates/en/brand-draft.md`.

- [ ] **Step 10: Write `lib/prompts/version.ts` and `lib/prompts/load.ts`**

```ts
// lib/prompts/version.ts
export const PROMPT_VERSION = 'idea-batch@1';
export const EXPANSION_PROMPT_VERSION = 'expansion@1';
```

```ts
// lib/prompts/load.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Language, Platform } from '@/lib/schema';

const root = path.join(process.cwd(), 'lib', 'prompts');

function readOrNull(filePath: string): string | null {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/** Turkish is the source of truth. English falls back to Turkish with a warning. */
function readLocalised(kind: 'templates' | 'platforms', name: string, language: Language): string {
  const requested = readOrNull(path.join(root, kind, language, `${name}.md`));
  if (requested !== null) return requested;

  if (language === 'en') {
    const fallback = readOrNull(path.join(root, kind, 'tr', `${name}.md`));
    if (fallback !== null) {
      console.warn(`[marketiyo] Missing English ${kind}/${name}, falling back to Turkish.`);
      return fallback;
    }
  }

  throw new Error(`Missing prompt file: ${kind}/${language}/${name}.md`);
}

export function loadTemplate(name: string, language: Language): string {
  return readLocalised('templates', name, language);
}

export function loadPlatformCard(platform: Platform, language: Language): string {
  return readLocalised('platforms', platform, language);
}
```

- [ ] **Step 11: Write `lib/prompts/compose.ts`**

```ts
import type { Angle, BrandProfile, Idea, Platform } from '@/lib/schema';
import { loadPlatformCard, loadTemplate } from './load';

const MAX_HOOKS = 150;
const MAX_REJECTIONS = 40;

function renderBrand(brand: BrandProfile): string {
  const lines = [
    `Urun: ${brand.productName}`,
    `Tanim: ${brand.oneLiner}`,
    `Kategori: ${brand.category}`,
    '',
    'Hedef kitleler:',
    ...brand.audiences.map(
      (a) => `- ${a.label}. Aci: ${a.pain}. Istek: ${a.desire}. Bulundugu yer: ${a.whereTheyHangOut}`,
    ),
  ];

  if (brand.offers.length) {
    lines.push('', 'Teklifler:', ...brand.offers.map((o) => `- ${o.label}: ${o.cta} (${o.url})`));
  }
  if (brand.voice.do.length) lines.push('', 'Ses, yap:', ...brand.voice.do.map((v) => `- ${v}`));
  if (brand.voice.dont.length) lines.push('', 'Ses, yapma:', ...brand.voice.dont.map((v) => `- ${v}`));
  if (brand.proof.length) lines.push('', 'Kanit:', ...brand.proof.map((p) => `- ${p}`));
  if (brand.competitors.length) {
    lines.push(
      '',
      'Rakipler:',
      ...brand.competitors.map((c) => `- ${c.name}: ${c.positioning}. Farkimiz: ${c.whatWeDoDifferently}`),
    );
  }
  if (brand.bannedClaims.length) {
    lines.push('', 'ASLA kullanilmayacak iddialar:', ...brand.bannedClaims.map((b) => `- ${b}`));
  }

  return lines.join('\n');
}

const outputContract = `{
  "ideas": [
    {
      "platform": "<platform>",
      "format": "<platform kartindaki formatlardan biri>",
      "angle": "education | proof | contrarian | story | offer",
      "hook": "<tek cumle>",
      "premise": "<tek cumle>",
      "whyItWorks": "<tek cumle>",
      "audienceRef": "<hedef kitle etiketi>",
      "score": 0,
      "tags": ["<etiket>"]
    }
  ]
}`;

export type IdeaBatchInput = {
  brand: BrandProfile;
  platform: Platform;
  count: number;
  angles: Angle[];
  recentHooks: string[];
  recentRejections: Idea[];
};

export function composeIdeaBatchPrompt(input: IdeaBatchInput): string {
  const language = input.brand.outputLanguage;
  const sections = [
    loadTemplate('idea-batch', language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## PLATFORM',
    loadPlatformCard(input.platform, language),
  ];

  if (input.angles.length) {
    sections.push('', '## ACILAR', `Su acilari kullan: ${input.angles.join(', ')}`);
  }

  const hooks = input.recentHooks.slice(-MAX_HOOKS).reverse();
  if (hooks.length) {
    sections.push('', '## TEKRARLAMA', 'Bu kancalar zaten uretildi, tekrar etme:', ...hooks.map((h) => `- ${h}`));
  }

  const rejections = input.recentRejections.slice(-MAX_REJECTIONS).reverse();
  if (rejections.length) {
    sections.push(
      '',
      '## REDDEDILENLER',
      'Kullanici bunlari reddetti, benzerlerini uretme:',
      ...rejections.map((r) => `- ${r.hook}${r.rejectionReason ? ` (${r.rejectionReason})` : ''}`),
    );
  }

  sections.push(
    '',
    '## CIKTI',
    `Tam olarak ${input.count} fikir uret.`,
    'Sadece asagidaki sekilde gecerli JSON dondur. Aciklama, on soz veya kod bloğu yazma.',
    outputContract,
  );

  return sections.join('\n');
}

export function composeExpansionPrompt(input: { brand: BrandProfile; idea: Idea }): string {
  const language = input.brand.outputLanguage;
  return [
    loadTemplate(`expansion-${input.idea.platform}`, language),
    '',
    '## MARKA',
    renderBrand(input.brand),
    '',
    '## PLATFORM',
    loadPlatformCard(input.idea.platform, language),
    '',
    '## FIKIR',
    `Kanca: ${input.idea.hook}`,
    `Ozet: ${input.idea.premise}`,
    `Aci: ${input.idea.angle}`,
    `Format: ${input.idea.format}`,
    `Hedef kitle: ${input.idea.audienceRef}`,
    '',
    '## CIKTI',
    'Sadece gecerli JSON dondur:',
    '{ "markdown": "<markdown icerik>" }',
  ].join('\n');
}
```

- [ ] **Step 12: Run the tests and confirm they pass**

Run: `npm test -- lib/prompts`
Expected: PASS. If the English fallback warning fires during the language test, the English short video card is missing; create it.

- [ ] **Step 13: Commit**

```bash
git add lib/prompts
git commit -m "feat: add bilingual prompt library and deterministic composition"
```

---

### Task 6: Settings, provider status, and first-run setup

**Files:**
- Create: `lib/server/store.ts`, `app/api/settings/route.ts`, `app/api/provider/status/route.ts`
- Create: `lib/i18n/tr.ts`, `lib/i18n/en.ts`, `lib/i18n/index.ts`
- Create: `app/setup/page.tsx`, `components/SetupForm.tsx`
- Test: `lib/i18n/__tests__/i18n.test.ts`, `app/api/__tests__/settings-route.test.ts`

**Interfaces:**
- Consumes: `createStore` from Task 3, `getProvider` from Task 4, `redactSettings` from Task 2.
- Produces: `getStore()` returning a singleton store on the default workspace root. `GET /api/settings` returning redacted settings. `PUT /api/settings` accepting a partial settings patch. `GET /api/provider/status` returning an `AvailabilityReport`. `t(language)` returning the string dictionary.

- [ ] **Step 1: Write the failing i18n test**

```ts
// lib/i18n/__tests__/i18n.test.ts
import { describe, it, expect } from 'vitest';
import { t } from '@/lib/i18n';
import { tr } from '@/lib/i18n/tr';
import { en } from '@/lib/i18n/en';

describe('i18n', () => {
  it('defaults to Turkish', () => {
    expect(t('tr').appName).toBe('Marketiyo');
  });

  it('has identical key sets in both dictionaries', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(tr).sort());
  });

  it('has no empty strings', () => {
    for (const dict of [tr, en]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `empty value for ${key}`).not.toBe('');
      }
    }
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- lib/i18n`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the dictionaries**

```ts
// lib/i18n/tr.ts
export const tr = {
  appName: 'Marketiyo',
  setupTitle: 'Kurulum',
  setupEngine: 'Motor',
  setupClaudeCode: 'Claude Code, abonelik ile',
  setupGemini: 'Gemini, kendi anahtarin ile',
  setupCheck: 'Kontrol et',
  setupAvailable: 'Hazir',
  setupUnavailable: 'Kullanilamiyor',
  setupSave: 'Kaydet',
  brandTitle: 'Marka profili',
  ideasTitle: 'Fikir bankasi',
  ideasGenerate: 'Fikir uret',
  ideasKeep: 'Tut',
  ideasReject: 'Ele',
  ideasExpand: 'Genislet',
  ideasEmpty: 'Henuz fikir yok.',
  calendarTitle: 'Takvim',
  calendarSchedule: 'Takvime ekle',
  errorGeneric: 'Bir hata olustu.',
  discardedCount: 'gecersiz fikir atlandi',
} as const;

export type Dictionary = typeof tr;
```

```ts
// lib/i18n/en.ts
import type { Dictionary } from './tr';

export const en: Dictionary = {
  appName: 'Marketiyo',
  setupTitle: 'Setup',
  setupEngine: 'Engine',
  setupClaudeCode: 'Claude Code, with your subscription',
  setupGemini: 'Gemini, with your own key',
  setupCheck: 'Check',
  setupAvailable: 'Ready',
  setupUnavailable: 'Unavailable',
  setupSave: 'Save',
  brandTitle: 'Brand profile',
  ideasTitle: 'Idea bank',
  ideasGenerate: 'Generate ideas',
  ideasKeep: 'Keep',
  ideasReject: 'Reject',
  ideasExpand: 'Expand',
  ideasEmpty: 'No ideas yet.',
  calendarTitle: 'Calendar',
  calendarSchedule: 'Add to calendar',
  errorGeneric: 'Something went wrong.',
  discardedCount: 'invalid ideas skipped',
};
```

```ts
// lib/i18n/index.ts
import type { Language } from '@/lib/schema';
import { tr, type Dictionary } from './tr';
import { en } from './en';

export function t(language: Language): Dictionary {
  return language === 'en' ? en : tr;
}

export type { Dictionary };
```

- [ ] **Step 4: Write `lib/server/store.ts`**

```ts
import 'server-only';
import { createStore, type Store } from '@/lib/workspace/store';
import { defaultWorkspaceRoot } from '@/lib/workspace/paths';

let store: Store | null = null;

export function getStore(): Store {
  if (!store) store = createStore(defaultWorkspaceRoot());
  return store;
}
```

Add `server-only` to dependencies: `npm install server-only`.

- [ ] **Step 5: Write the failing settings route test**

```ts
// app/api/__tests__/settings-route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSettings = vi.fn();
const writeSettings = vi.fn();

vi.mock('@/lib/server/store', () => ({
  getStore: () => ({ readSettings, writeSettings }),
}));

beforeEach(() => {
  readSettings.mockReset();
  writeSettings.mockReset();
});

describe('GET /api/settings', () => {
  it('never returns the raw gemini key', async () => {
    readSettings.mockResolvedValue({
      providerId: 'gemini',
      geminiApiKey: 'super-secret',
      geminiModel: 'gemini-2.0-flash',
      claudeBinary: 'claude',
      interfaceLanguage: 'tr',
      onboarded: true,
    });
    const { GET } = await import('@/app/api/settings/route');
    const response = await GET();
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain('super-secret');
    expect(body.hasGeminiKey).toBe(true);
  });
});

describe('PUT /api/settings', () => {
  it('merges the patch onto the existing settings', async () => {
    readSettings.mockResolvedValue({
      providerId: 'claude-code',
      geminiApiKey: '',
      geminiModel: 'gemini-2.0-flash',
      claudeBinary: 'claude',
      interfaceLanguage: 'tr',
      onboarded: false,
    });
    const { PUT } = await import('@/app/api/settings/route');
    const response = await PUT(
      new Request('http://localhost/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ providerId: 'gemini', geminiApiKey: 'k' }),
      }),
    );
    expect(response.status).toBe(200);
    expect(writeSettings).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: 'gemini', geminiApiKey: 'k', claudeBinary: 'claude' }),
    );
  });

  it('rejects an invalid provider id', async () => {
    readSettings.mockResolvedValue({
      providerId: 'claude-code',
      geminiApiKey: '',
      geminiModel: 'gemini-2.0-flash',
      claudeBinary: 'claude',
      interfaceLanguage: 'tr',
      onboarded: false,
    });
    const { PUT } = await import('@/app/api/settings/route');
    const response = await PUT(
      new Request('http://localhost/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ providerId: 'openai' }),
      }),
    );
    expect(response.status).toBe(400);
    expect(writeSettings).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Write `app/api/settings/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { settingsSchema, redactSettings } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  const settings = await getStore().readSettings();
  return NextResponse.json(redactSettings(settings));
}

export async function PUT(request: Request) {
  const store = getStore();
  const current = await store.readSettings();

  let patch: unknown;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON govdesi.' }, { status: 400 });
  }

  const merged = settingsSchema.safeParse({ ...current, ...(patch as object) });
  if (!merged.success) {
    return NextResponse.json(
      { error: merged.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }

  await store.writeSettings(merged.data);
  return NextResponse.json(redactSettings(merged.data));
}
```

- [ ] **Step 7: Write `app/api/provider/status/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  const settings = await getStore().readSettings();
  const report = await getProvider(settings).isAvailable();
  return NextResponse.json({ providerId: settings.providerId, ...report });
}
```

- [ ] **Step 8: Write the setup screen**

```tsx
// app/setup/page.tsx
import { SetupForm } from '@/components/SetupForm';
import { getStore } from '@/lib/server/store';
import { redactSettings } from '@/lib/schema';

export default async function SetupPage() {
  const settings = await getStore().readSettings();
  return <SetupForm initial={redactSettings(settings)} />;
}
```

```tsx
// components/SetupForm.tsx
'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import type { Language, ProviderId } from '@/lib/schema';

type Props = {
  initial: {
    providerId: ProviderId;
    geminiModel: string;
    claudeBinary: string;
    interfaceLanguage: Language;
    onboarded: boolean;
    hasGeminiKey: boolean;
  };
};

export function SetupForm({ initial }: Props) {
  const [providerId, setProviderId] = useState<ProviderId>(initial.providerId);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const dict = t(initial.interfaceLanguage);

  async function save() {
    setBusy(true);
    setStatus('');
    const body: Record<string, unknown> = { providerId, onboarded: true };
    if (geminiApiKey) body.geminiApiKey = geminiApiKey;

    const saved = await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(body) });
    if (!saved.ok) {
      setStatus(dict.errorGeneric);
      setBusy(false);
      return;
    }

    const check = await fetch('/api/provider/status');
    const report = (await check.json()) as { available: boolean; detail: string };
    setStatus(`${report.available ? dict.setupAvailable : dict.setupUnavailable}: ${report.detail}`);
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">{dict.setupTitle}</h1>

      <fieldset className="mb-6 space-y-2">
        <legend className="mb-2 text-sm text-neutral-400">{dict.setupEngine}</legend>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={providerId === 'claude-code'}
            onChange={() => setProviderId('claude-code')}
          />
          {dict.setupClaudeCode}
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={providerId === 'gemini'}
            onChange={() => setProviderId('gemini')}
          />
          {dict.setupGemini}
        </label>
      </fieldset>

      {providerId === 'gemini' && (
        <input
          type="password"
          className="mb-6 w-full rounded border border-neutral-700 bg-neutral-900 p-2"
          placeholder={initial.hasGeminiKey ? '********' : 'AIza...'}
          value={geminiApiKey}
          onChange={(event) => setGeminiApiKey(event.target.value)}
        />
      )}

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded bg-neutral-100 px-4 py-2 font-medium text-neutral-900 disabled:opacity-50"
      >
        {dict.setupSave}
      </button>

      {status && <p className="mt-4 text-sm text-neutral-300">{status}</p>}
    </main>
  );
}
```

- [ ] **Step 9: Run the tests**

Run: `npm test`
Expected: PASS, including the key-redaction case.
Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add settings api, provider status check and setup screen"
```

---

### Task 7: Brand profile capture

**Files:**
- Create: `app/api/brand/route.ts`, `app/api/brand/draft/route.ts`
- Create: `app/brand/page.tsx`, `components/BrandForm.tsx`
- Test: `app/api/__tests__/brand-route.test.ts`

**Interfaces:**
- Consumes: `getStore`, `getProvider`, `runWithRepair`, `loadTemplate`, `brandProfileSchema`.
- Produces: `GET /api/brand` returning the profile or `null`. `PUT /api/brand` validating and saving. `POST /api/brand/draft` accepting `{ text, language }` and returning a partial profile drafted by the provider.

- [ ] **Step 1: Write the failing route test**

```ts
// app/api/__tests__/brand-route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const readBrand = vi.fn();
const writeBrand = vi.fn();

vi.mock('@/lib/server/store', () => ({
  getStore: () => ({ readBrand, writeBrand }),
}));

beforeEach(() => {
  readBrand.mockReset();
  writeBrand.mockReset();
});

const valid = {
  productName: 'Marketiyo',
  oneLiner: 'Test',
  category: 'tool',
  audiences: [{ label: 'A', pain: 'B', desire: 'C', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

describe('brand routes', () => {
  it('returns null when no profile exists', async () => {
    readBrand.mockResolvedValue(null);
    const { GET } = await import('@/app/api/brand/route');
    expect(await (await GET()).json()).toBeNull();
  });

  it('saves a valid profile and stamps updatedAt', async () => {
    const { PUT } = await import('@/app/api/brand/route');
    const response = await PUT(
      new Request('http://localhost/api/brand', {
        method: 'PUT',
        body: JSON.stringify({ ...valid, updatedAt: '2000-01-01T00:00:00.000Z' }),
      }),
    );
    expect(response.status).toBe(200);
    const saved = writeBrand.mock.calls[0][0];
    expect(new Date(saved.updatedAt).getFullYear()).toBeGreaterThan(2000);
  });

  it('rejects a profile with no audiences', async () => {
    const { PUT } = await import('@/app/api/brand/route');
    const response = await PUT(
      new Request('http://localhost/api/brand', {
        method: 'PUT',
        body: JSON.stringify({ ...valid, audiences: [] }),
      }),
    );
    expect(response.status).toBe(400);
    expect(writeBrand).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- app/api/__tests__/brand-route.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `app/api/brand/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { brandProfileSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStore().readBrand());
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON govdesi.' }, { status: 400 });
  }

  const stamped = { ...(body as object), updatedAt: new Date().toISOString() };
  const parsed = brandProfileSchema.safeParse(stamped);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }

  await getStore().writeBrand(parsed.data);
  return NextResponse.json(parsed.data);
}
```

- [ ] **Step 4: Write `app/api/brand/draft/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProvider, runWithRepair } from '@/lib/providers';
import { loadTemplate } from '@/lib/prompts/load';
import { languageSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

const bodySchema = z.object({
  text: z.string().min(20),
  language: languageSchema.default('tr'),
});

export async function POST(request: Request) {
  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'En az 20 karakterlik bir urun aciklamasi gerekli.' }, { status: 400 });
  }

  const settings = await getStore().readSettings();
  const provider = getProvider(settings);

  const prompt = [
    loadTemplate('brand-draft', parsedBody.data.language),
    '',
    '## URUN ACIKLAMASI',
    parsedBody.data.text,
    '',
    '## CIKTI',
    'Sadece gecerli JSON dondur. brandProfile semasina uy. Bilmedigin alanlari bos dizi veya bos metin birak.',
  ].join('\n');

  const result = await runWithRepair(provider, { prompt, schemaName: 'brandProfile' });
  if (!result.ok) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 502 });
  }
  return NextResponse.json(result.data);
}
```

- [ ] **Step 5: Write the brand page and form**

`app/brand/page.tsx` reads the profile server-side and renders `BrandForm` with it, or with `null` for a fresh start.

```tsx
// app/brand/page.tsx
import { BrandForm } from '@/components/BrandForm';
import { getStore } from '@/lib/server/store';

export default async function BrandPage() {
  const store = getStore();
  const [brand, settings] = await Promise.all([store.readBrand(), store.readSettings()]);
  return <BrandForm initial={brand} language={settings.interfaceLanguage} />;
}
```

`components/BrandForm.tsx` is a client component with:

- A textarea and a draft button posting to `/api/brand/draft`, filling the form from the response.
- Controlled inputs for `productName`, `oneLiner`, and `category`.
- Repeatable rows for audiences, offers, competitors, proof, banned claims, voice do and voice dont, each with an add and a remove control.
- A select for `outputLanguage` and checkboxes for `platforms`.
- A save button putting the whole object to `/api/brand`, surfacing the error string from a 400 response above the form.

- [ ] **Step 6: Run the tests and the type check**

Run: `npm test`
Expected: PASS.
Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add brand profile capture with assisted drafting"
```

---

### Task 8: Idea generation and triage board

**Files:**
- Create: `lib/ideas/generate.ts`, `app/api/ideas/route.ts`, `app/api/ideas/generate/route.ts`, `app/api/ideas/[id]/route.ts`
- Create: `app/ideas/page.tsx`, `components/IdeaBoard.tsx`, `components/IdeaCard.tsx`
- Test: `lib/ideas/__tests__/generate.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2 through 5.
- Produces: `generateIdeas({ store, provider, platform, count, angles })` returning `{ ideas: Idea[]; discarded: number }`. `GET /api/ideas`, `POST /api/ideas/generate`, `PATCH /api/ideas/[id]`.

- [ ] **Step 1: Write the failing generation tests**

```ts
// lib/ideas/__tests__/generate.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { createStubProvider } from '@/lib/providers';
import { generateIdeas } from '@/lib/ideas/generate';
import type { BrandProfile } from '@/lib/schema';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-ideas-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Sosyal medya icerik motoru',
  category: 'tool',
  audiences: [{ label: 'Indie hacker', pain: 'Zaman yok', desire: 'Icerik', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

const good = {
  platform: 'x',
  format: 'thread',
  angle: 'education',
  hook: 'Bir kanca',
  premise: 'Ozet',
  whyItWorks: 'Neden',
  audienceRef: 'Indie hacker',
  score: 7,
  tags: [],
};

describe('generateIdeas', () => {
  it('assigns ids, a shared batch id, and new status', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ ideas: [good, { ...good, hook: 'Ikinci' }] })]);

    const result = await generateIdeas({ store, provider, platform: 'x', count: 2, angles: [] });

    expect(result.ideas).toHaveLength(2);
    expect(new Set(result.ideas.map((i) => i.id)).size).toBe(2);
    expect(new Set(result.ideas.map((i) => i.batchId)).size).toBe(1);
    expect(result.ideas.every((i) => i.status === 'new')).toBe(true);
  });

  it('persists generated ideas to the store', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ ideas: [good] })]);
    await generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] });
    expect(await store.readIdeas()).toHaveLength(1);
  });

  it('keeps valid items and counts the discarded ones', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([
      JSON.stringify({ ideas: [good, { ...good, angle: 'nonsense' }, { ...good, hook: '' }] }),
    ]);
    const result = await generateIdeas({ store, provider, platform: 'x', count: 3, angles: [] });
    expect(result.ideas).toHaveLength(1);
    expect(result.discarded).toBe(2);
  });

  it('throws a readable error when no brand profile exists', async () => {
    const store = createStore(root);
    const provider = createStubProvider([JSON.stringify({ ideas: [good] })]);
    await expect(
      generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] }),
    ).rejects.toThrow(/marka profili/i);
  });

  it('feeds prior hooks back as avoidance context', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ ideas: [good] })]);
    await generateIdeas({ store, provider, platform: 'x', count: 1, angles: [] });

    const second = createStubProvider([JSON.stringify({ ideas: [{ ...good, hook: 'Yeni' }] })]);
    const calls: string[] = [];
    const spy = {
      ...second,
      complete: async (req: { prompt: string; schemaName: string }) => {
        calls.push(req.prompt);
        return second.complete(req);
      },
    };
    await generateIdeas({ store, provider: spy, platform: 'x', count: 1, angles: [] });
    expect(calls[0]).toContain('Bir kanca');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- lib/ideas`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/ideas/generate.ts`**

```ts
import { randomUUID } from 'node:crypto';
import { runWithRepair, type Provider } from '@/lib/providers';
import { composeIdeaBatchPrompt } from '@/lib/prompts/compose';
import { PROMPT_VERSION } from '@/lib/prompts/version';
import { generatedIdeaSchema, ideaSchema, type Angle, type Idea, type Platform } from '@/lib/schema';
import type { Store } from '@/lib/workspace/store';

export type GenerateIdeasInput = {
  store: Store;
  provider: Provider;
  platform: Platform;
  count: number;
  angles: Angle[];
};

export async function generateIdeas(
  input: GenerateIdeasInput,
): Promise<{ ideas: Idea[]; discarded: number }> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Once marka profili olusturulmali.');

  const existing = await input.store.readIdeas();
  const prompt = composeIdeaBatchPrompt({
    brand,
    platform: input.platform,
    count: input.count,
    angles: input.angles,
    recentHooks: existing.map((idea) => idea.hook),
    recentRejections: existing.filter((idea) => idea.status === 'rejected'),
  });

  const result = await runWithRepair<{ ideas: unknown[] }>(input.provider, {
    prompt,
    schemaName: 'ideaBatchResponse',
  });
  if (!result.ok) throw new Error(result.error.message);

  const batchId = randomUUID();
  const createdAt = new Date().toISOString();

  let discarded = 0;
  const ideas: Idea[] = [];

  for (const candidate of result.data.ideas) {
    const parsed = generatedIdeaSchema.safeParse(candidate);
    if (!parsed.success) {
      discarded += 1;
      continue;
    }
    const idea = ideaSchema.safeParse({
      ...parsed.data,
      id: randomUUID(),
      createdAt,
      batchId,
      status: 'new',
      promptVersion: PROMPT_VERSION,
    });
    if (!idea.success) {
      discarded += 1;
      continue;
    }
    ideas.push(idea.data);
  }

  if (ideas.length) await input.store.appendIdeas(ideas);
  return { ideas, discarded };
}
```

Note: `ideaBatchResponseSchema` validates the envelope. The per-item re-parse here is what allows partial success, since a strict array parse would reject the whole batch on one bad item. To make that work, relax the envelope to `z.object({ ideas: z.array(z.unknown()) })` in `lib/schema/idea.ts` under the name `ideaBatchEnvelopeSchema`, register it as `ideaBatchResponse`, and keep `generatedIdeaSchema` as the per-item gate. Update the Task 2 test expectation for `ideaBatchResponseSchema` accordingly: it should still reject `{}` and still accept a well-formed batch.

- [ ] **Step 4: Write the idea routes**

```ts
// app/api/ideas/route.ts
import { NextResponse } from 'next/server';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStore().readIdeas());
}
```

```ts
// app/api/ideas/generate/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProvider } from '@/lib/providers';
import { generateIdeas } from '@/lib/ideas/generate';
import { angleSchema, platformSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 300;

const bodySchema = z.object({
  platform: platformSchema,
  count: z.number().int().min(1).max(50).default(10),
  angles: z.array(angleSchema).default([]),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz istek govdesi.' }, { status: 400 });
  }

  const store = getStore();
  const settings = await store.readSettings();

  try {
    const result = await generateIdeas({
      store,
      provider: getProvider(settings),
      ...parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
```

```ts
// app/api/ideas/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ideaStatusSchema, rejectionReasonSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: ideaStatusSchema.optional(),
  rejectionReason: rejectionReasonSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz guncelleme.' }, { status: 400 });
  }

  const ideas = await getStore().updateIdea(id, parsed.data);
  const updated = ideas.find((idea) => idea.id === id);
  if (!updated) return NextResponse.json({ error: 'Fikir bulunamadi.' }, { status: 404 });
  return NextResponse.json(updated);
}
```

- [ ] **Step 5: Write the board**

`app/ideas/page.tsx` loads ideas and settings server-side and renders `IdeaBoard`.

`components/IdeaBoard.tsx` is a client component with:

- A generation bar: platform select, count input, optional angle multi-select, and a generate button posting to `/api/ideas/generate`. While running it shows a busy state and disables the button.
- After a run it shows the number generated, and when `discarded` is above zero, `${discarded} ${dict.discardedCount}`.
- Filters for platform, status, and angle. Default sort is by `score` descending, rendered only as card order. No card renders the number.
- A grid of `IdeaCard`.

`components/IdeaCard.tsx` shows the hook as the heading, the premise, the angle and format as small labels, and buttons for keep, reject, and expand. Reject opens a short reason list matching `rejectionReasonSchema`. Each action patches `/api/ideas/[id]` and updates local state optimistically, reverting on a failed response.

- [ ] **Step 6: Run the tests and the type check**

Run: `npm test`
Expected: PASS, including the partial-batch case.
Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add idea generation, persistence and triage board"
```

---

### Task 9: Expansion

**Files:**
- Create: `lib/ideas/expand.ts`, `app/api/ideas/[id]/expansion/route.ts`
- Create: `app/ideas/[id]/page.tsx`, `components/ExpansionEditor.tsx`
- Test: `lib/ideas/__tests__/expand.test.ts`

**Interfaces:**
- Consumes: `composeExpansionPrompt`, `runWithRepair`, store.
- Produces: `expandIdea({ store, provider, ideaId })` writing `expansions/<id>.md` with front matter and setting the idea's status to `expanded`. `GET`, `POST`, and `PUT` on the expansion route.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/ideas/__tests__/expand.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore } from '@/lib/workspace/store';
import { createStubProvider } from '@/lib/providers';
import { expandIdea } from '@/lib/ideas/expand';
import type { BrandProfile, Idea } from '@/lib/schema';

let root: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'marketiyo-expand-'));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const brand: BrandProfile = {
  productName: 'Marketiyo',
  oneLiner: 'Test',
  category: 'tool',
  audiences: [{ label: 'A', pain: 'B', desire: 'C', whereTheyHangOut: 'X' }],
  offers: [],
  voice: { do: [], dont: [], referenceExamples: [] },
  proof: [],
  competitors: [],
  bannedClaims: [],
  outputLanguage: 'tr',
  platforms: ['x'],
  updatedAt: '2026-09-11T00:00:00.000Z',
};

const idea: Idea = {
  id: 'i1',
  createdAt: '2026-09-11T00:00:00.000Z',
  batchId: 'b1',
  platform: 'x',
  format: 'thread',
  angle: 'education',
  hook: 'Kanca',
  premise: 'Ozet',
  whyItWorks: 'Neden',
  audienceRef: 'A',
  score: 6,
  tags: [],
  status: 'kept',
  promptVersion: 'idea-batch@1',
};

describe('expandIdea', () => {
  it('writes markdown with front matter and flips the status', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    await store.appendIdeas([idea]);
    const provider = createStubProvider([JSON.stringify({ markdown: '# Kanca\n\nGovde' })]);

    await expandIdea({ store, provider, ideaId: 'i1' });

    const markdown = await store.readExpansion('i1');
    expect(markdown).toContain('ideaId: i1');
    expect(markdown).toContain('# Kanca');
    const ideas = await store.readIdeas();
    expect(ideas[0].status).toBe('expanded');
  });

  it('throws when the idea does not exist', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    const provider = createStubProvider([JSON.stringify({ markdown: 'x' })]);
    await expect(expandIdea({ store, provider, ideaId: 'nope' })).rejects.toThrow(/bulunamadi/i);
  });

  it('does not overwrite the file when the provider fails', async () => {
    const store = createStore(root);
    await store.writeBrand(brand);
    await store.appendIdeas([idea]);
    await store.writeExpansion('i1', 'onceki icerik');
    const provider = createStubProvider(['bad', 'still bad']);
    await expect(expandIdea({ store, provider, ideaId: 'i1' })).rejects.toThrow();
    expect(await store.readExpansion('i1')).toBe('onceki icerik');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- lib/ideas/__tests__/expand.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/ideas/expand.ts`**

```ts
import { runWithRepair, type Provider } from '@/lib/providers';
import { composeExpansionPrompt } from '@/lib/prompts/compose';
import { EXPANSION_PROMPT_VERSION } from '@/lib/prompts/version';
import type { Store } from '@/lib/workspace/store';

export async function expandIdea(input: {
  store: Store;
  provider: Provider;
  ideaId: string;
}): Promise<string> {
  const brand = await input.store.readBrand();
  if (!brand) throw new Error('Once marka profili olusturulmali.');

  const ideas = await input.store.readIdeas();
  const idea = ideas.find((candidate) => candidate.id === input.ideaId);
  if (!idea) throw new Error('Fikir bulunamadi.');

  const result = await runWithRepair<{ markdown: string }>(input.provider, {
    prompt: composeExpansionPrompt({ brand, idea }),
    schemaName: 'expansionResponse',
  });
  if (!result.ok) throw new Error(result.error.message);

  const frontMatter = [
    '---',
    `ideaId: ${idea.id}`,
    `platform: ${idea.platform}`,
    `generatedAt: ${new Date().toISOString()}`,
    `promptVersion: ${EXPANSION_PROMPT_VERSION}`,
    '---',
    '',
  ].join('\n');

  const markdown = frontMatter + result.data.markdown;
  await input.store.writeExpansion(idea.id, markdown);
  await input.store.updateIdea(idea.id, { status: 'expanded' });
  return markdown;
}
```

- [ ] **Step 4: Write the expansion route**

```ts
// app/api/ideas/[id]/expansion/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProvider } from '@/lib/providers';
import { expandIdea } from '@/lib/ideas/expand';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const markdown = await getStore().readExpansion(id);
  return NextResponse.json({ markdown });
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const store = getStore();
  const settings = await store.readSettings();
  try {
    const markdown = await expandIdea({ store, provider: getProvider(settings), ideaId: id });
    return NextResponse.json({ markdown });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}

const putSchema = z.object({ markdown: z.string().min(1) });

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = putSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Gecersiz icerik.' }, { status: 400 });
  await getStore().writeExpansion(id, parsed.data.markdown);
  return NextResponse.json({ markdown: parsed.data.markdown });
}
```

- [ ] **Step 5: Write the detail page**

`app/ideas/[id]/page.tsx` loads the idea and any existing expansion, then renders `ExpansionEditor`.

`components/ExpansionEditor.tsx` is a client component showing the idea's hook and premise, a generate button posting to the expansion route, a textarea bound to the markdown, and a save button putting it back. Errors from a 502 render above the editor.

- [ ] **Step 6: Run the tests and the type check**

Run: `npm test`
Expected: PASS.
Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: expand kept ideas into platform assets"
```

---

### Task 10: Calendar

**Files:**
- Create: `lib/calendar/plan.ts`, `app/api/calendar/route.ts`
- Create: `app/calendar/page.tsx`, `components/CalendarGrid.tsx`
- Test: `lib/calendar/__tests__/plan.test.ts`

**Interfaces:**
- Consumes: store, `CalendarSlot`, `Idea`.
- Produces: `proposeFill({ slots, ideas })` returning slots with `ideaId` filled from unscheduled kept or expanded ideas matching the slot platform. `GET /api/calendar`, `PUT /api/calendar`.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/calendar/__tests__/plan.test.ts
import { describe, it, expect } from 'vitest';
import { proposeFill } from '@/lib/calendar/plan';
import type { CalendarSlot, Idea } from '@/lib/schema';

function idea(id: string, status: Idea['status'], platform: Idea['platform'] = 'x'): Idea {
  return {
    id,
    createdAt: '2026-09-11T00:00:00.000Z',
    batchId: 'b1',
    platform,
    format: 'thread',
    angle: 'education',
    hook: `hook-${id}`,
    premise: 'p',
    whyItWorks: 'w',
    audienceRef: 'A',
    score: 5,
    tags: [],
    status,
    promptVersion: 'idea-batch@1',
  };
}

function slot(id: string, ideaId: string | null, platform: CalendarSlot['platform'] = 'x'): CalendarSlot {
  return { id, date: '2026-09-14', platform, ideaId, status: 'planned', note: '' };
}

describe('proposeFill', () => {
  it('fills empty slots with eligible ideas', () => {
    const filled = proposeFill({
      slots: [slot('s1', null)],
      ideas: [idea('i1', 'kept')],
    });
    expect(filled[0].ideaId).toBe('i1');
  });

  it('never touches a slot that already has an idea', () => {
    const filled = proposeFill({
      slots: [slot('s1', 'existing')],
      ideas: [idea('i1', 'kept')],
    });
    expect(filled[0].ideaId).toBe('existing');
  });

  it('skips ideas that are new or rejected', () => {
    const filled = proposeFill({
      slots: [slot('s1', null)],
      ideas: [idea('i1', 'new'), idea('i2', 'rejected')],
    });
    expect(filled[0].ideaId).toBeNull();
  });

  it('matches the slot platform', () => {
    const filled = proposeFill({
      slots: [slot('s1', null, 'linkedin')],
      ideas: [idea('i1', 'kept', 'x')],
    });
    expect(filled[0].ideaId).toBeNull();
  });

  it('never assigns the same idea twice', () => {
    const filled = proposeFill({
      slots: [slot('s1', null), slot('s2', null)],
      ideas: [idea('i1', 'expanded')],
    });
    expect(filled.filter((s) => s.ideaId === 'i1')).toHaveLength(1);
    expect(filled[1].ideaId).toBeNull();
  });

  it('does not reuse an idea already scheduled in another slot', () => {
    const filled = proposeFill({
      slots: [slot('s1', 'i1'), slot('s2', null)],
      ideas: [idea('i1', 'expanded')],
    });
    expect(filled[1].ideaId).toBeNull();
  });

  it('prefers expanded ideas over merely kept ones', () => {
    const filled = proposeFill({
      slots: [slot('s1', null)],
      ideas: [idea('i1', 'kept'), idea('i2', 'expanded')],
    });
    expect(filled[0].ideaId).toBe('i2');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- lib/calendar`
Expected: FAIL, module not found.

- [ ] **Step 3: Write `lib/calendar/plan.ts`**

```ts
import type { CalendarSlot, Idea } from '@/lib/schema';

/** Fills empty slots with unscheduled ideas. Expanded ideas win over merely kept ones. */
export function proposeFill(input: { slots: CalendarSlot[]; ideas: Idea[] }): CalendarSlot[] {
  const taken = new Set(input.slots.map((slot) => slot.ideaId).filter((id): id is string => !!id));

  const eligible = input.ideas
    .filter((idea) => idea.status === 'kept' || idea.status === 'expanded')
    .filter((idea) => !taken.has(idea.id))
    .sort((a, b) => {
      const rank = (idea: Idea) => (idea.status === 'expanded' ? 0 : 1);
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return b.score - a.score;
    });

  return input.slots.map((slot) => {
    if (slot.ideaId) return slot;
    const index = eligible.findIndex((idea) => idea.platform === slot.platform);
    if (index === -1) return slot;
    const [chosen] = eligible.splice(index, 1);
    taken.add(chosen.id);
    return { ...slot, ideaId: chosen.id };
  });
}
```

- [ ] **Step 4: Write `app/api/calendar/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calendarSlotSchema } from '@/lib/schema';
import { getStore } from '@/lib/server/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStore().readCalendar());
}

const putSchema = z.array(calendarSlotSchema);

export async function PUT(request: Request) {
  const parsed = putSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
      { status: 400 },
    );
  }
  await getStore().writeCalendar(parsed.data);
  return NextResponse.json(parsed.data);
}
```

- [ ] **Step 5: Write the calendar view**

`app/calendar/page.tsx` loads slots and ideas server-side and renders `CalendarGrid`.

`components/CalendarGrid.tsx` is a client component with:

- A week view showing seven day columns, each listing its slots with the linked idea's hook, or an empty state.
- Controls to add a slot for a given date and platform, to clear a slot, and to cycle its status through planned, ready, posted, and skipped.
- A propose-fill button running `proposeFill` on the current state and showing the result for confirmation before it puts to `/api/calendar`.
- No automatic posting anywhere. Marking a slot posted is a manual click only.

- [ ] **Step 6: Run the full suite and the type check**

Run: `npm test`
Expected: PASS.
Run: `npm run typecheck`
Expected: clean.
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add calendar with slot planning and fill proposals"
```

---

### Task 11: Navigation, first-run redirect, and workspace bootstrap

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`
- Create: `components/Nav.tsx`
- Test: `app/__tests__/home-redirect.test.ts`

**Interfaces:**
- Consumes: `getStore`.
- Produces: a persistent navigation bar, and a home page that redirects to `/setup` when settings are not onboarded, to `/brand` when no brand profile exists, and to `/ideas` otherwise.

- [ ] **Step 1: Write the failing redirect test**

```ts
// app/__tests__/home-redirect.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSettings = vi.fn();
const readBrand = vi.fn();
const redirect = vi.fn((target: string) => {
  throw new Error(`REDIRECT:${target}`);
});

vi.mock('@/lib/server/store', () => ({ getStore: () => ({ readSettings, readBrand }) }));
vi.mock('next/navigation', () => ({ redirect }));

beforeEach(() => {
  readSettings.mockReset();
  readBrand.mockReset();
  redirect.mockClear();
});

async function run() {
  const { default: Home } = await import('@/app/page');
  await Home().catch(() => undefined);
}

describe('home routing', () => {
  it('sends a fresh install to setup', async () => {
    readSettings.mockResolvedValue({ onboarded: false });
    readBrand.mockResolvedValue(null);
    await run();
    expect(redirect).toHaveBeenCalledWith('/setup');
  });

  it('sends an onboarded install with no brand to the brand page', async () => {
    readSettings.mockResolvedValue({ onboarded: true });
    readBrand.mockResolvedValue(null);
    await run();
    expect(redirect).toHaveBeenCalledWith('/brand');
  });

  it('sends a ready install to the idea bank', async () => {
    readSettings.mockResolvedValue({ onboarded: true });
    readBrand.mockResolvedValue({ productName: 'Marketiyo' });
    await run();
    expect(redirect).toHaveBeenCalledWith('/ideas');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- app/__tests__/home-redirect.test.ts`
Expected: FAIL, the current home page renders instead of redirecting.

- [ ] **Step 3: Rewrite `app/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { getStore } from '@/lib/server/store';

export default async function Home() {
  const store = getStore();
  const settings = await store.readSettings();
  if (!settings.onboarded) redirect('/setup');

  const brand = await store.readBrand();
  if (!brand) redirect('/brand');

  redirect('/ideas');
}
```

- [ ] **Step 4: Write `components/Nav.tsx` and mount it in the layout**

```tsx
import Link from 'next/link';

const links = [
  { href: '/ideas', label: 'Fikirler' },
  { href: '/calendar', label: 'Takvim' },
  { href: '/brand', label: 'Marka' },
  { href: '/setup', label: 'Kurulum' },
] as const;

export function Nav() {
  return (
    <nav className="border-b border-neutral-800">
      <ul className="mx-auto flex max-w-5xl gap-6 p-4 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-neutral-300 hover:text-neutral-50">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

Mount `<Nav />` inside `<body>` above `{children}` in `app/layout.tsx`.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS. The Task 1 smoke test still passes, since it asserts on `lib/meta` rather than the page.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add navigation and first-run routing"
```

---

### Task 12: Licence, README, and contributor documentation

**Files:**
- Create: `LICENSE`, `README.md`, `CONTRIBUTING.md`
- Modify: `package.json` to set `"license": "SEE LICENSE IN LICENSE"`

**Interfaces:**
- Consumes: nothing.
- Produces: the legal and onboarding surface of the repository.

- [ ] **Step 1: Write `LICENSE`**

```
Marketiyo Source-Available License, version 1.0
Copyright (c) 2026 Eren Develops

1. Grant
   You may use, copy, and run this software for any purpose, personal or
   commercial, free of charge. You may modify it for your own use.

2. Redistribution of unmodified copies
   You may redistribute unmodified copies only if you keep this licence
   file intact and give visible credit to the original project, including
   a link to its repository.

3. Redistribution of modified copies
   You may not publish, distribute, or otherwise make available a modified
   copy of this software, except as permitted by section 4.

4. Contributor exception
   You may fork this repository, publish that fork, and modify it for the
   purpose of preparing and submitting a contribution back to the original
   project. Such a fork may remain public for as long as the contribution
   is open or under discussion. You may not present it as a competing
   distribution.

5. No trademark rights
   This licence grants no rights to the Marketiyo name or logo beyond the
   credit required by section 2.

6. No warranty
   This software is provided "as is", without warranty of any kind, express
   or implied. In no event shall the authors be liable for any claim,
   damages, or other liability arising from the software or its use.
```

- [ ] **Step 2: Write `README.md`**

It must contain, in this order:

1. The project name and the one-line description, in Turkish, with an English line beneath it.
2. A prominent note that this is **source-available software, not open source**, with a one-line reason and a link to `LICENSE`.
3. What it does: idea bank, expansion, calendar, across short video, X, LinkedIn, and Instagram carousels.
4. Requirements: Node 20 or newer, plus either a locally installed and logged-in Claude Code, or a Gemini API key.
5. Install and run: `npm install` then `npm run dev`, open the local address, follow setup.
6. A short section stating that all data stays in the `workspace` folder, that the folder is git-ignored, and that the Gemini key is stored in `workspace/settings.local.json` and never sent anywhere except Google.
7. A scope note listing what version one deliberately does not do: no trend research, no analytics import, no direct publishing, no hosting.

- [ ] **Step 3: Write `CONTRIBUTING.md`**

It must state plainly that the licence forbids publishing modified copies **except** forks made to prepare a pull request, that such forks are explicitly permitted, and that contributions are accepted under the same licence. Include the commands for running the tests, the type check, and the build.

- [ ] **Step 4: Verify the README does not claim open source**

Run: `grep -ri "open source" README.md`
Expected: either no output, or only the sentence that explains the project is *not* open source.

- [ ] **Step 5: Run the full verification pass**

Run: `npm test`
Run: `npm run typecheck`
Run: `npm run build`
Expected: all three succeed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: add source-available licence, readme and contributing guide"
```

---

## Self-review notes

**Spec coverage.** Architecture maps to Tasks 1, 3, 4. Data model to Tasks 2 and 3. Provider interface and structured output discipline to Task 4. Prompt composition and the avoidance caps to Task 5. First run to Task 6. Brand interview to Task 7. Idea batch and triage to Task 8. Expansion to Task 9. Calendar to Task 10. Internationalisation to Tasks 5 and 6. Error handling to Tasks 3, 4, and each route. Testing to every task. Licensing to Task 12.

**Known cross-task adjustment.** Task 8 Step 3 changes the envelope schema introduced in Task 2, so that a single malformed idea does not void an entire batch. That change is called out in place, along with the test expectation to update.

**Deliberately deferred, per the spec.** Trend research, analytics ingestion, hosting, and direct publishing are out of scope for every task above.
