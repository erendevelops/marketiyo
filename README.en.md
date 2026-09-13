# Marketiyo

A marketing content tool for your product that runs on your own computer.

[Türkçe](README.md) · **English**

> **This is source-available, not open source.** You may read, run and modify
> the code for your own use. Redistributing modified copies is not allowed,
> except as forks prepared for contribution back to this project. See
> [LICENSE](LICENSE).

## Contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Requirements](#requirements)
- [Installation](#installation)
  - [1. Download and start the app](#1-download-and-start-the-app)
  - [2a. Connect with Claude Code](#2a-connect-with-claude-code)
  - [2b. Connect with Gemini](#2b-connect-with-gemini)
  - [3. Create your brand profile](#3-create-your-brand-profile)
- [Everyday use](#everyday-use)
- [Updating](#updating)
- [Where your data lives](#where-your-data-lives)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## What it does

| Section | What it is for |
| --- | --- |
| **Brand** | Keeps your product, audiences, voice and proof in one place. Everything generated rests on it. It can draft itself from a few sentences. |
| **Ideas** | Generates content ideas aimed at people who have never heard of your product. What you keep, and what you reject with a reason, changes the next batch. |
| **Content** | Turns a kept idea into something ready to publish. For short video: hook, script, on-screen text and shooting notes. |
| **Calendar** | You place ready content on days. Nothing is posted automatically; you mark posts as done yourself. |
| **Ads** | Campaign plans, ad sets and copy for Meta, Google Search and TikTok. You set the budget; the model only splits it. |
| **Blog** | Topic suggestions by search intent and full article drafts. |

Media types: short video, visual post, short text, long text. Interface and
content in Turkish or English. Dark and light themes.

## How it works

```
Browser  ->  Local server (npm run dev)  ->  claude command  or  Gemini API
                     |
                     v
              workspace/ folder (plain files)
```

- The app runs only on your computer. There are no accounts, no cloud and no
  database.
- With **Claude Code**, the app runs the `claude` command on your computer and
  uses the subscription you are logged in with there. No API key is involved,
  and the app never talks to Anthropic itself.
- With **Gemini**, the local server calls Google directly with your own key.
  The key is never sent to the browser.

## Requirements

- **Node.js 20 or newer.** Install the LTS version from
  [nodejs.org](https://nodejs.org). Check with `node -v`.
- **Git** from [git-scm.com](https://git-scm.com), or download the repository as
  a zip.
- A model to write the content, one of:
  - **Claude Code** with a Claude **Pro or Max** plan
  - A **Gemini API key**, free from [Google AI Studio](https://aistudio.google.com/apikey)

## Installation

### 1. Download and start the app

Open a terminal (PowerShell on Windows, Terminal on macOS) and run:

```bash
git clone https://github.com/erendevelops/marketiyo.git
cd marketiyo
npm install
npm run dev
```

When the terminal shows `Local: http://localhost:3000`, open
<http://localhost:3000> in your browser. The app runs for as long as this
terminal stays open. Press **Ctrl+C** in it to stop.

If port 3000 is taken: `npm run dev -- -p 3001`

### 2a. Connect with Claude Code

**1. Install Claude Code.**

Windows (PowerShell):

```powershell
irm https://claude.ai/install.ps1 | iex
```

macOS / Linux:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Run it once and log in.** Type `claude` in a terminal and log in with your
Pro or Max account in the browser page it opens. You only do this once. Type
`/exit` to leave.

```bash
claude
```

**3. Restart the app from a new terminal.** Skip this and the app cannot find
the `claude` command.

*Why?* Installing adds the location of `claude` to your system's search path
(PATH). Only terminals opened **after** the install see that change. If the app
is running in a terminal that was open before, it cannot see `claude`.

How to do it:

1. Go to the terminal where the app is running and stop it with **Ctrl+C**. The
   page in your browser loses its connection, which is expected.
2. Close that terminal and open a **new one**.
   - If you use the terminal inside an editor such as VS Code or Cursor,
     **quit the editor completely and reopen it**. Its terminals keep the old
     settings otherwise.
3. In the new terminal, run `claude --version`. If it prints a version number,
   you are ready.
4. Go to the project folder, using wherever you downloaded it. Put the path in
   quotes if it contains spaces:

   ```bash
   cd "/Users/you/Projects/marketiyo"
   ```

   The Setup page shows this command with your actual folder path.
5. Start the app:

   ```bash
   npm run dev
   ```

6. Reload the page in your browser.

**4. Connect in the app.** On the **Setup** page, choose **Claude Code** and
press **Save and test the connection**. The test sends Claude a tiny request to
confirm you are really logged in. It takes 5 to 30 seconds and uses a very small
amount of your plan.

If `claude` is still not found, enter its full path in the **Claude command**
field. This prints it:

- Windows: `where claude`
- macOS / Linux: `which claude`

You do not need the Claude desktop app, only Claude Code.

### 2b. Connect with Gemini

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. On the **Setup** page, choose **Gemini**, paste the key and pick a model.
3. Press **Save and test the connection**.

Models and free limits (September 2026):

| Model | Free requests per day | Note |
| --- | --- | --- |
| `gemini-3.1-flash-lite` | ~500 | Default, recommended |
| `gemini-3.5-flash-lite` | ~500 | Newer generation |
| `gemini-3.5-flash` | ~20 | Stronger, very low limit |
| `gemini-2.5-flash` | ~20 | |

Each generation uses one request. If the model answers in the wrong shape it
tries once more, so two at most. Your current limits are shown in
[AI Studio](https://aistudio.google.com/rate-limit).

### 3. Create your brand profile

Once connected, the **Brand** page opens. Describe your product in a few
sentences and press **Draft it for me** to fill in the fields, then correct
them. Saving unlocks the rest of the app. The other sections stay locked until
both steps are done.

## Everyday use

1. In a terminal, go to the project folder and run `npm run dev`.
2. Open <http://localhost:3000>. The home page shows your next step.
3. **Ideas**: pick a media type, generate, keep the ones you like and reject
   the rest with a reason.
4. **Turn into content** on a kept idea, and edit the text if needed.
5. In **Calendar**, place the content on a day and mark it once posted.
6. When you are done, press **Ctrl+C** in the terminal.

## Updating

```bash
git pull
npm install
npm run dev
```

Your data lives in `workspace/` and is not touched by updates.

## Where your data lives

Everything is stored as plain files in the `workspace/` folder inside the
project, which Git ignores. Set the `MARKETIYO_WORKSPACE` environment variable
to use a different folder.

| File | Contents |
| --- | --- |
| `settings.local.json` | Settings and your Gemini key |
| `brand.json` | Brand profile |
| `ideas.json`, `expansions/` | Ideas and generated content |
| `calendar.json` | Calendar |
| `campaigns.json`, `campaigns/` | Ad campaigns |
| `articles.json`, `articles/` | Blog topics and drafts |

To back up, copy this folder. **Reset everything** on the **Setup** page deletes
these files permanently.

## Security

- Your Gemini key is stored only in `settings.local.json` and is only ever sent
  to Google. It never reaches the browser.
- The app has no login, because it only serves the person at this computer. For
  that reason the API refuses requests coming from other websites, so another
  page open in your browser cannot generate content or spend your quota.
- It only accepts `localhost` and IP addresses. To reach it by a host name on
  your local network, add the name to the `MARKETIYO_ALLOWED_HOSTS` environment
  variable, comma separated.
- Do not run it on a server exposed to the internet. It is not designed for
  that.

## Troubleshooting

| Message | Fix |
| --- | --- |
| Claude Code is not installed or cannot be seen | [Restart from a new terminal](#2a-connect-with-claude-code); if that fails, enter the full path in **Claude command** |
| Claude Code is installed but not logged in | Run `claude` in a terminal, log in, test again |
| Claude was found but did not respond | Run `claude` in a terminal to finish its first-run questions, and check your internet connection |
| API key rejected | Copy the key again from AI Studio |
| Quota used up | For the per-minute limit, wait a moment; for the daily one, try tomorrow or switch to a Flash Lite model |
| Model not found | Pick a model from the list in Setup |
| `npm` is not recognised | Install Node.js and open a new terminal |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Page looks unstyled or broken | Press Ctrl+C in the terminal and start again with `npm run dev` |

## Development

```bash
npm test          # tests
npm run typecheck # type check
npm run verify    # tests, type check and a production build
```

`npm run verify` builds into a separate folder, so it does not break a running
dev server. Contribution guidelines: [CONTRIBUTING.md](CONTRIBUTING.md).
