# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page web app for practicing the German citizenship test (Einbürgerungstest) using the 300 official BAMF questions. It is a **static site** — no build step, no package manager, no tests, no framework. Everything lives in `index.html` (~1350 lines: inline `<style>`, the question data, and vanilla-JS app logic). The only external dependency is the Supabase JS client loaded from a CDN.

## Running & deploying

- **Run locally**: open `index.html` in a browser, or serve the directory (`python3 -m http.server`) so the Supabase CDN script and auth redirects behave.
- **Deploy**: GitHub Pages serves `index.html` at the domain in `CNAME` (`germancitizenship.cristianserrano.ar`). Pushing to `main` deploys. There is no CI/build.

## Architecture

Everything is global-scope vanilla JS driven by a single mutable `state` object and a manual re-render. There is no virtual DOM and no reactivity — **any state change must be followed by a `render()` call** (or a targeted DOM update, as the sync badge does).

- **Render loop**: `render()` reads `state.screen` (`home` | `quiz` | `result`) and swaps `#app`'s innerHTML via `renderHome()` / `renderQuiz()` / `renderResult()`. UI is built as HTML strings with `onclick="..."` calling global functions; user-supplied text (profile names) must go through `h()` for escaping.
- **Questions**: `Q` is the array of 300 objects `{id, cat, q, o:[...], a}` where `a` is the 0-based index of the correct option. Categories (`cat`): `Demokratie`, `Wahlen`, `Staat`, `Politik`, `Geschichte`, `Europa`, `Gesellschaft`.
- **Translations**: `TRANS` maps `id → {qt, ot}` (English question text + option texts), populated from a compact `[id, "text", [opts]]` array. The DE/EN toggle sets `showTrans`. When adding/editing a question, keep `Q` and `TRANS` in sync by `id`.
- **Quiz modes** (`startQuiz(cat, mode)`): practice modes give feedback after every question and have no pass/fail: `normal` (33 random Q), `infinite` (all Q shuffled, wrong answers requeued via `state.rem`), and the `weak` category (questions the current profile answers correctly <66% of the time).
- **Simulation** (`sim`) runs under test conditions and is rendered by `renderSim()`, set apart on the start screen by `renderExam()`. It uses 30 general + 3 Landesfragen and a 60-min timer (`tick()`/`timerInterval`). It shows no feedback and no tutor. Picks go into `state.answers[]` and can be changed, and you can jump between questions with `simGo()`. `submitSim()` (also called on timeout) scores the round, records mastery and builds `state.results`. Pass = ≥17 correct.

## Data & persistence

- **Local first**: all user data lives in `localStorage` under key `ebt_profiles_v1` (`pdata = {profiles:{}, current}`). Each profile holds `{name, created, mastery, attempts}`. `mastery` maps `id → {s:seen, c:correct}`; a question counts as "mastered" at `c/s >= 0.66`. `loadProfiles()` migrates the legacy single-profile `ebt_mastery_v1` key on first run. Guests work fully offline.
- **Optional cloud sync (Supabase)**: `SB_URL`/`SB_KEY` (publishable anon key — safe to be in the client) connect to a `progress` table keyed by `user_id` holding the whole `pdata` blob. Email/password auth. On login, `pullData()` adopts server data as source of truth if present, else pushes local data up. Saves are debounced through `scheduleSync()` → `pushData()`. All Supabase paths no-op gracefully when the client is unavailable or the user is a guest — **preserve that offline fallback** when editing sync code.

## Tutor (AI assistant)

- A reactive chat panel (`#tutor`, the `tutor*` functions in `index.html`): it never speaks first, and it is hidden and blocked (also server-side) during the `sim` exam. Streaming and markdown rendering come from `guide-ai.js`, copied unchanged from the cristianserrano.ar portfolio guide; keep the two in step.
- Backend: `worker/`, a separate Cloudflare Worker (`POST /api/ask`, Workers AI free plan, `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, 5 req/min per IP, CORS for the site's origin and localhost). The site stays on GitHub Pages and calls it at `germancitizenship-api.cristianserrano.ar` (`TUTOR_API`).
- The browser sends only ids and numbers (`tutorContext()`); the Worker looks up the question text, translation and official answer in `worker/questions.json`, which `worker/extract-questions.mjs` generates from `index.html` on every dev run and deploy. Editing questions in `index.html` therefore needs a Worker redeploy to reach the tutor.
- Local: `cd worker && npm install && npm run dev` (mock answers, no login; `npm run dev:ai` uses the real model and needs `npx wrangler login`; restart either after editing `worker/index.js`) plus `python3 -m http.server`; on localhost the page calls `http://localhost:8787`. Deploy: `npm run deploy` (after `npx wrangler login`).
- `sw.js` precaches `guide-ai.js`: bump `CACHE` when it changes.
- **Current politics**: the model's knowledge ends in 2023. `CURRENT` in `index.html` (next to the questions) holds dated facts, the time-sensitive question ids (72, 73, 213, 236) and two patterns. Questions about polls, predictions or news (`block`) are refused in the browser and the Worker, so they never reach the model. Questions about who holds office or the current line-up (`asks`), and "Erklären" on a time-sensitive question, get the facts in the prompt and a dated note under the answer. Keep it current with the `/check-catalogue` skill (`.claude/skills/check-catalogue/`), which also checks bamf.de for a newer catalogue. Official answers are never changed from the news: in the test, BAMF's answer counts.

## What's new

`NEWS` in `index.html` shows a modal once per release to returning users (any saved progress), on the start screen only. To announce a release, change `NEWS.v` and its items (DE/EN). The seen version is stored in `localStorage` (`ebt_news_seen`). Keep it to two items or fewer.

## Conventions

- ES5-style vanilla JS (`var`, `function`) throughout — match it; there is no transpilation.
- UI copy is German; the app is for German-test prep. Keep German as the primary language and mirror any new user-facing strings in the DE/EN translation path where applicable.
