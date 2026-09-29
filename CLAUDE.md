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
- **Quiz modes** (`startQuiz(cat, mode)`): `normal` (33 random Q), `sim` (33 Q + 60-min timer via `tick()`/`timerInterval`, pass = ≥17 correct), `infinite` (all Q shuffled, wrong answers requeued via `state.rem`), and the `weak` category (questions the current profile answers correctly <66% of the time).

## Data & persistence

- **Local first**: all user data lives in `localStorage` under key `ebt_profiles_v1` (`pdata = {profiles:{}, current}`). Each profile holds `{name, created, mastery, attempts}`. `mastery` maps `id → {s:seen, c:correct}`; a question counts as "mastered" at `c/s >= 0.66`. `loadProfiles()` migrates the legacy single-profile `ebt_mastery_v1` key on first run. Guests work fully offline.
- **Optional cloud sync (Supabase)**: `SB_URL`/`SB_KEY` (publishable anon key — safe to be in the client) connect to a `progress` table keyed by `user_id` holding the whole `pdata` blob. Email/password auth. On login, `pullData()` adopts server data as source of truth if present, else pushes local data up. Saves are debounced through `scheduleSync()` → `pushData()`. All Supabase paths no-op gracefully when the client is unavailable or the user is a guest — **preserve that offline fallback** when editing sync code.

## Conventions

- ES5-style vanilla JS (`var`, `function`) throughout — match it; there is no transpilation.
- UI copy is German; the app is for German-test prep. Keep German as the primary language and mirror any new user-facing strings in the DE/EN translation path where applicable.
