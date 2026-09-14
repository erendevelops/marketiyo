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
- [Which setup is for you?](#which-setup-is-for-you)
- [Step-by-step setup (no technical background needed)](#step-by-step-setup-no-technical-background-needed)
- [Quick setup (for developers)](#quick-setup-for-developers)
- [Connecting Claude Code](#connecting-claude-code)
- [Connecting Gemini](#connecting-gemini)
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
  database. It opens in your browser like a website, but it lives on your own
  machine, not on the internet.
- With **Claude Code**, the app runs the `claude` command on your computer and
  uses the subscription you are logged in with there. No API key is involved,
  and the app never talks to Anthropic itself.
- With **Gemini**, the local server calls Google directly with your own key.
  The key is never sent to the browser.

## Which setup is for you?

| Your situation | Go to |
| --- | --- |
| Terminals, Git and Node.js are new to you | [Step-by-step setup](#step-by-step-setup-no-technical-background-needed) |
| You already use these tools | [Quick setup](#quick-setup-for-developers) |

On the AI side, **Gemini** is the easiest: a Google account is enough, it is
free and there is nothing extra to install. If you have a Claude Pro or Max
plan you can use **Claude Code** instead, which needs one more program.

## Step-by-step setup (no technical background needed)

This takes 15 to 20 minutes in total. Do each step in order and do not skip any.

### Before you start

**You will need**

- A computer running Windows 10, Windows 11 or macOS
- An internet connection and about 1 GB of free space
- A Google account (for Gemini) **or** a Claude Pro or Max plan

**What is a terminal?** A window, usually black or white, where you give the
computer typed commands. All you have to do in this guide is copy a command,
paste it into that window and press **Enter**.

- **To paste:** on Windows press **Ctrl+V** or right-click in the window. On macOS press **Cmd+V**.
- Always press **Enter** after a command.
- While a command runs, text scrolls past. Wait until the blinking cursor
  appears on a new line before typing the next one.
- Yellow or red `warn` messages are usually harmless. If you hit a real error,
  see [Troubleshooting](#troubleshooting).

### Step 1: Install Node.js

Node.js is the program that runs Marketiyo.

1. Go to <https://nodejs.org>.
2. Click the download button for the version marked **LTS**.
3. Open the downloaded file and finish the installer with the default
   settings. Clicking **Next** on every screen and **Install** at the end is
   enough.
4. When it is done, open a terminal and check:
   - **Windows:** type `PowerShell` in the Start menu and open it.
   - **macOS:** press **Cmd+Space**, type `Terminal` and press Enter.

   ```bash
   node -v
   ```

   If you see a version number such as `v22.12.0`, you are set. You can close
   this window.

### Step 2: Download Marketiyo

1. Go to <https://github.com/erendevelops/marketiyo>.
2. Click the green **Code** button and choose **Download ZIP**.
3. Find the downloaded `marketiyo-main.zip` file (usually in **Downloads**).
4. Unzip it:
   - **Windows:** right-click the file and choose **Extract All**.
   - **macOS:** double-click the file.
5. Move the resulting `marketiyo-main` folder somewhere easy to find, such as
   **Documents**. Do not delete this folder: the app and your data live in it.

### Step 3: Open a terminal inside the folder

Commands need to run inside the Marketiyo folder.

**Windows 11**

1. Open the `marketiyo-main` folder. You should see files such as
   `package.json` and `README.md`.
2. Right-click an empty spot in the folder and choose **Open in Terminal**.

**Windows 10**

1. Open the `marketiyo-main` folder.
2. Click the address bar at the top, delete what is there, type `powershell`
   and press Enter.

**macOS**

1. Open **Terminal**.
2. Type `cd ` (with a space at the end) and do **not** press Enter yet.
3. Drag the `marketiyo-main` folder from Finder into the Terminal window. Its
   path appears.
4. Press Enter.

To check you are in the right place, run this. You should see `package.json`
in the list:

```bash
ls
```

### Step 4: Download what the app needs

You only run this once, on first setup. It takes 1 to 5 minutes depending on
your connection:

```bash
npm install
```

On Windows, if you see a red error saying **"running scripts is disabled on
this system"**, type the command like this instead, and use `npm.cmd` in place
of `npm` from now on:

```bash
npm.cmd install
```

### Step 5: Start the app

```bash
npm run dev
```

After a few seconds you will see `Local: http://localhost:3000`. Open
<http://localhost:3000> in your browser and Marketiyo appears.

**Important:** the app runs only while this terminal window stays open. Close
the window and the app stops. Minimise it and leave it running while you work.

### Step 6: Connect the AI

Choose one of the two.

#### Option A: Gemini (easiest, free)

1. Go to <https://aistudio.google.com/apikey> and sign in with your Google account.
2. Read and accept the terms of use.
3. Click **Create API key**.
4. Click the copy icon next to the long key that appears.
5. In Marketiyo, open the **Setup** page and choose **Gemini, with your own API key**.
6. Paste the key into the **API key** box. Leave the recommended model selected.
7. Click **Save and test the connection**. When you see a green **Connected**
   message, you are done.

Do not share your key with anyone. A free key covers about 500 generations a day.

#### Option B: Your Claude subscription

If you have a Claude Pro or Max plan you can use it. It needs one more program.
Follow the steps in [Connecting Claude Code](#connecting-claude-code), then come
back here.

### Step 7: Create your brand profile

1. Once connected, click **Next step: brand profile**.
2. In the top box, describe your product in a few sentences: what it does, who
   it is for and why it is different.
3. Click **Draft it for me** and the fields fill in.
4. Fix anything wrong or missing and click **Save brand profile**.

Every section is now unlocked. The home page always shows your next step.

### Next time you use it

Setup happens once. Whenever you want to use Marketiyo:

1. Open a terminal in the `marketiyo-main` folder, as in
   [Step 3](#step-3-open-a-terminal-inside-the-folder).
2. Type `npm run dev` and press Enter.
3. Open <http://localhost:3000> in your browser.

**To stop**, press **Ctrl+C** in the terminal window or close the window. Your
data is kept.

## Quick setup (for developers)

Requirements: Node.js 20+, Git, and either Claude Code (Pro or Max) or a Gemini
API key.

```bash
git clone https://github.com/erendevelops/marketiyo.git
cd marketiyo
npm install
npm run dev
```

Open <http://localhost:3000>, choose an engine on the **Setup** page, then fill
in the brand profile. If port 3000 is taken: `npm run dev -- -p 3001`

## Connecting Claude Code

Claude Code is Anthropic's program that runs in the terminal. Marketiyo runs it
to generate content, using your subscription. The Claude desktop app is not a
substitute.

**1. Install Claude Code.**

**Windows:** first download **Git for Windows** from
<https://git-scm.com/downloads/win> and install it with the default settings;
Claude Code needs it. Then open PowerShell and run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux:** open Terminal and run:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Run it once and log in.** Type `claude` in the terminal. A page opens in
your browser; log in with your Pro or Max account. If the terminal asks a few
questions, the defaults are fine. You only log in once. Type `/exit` to leave.

```bash
claude
```

**3. Restart Marketiyo from a new terminal.** Skip this and Marketiyo cannot
find the `claude` command.

*Why?* Installing adds the location of `claude` to your system, but only
terminal windows opened **after** the install see that change.

1. Go to the terminal window where Marketiyo is running and stop it with
   **Ctrl+C**. The page in your browser loses its connection, which is expected.
2. Close **all** open terminal windows.
   - If you use the terminal inside an editor such as VS Code or Cursor,
     **quit the editor completely and reopen it**.
3. Open a new terminal in the Marketiyo folder, as in
   [Step 3](#step-3-open-a-terminal-inside-the-folder).
4. Check it. If it prints a version number, you are ready:

   ```bash
   claude --version
   ```

5. Start Marketiyo and reload the page in your browser:

   ```bash
   npm run dev
   ```

**4. Connect in Marketiyo.** On the **Setup** page, choose **Claude Code** and
click **Save and test the connection**. The test sends Claude a tiny request to
confirm you are really logged in. It takes 5 to 30 seconds and uses a very small
amount of your plan.

If `claude` is still not found, enter its full path in the **Claude command**
box. To find the path, in a new terminal run:

- Windows: `where claude`
- macOS / Linux: `which claude`

## Connecting Gemini

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. On the **Setup** page, choose **Gemini**, paste the key and pick a model.
3. Click **Save and test the connection**.

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

## Everyday use

1. Open a terminal in the Marketiyo folder and run `npm run dev`.
2. Open <http://localhost:3000>. The home page shows your next step.
3. **Ideas**: pick a media type, generate, keep the ones you like and reject
   the rest with a reason.
4. **Turn into content** on a kept idea, and edit the text if needed.
5. In **Calendar**, place the content on a day and mark it once posted.
6. When you are done, press **Ctrl+C** in the terminal.

## Updating

**If you downloaded the ZIP**

1. Stop Marketiyo (Ctrl+C in the terminal).
2. Download and unzip the new ZIP, as in [Step 2](#step-2-download-marketiyo).
3. Copy the `workspace` folder from the old folder into the new one. All your
   data is in it.
4. Open a terminal in the new folder and run `npm install`, then `npm run dev`.
5. Once everything is there, you can delete the old folder.

**If you used Git**

```bash
git pull
npm install
npm run dev
```

## Where your data lives

Everything is stored as plain files in the `workspace` folder inside the
Marketiyo folder. It is created on first use and Git ignores it. Set the
`MARKETIYO_WORKSPACE` environment variable to use a different folder.

| File | Contents |
| --- | --- |
| `settings.local.json` | Settings and your Gemini key |
| `brand.json` | Brand profile |
| `ideas.json`, `expansions/` | Ideas and generated content |
| `calendar.json` | Calendar |
| `campaigns.json`, `campaigns/` | Ad campaigns |
| `articles.json`, `articles/` | Blog topics and drafts |

**To back up**, copy the `workspace` folder somewhere else. **Reset everything**
on the **Setup** page deletes these files permanently.

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

**During setup**

| Message | Fix |
| --- | --- |
| `node` or `npm` is not recognised, "command not found" | Install Node.js as in [Step 1](#step-1-install-nodejs), then close the terminal and open a new one |
| "running scripts is disabled on this system" (Windows) | Type `npm.cmd` instead of `npm`: `npm.cmd install`, `npm.cmd run dev` |
| "Could not read package.json" or "ENOENT" | The terminal is in the wrong folder. Go back to [Step 3](#step-3-open-a-terminal-inside-the-folder) and check with `ls` until you see `package.json` |
| `npm install` takes very long or shows a "network" error | Check your internet connection and run the command again |
| Browser says "This site can't be reached" | Check that `npm run dev` is still running. If the window was closed, start it again |
| "Port 3000 is in use" | Marketiyo may already be open in another window; use that, or start with `npm run dev -- -p 3001` and open <http://localhost:3001> |
| Page looks unstyled or broken | Press Ctrl+C in the terminal and start again with `npm run dev` |

**While connecting**

| Message | Fix |
| --- | --- |
| Claude Code is not installed or cannot be seen | [Restart from a new terminal](#connecting-claude-code); if that fails, enter the full path in **Claude command** |
| Claude Code is installed but not logged in | Run `claude` in a terminal, log in, test again |
| Claude was found but did not respond | Run `claude` in a terminal to finish its first-run questions, and check your internet connection |
| API key rejected | Copy the key again from AI Studio, with no spaces before or after it |
| Quota used up | For the per-minute limit, wait a moment; for the daily one, try tomorrow or switch to a Flash Lite model |
| Model not found | Pick a model from the list in Setup |

## Development

```bash
npm test          # tests
npm run typecheck # type check
npm run verify    # tests, type check and a production build
```

`npm run verify` builds into a separate folder, so it does not break a running
dev server. Contribution guidelines: [CONTRIBUTING.md](CONTRIBUTING.md).
