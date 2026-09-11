# Marketiyo — Design Spec

**Date:** 2026-09-11
**Status:** Approved for planning
**Scope:** v1, local-only

---

## 1. Summary

Marketiyo is a locally-run Next.js application that turns a product into a stream
of social media content: idea batches, expanded scripts and posts, and a posting
calendar.

It runs on the user's own machine. There is no hosted backend, no account system,
and no telemetry. The user's data stays in a folder of plain files they own.

Two generation engines ship in v1:

- **Claude Code CLI**, spawned in headless print mode. Uses the user's existing
  Claude subscription login. No API key required.
- **Gemini API**, called with a key the user stores locally.

Both engines read the same prompt library from the repository, so output quality
does not fork by provider.

**Primary language is Turkish.** English is supported as a secondary language for
both the interface and generated content.

---

## 2. Goals and non-goals

### Goals

- Produce genuinely usable social content ideas for a specific product, not
  generic marketing filler.
- Work for a Claude Pro subscriber with zero API keys and zero cost per run.
- Keep all user data as readable files on disk.
- Make the prompt library the unit of quality, so improvements benefit every
  engine at once.
- Ship something a single person can run in under five minutes.

### Non-goals for v1

- Hosting, accounts, billing, or multi-user support.
- Live trend research from the web.
- Analytics ingestion and performance feedback loops.
- Publishing or scheduling directly to social platforms.
- Image, video, or audio generation.

The two research and analytics features are deliberately deferred. The idea
generator is designed so each can later be injected as an additional context
block without restructuring anything.

---

## 3. Architecture

### 3.1 Shape

A single Next.js application using the App Router and TypeScript. The user runs it
locally with one command. The same process serves the interface and the local
route handlers that talk to the generation engines.

Route handlers are the only place that spawns a process or makes a network call.
The browser never holds an API key and never calls a model provider directly.

### 3.2 Layers

| Layer | Responsibility |
|---|---|
| `app/` | Interface routes and local API route handlers |
| `lib/providers/` | Engine adapters behind one interface |
| `lib/prompts/` | Markdown prompt templates and platform rule cards |
| `lib/schema/` | Zod schemas for every structured model response |
| `lib/workspace/` | Reading and writing the user's workspace files |
| `lib/i18n/` | Interface string dictionaries |

### 3.3 Provider interface

Every engine implements one function:

```ts
type GenerateRequest = {
  prompt: string;
  schemaName: string;   // selects the Zod schema to validate against
  maxOutputTokens?: number;
};

type GenerateResult<T> =
  | { ok: true; data: T; raw: string }
  | { ok: false; error: ProviderError; raw?: string };

interface Provider {
  id: 'claude-code' | 'gemini';
  isAvailable(): Promise<AvailabilityReport>;
  generate<T>(req: GenerateRequest): Promise<GenerateResult<T>>;
}
```

`isAvailable` is what powers the setup screen. For the Claude Code adapter it
checks that the binary exists on PATH and that the user is logged in. For Gemini
it checks that a key is present and performs a cheap validation call.

**Claude Code adapter.** Spawns the `claude` binary in headless print mode with a
JSON output format, passing the composed prompt on stdin. Reads the structured
result from stdout. Session state is not reused between calls; every generation is
self-contained, because the full context is composed by the app.

**Gemini adapter.** Posts to the Gemini REST endpoint with the locally stored key
and a JSON response mime type.

Adding a third adapter later means implementing this interface and nothing else.

### 3.4 Structured output discipline

Model output is never trusted. Every response is parsed against a Zod schema
before it touches application state.

- Invalid response triggers exactly one repair retry, in which the model is shown
  the validation errors and asked to return corrected JSON.
- A second failure surfaces as an error in the interface with the raw text
  available for inspection.
- For batch generation, partial success is allowed. Valid ideas are kept, invalid
  entries are dropped, and the interface reports how many were discarded.

This bounded-retry rule is what keeps a hundred-item batch from failing on a
single malformed record.

### 3.5 Prompt composition

A generation prompt is assembled from parts, in this fixed order:

1. System framing for the task, from a Markdown template.
2. The brand profile, serialised as compact structured text.
3. The platform rule card for the target platform.
4. The idea rubric, for batch generation.
5. Avoidance context: hook lines already generated, and recent rejections.
6. The output schema description and a worked example.

Templates live as Markdown files under `lib/prompts/`, in parallel Turkish and
English versions. Template selection follows the brand profile's output language,
not the interface language.

Avoidance context is capped. The most recent 150 hook lines and the most recent 40
rejections are included, newest first, and older entries are dropped.

---

## 4. Data model

All user data lives in a workspace directory, default `./workspace`, configurable
at first run. Four kinds of file.

### 4.1 Brand profile

`workspace/brand.json`. Written by the onboarding interview, editable in the
interface and by hand.

| Field | Notes |
|---|---|
| `productName` | |
| `oneLiner` | One sentence describing what it does |
| `category` | Free text, e.g. developer tool, coffee shop |
| `audiences[]` | Each with `label`, `pain`, `desire`, `whereTheyHangOut` |
| `offers[]` | Each with `label`, `cta`, `url` |
| `voice` | `do[]`, `dont[]`, `referenceExamples[]` |
| `proof[]` | Metrics, demos, testimonials that can legitimately be claimed |
| `competitors[]` | `name`, `positioning`, `whatWeDoDifferently` |
| `bannedClaims[]` | Things the generator must never assert |
| `outputLanguage` | `tr` or `en` |
| `platforms[]` | Active platforms |
| `updatedAt` | |

### 4.2 Ideas

`workspace/ideas.json`. An array of small records. Ideas are cheap and disposable.

| Field | Notes |
|---|---|
| `id` | Stable identifier |
| `createdAt` | |
| `batchId` | Groups ideas generated together |
| `platform` | `short-video`, `x`, `linkedin`, `instagram-static` |
| `format` | Platform-specific, e.g. `talking-head`, `thread`, `carousel` |
| `angle` | `education`, `proof`, `contrarian`, `story`, `offer` |
| `hook` | The opening line |
| `premise` | One sentence on the content itself |
| `whyItWorks` | One sentence of reasoning |
| `audienceRef` | Which audience segment it targets |
| `score` | Rubric score, used only as a sort order |
| `status` | `new`, `kept`, `rejected`, `expanded`, `scheduled` |
| `rejectionReason` | Optional, chosen from a short list, feeds avoidance context |
| `tags[]` | |
| `promptVersion` | Which prompt template version produced it |

### 4.3 Expansions

`workspace/expansions/<ideaId>.md`. Generated only for kept ideas.

Front matter records `ideaId`, `platform`, `generatedAt`, and `promptVersion`. The
body differs by platform:

- **Short video:** hook, beat-by-beat script with rough timings, on-screen text
  lines, shot notes, caption, and suggested sound direction.
- **X:** the post or the full thread, plus two alternate hooks.
- **LinkedIn:** the full post, plus an alternate opening.
- **Instagram static:** slide-by-slide copy, a design direction note per slide,
  and the caption.

### 4.4 Calendar

`workspace/calendar.json`. An array of slots.

| Field | Notes |
|---|---|
| `id` | |
| `date` | ISO date |
| `platform` | |
| `ideaId` | Nullable, an empty slot is a planned gap |
| `status` | `planned`, `ready`, `posted`, `skipped` |
| `note` | Free text |

### 4.5 Settings

`workspace/settings.local.json`. Git-ignored. Holds the selected provider, the
Gemini key if present, the workspace path, and the interface language. This file
is listed in `.gitignore` in the generated workspace and in the repository root.

---

## 5. User flows

### 5.1 First run

1. Language selection, defaulting to Turkish.
2. Engine setup. The app probes for the Claude Code binary and reports what it
   finds. The user picks Claude Code or enters a Gemini key. The chosen engine is
   validated before the user can continue.
3. Brand interview. A multi-step form, with an assisted mode where the user pastes
   a product description or a landing page's text and the engine drafts a first
   version of the profile for them to correct.
4. Platform selection.

### 5.2 Idea batch

1. The user picks platforms, a batch size, and optionally an angle mix.
2. The app composes the prompt and calls the provider, streaming progress.
3. Valid ideas are appended to the bank with status `new`.
4. The interface reports the count generated and the count discarded.

### 5.3 Triage board

A filterable board grouped by platform. Filters cover platform, angle, status, and
tag. Sorting defaults to score, descending. Each card offers keep, reject, and
expand. Rejecting prompts for an optional one-click reason.

### 5.4 Expansion

Expanding a kept idea calls the provider with the expansion template for that
platform, writes the Markdown file, and sets the idea's status to `expanded`. The
result is editable in the interface, and edits are saved back to the same file.

### 5.5 Calendar

A weekly and monthly view. The user drags an expanded idea onto a slot, or asks
the app to propose a fill. Fill proposals only use kept or expanded ideas that are
not already scheduled, and respect a per-platform cadence the user sets. Nothing
is ever posted automatically. Marking a slot as posted is a manual action.

---

## 6. Platform rule cards

Each platform has a Markdown rule card under `lib/prompts/platforms/`, in Turkish
and English. A card defines the formats available, length limits, hook
conventions, structural expectations, calls to action that suit the platform, and
explicit anti-patterns to avoid.

Platforms are data, not code. Adding a platform means adding a rule card and an
expansion template, with no changes to the generation pipeline.

v1 ships four cards: short video covering TikTok, Reels and Shorts; X; LinkedIn;
and Instagram static.

---

## 7. Scoring

The rubric asks the model to rate each idea on hook strength, specificity to the
product, audience fit, and originality relative to the rest of the batch.

**Scores are presented as a sort order only.** No numeric score is displayed as if
it were a measurement. The honest signal for quality comes from the user's own
keep and reject history, which feeds the avoidance context of later batches.

---

## 8. Internationalisation

- Interface strings live in `lib/i18n/tr.ts` and `lib/i18n/en.ts`. Turkish is the
  fallback.
- Prompt templates and platform rule cards exist as parallel files per language.
- Output language is a property of the brand profile, set independently of the
  interface language. A user can work in a Turkish interface and generate English
  content.
- Any prompt file missing a Turkish version is a build-time failure. Missing
  English versions fall back to Turkish with a console warning.

---

## 9. Error handling

| Case | Behaviour |
|---|---|
| Claude Code binary missing | Setup screen explains how to install it and offers the Gemini path |
| Claude Code not logged in | Instructs the user to run the login command, with a re-check button |
| Gemini key invalid | Rejected at setup with the provider's message shown |
| Provider timeout | Surfaced with a retry, batch size reduction suggested |
| Malformed JSON | One repair retry, then a visible error with raw output available |
| Partial batch failure | Valid items kept, discarded count reported |
| Workspace file corrupt | App refuses to overwrite, shows the parse error, offers to back up and reinitialise |
| Concurrent writes | Workspace writes are serialised through a single queue, written atomically via a temporary file and rename |

---

## 10. Testing

- **Schema tests.** Every output schema has fixtures for valid, invalid, and
  partially valid responses.
- **Provider adapters.** Tested against recorded responses. No live model calls in
  the test suite.
- **Prompt composition.** Snapshot tests asserting that the composed prompt
  contains the brand profile, the right platform card, and the avoidance context,
  in the expected order.
- **Workspace layer.** Tests for atomic writes, corrupt file handling, and
  migration of an older workspace version.
- **End-to-end.** One path through first run, batch, triage, expand, and schedule
  against a stubbed provider.

Live provider calls are exercised by a manual smoke script, not by continuous
integration.

---

## 11. Licensing and repository

**Name:** marketiyo

**License:** a custom source-available license with these terms:

- Free to use, download, and modify for personal and commercial use.
- Redistribution of modified versions is forbidden, except as contributions
  offered back to this project.
- Redistribution of unmodified copies requires visible credit and a link to the
  original repository.
- Contributor exception: forks and branches created for the purpose of submitting
  a pull request to this repository are permitted, as is publishing such a fork
  for that purpose.

**The README must describe the project as source-available, not open source.**
The no-derivatives restriction fails the open-source definition, and mislabelling
it invites entirely avoidable criticism.

A `CONTRIBUTING.md` states the contributor exception plainly, so that contributors
understand their fork is permitted.

---

## 12. Deferred, and how they plug in

**Trend research.** Becomes a seventh section in the prompt composition order, a
research context block. It requires a per-provider search capability, which the
two engines expose differently, so it needs its own adapter surface.

**Performance feedback.** Becomes an eighth block, built from imported post
metrics. It needs an importer per platform export format and a summariser that
distils which hooks and formats performed.

**Hosting.** Possible only for key-based engines, since the Claude Code adapter
requires a local binary. If pursued, keys must stay in the browser and calls must
go directly from the browser to the provider, because a hosted service holding
other people's keys is the main reason such projects are not trusted.

---

## 13. Open decisions for planning

None blocking. The implementation plan should sequence the work as:

1. Workspace layer and schemas.
2. Provider interface with both adapters and a stub adapter for tests.
3. Prompt library and composition, Turkish first.
4. First run and brand interview.
5. Idea batch and triage board.
6. Expansion.
7. Calendar.
8. License, README, and contributor documentation.
