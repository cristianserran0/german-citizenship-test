# Design Tokens — Einbürgerungstest

The design system behind the German citizenship-test app. Extracted from the `:root` block and recurring style patterns in `index.html`. Paste this into Claude Design (or hand it to any design tool) as context so mockups come out on-brand.

**Vibe:** an official, printed-document feel — warm paper background, serif body type, a black/red/gold German-flag motif, thin rules, minimal radii. Restrained and institutional, not playful.

## Color

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#1a1a1a` | Primary text, primary buttons, dark accents |
| `--paper` | `#f4f1e8` | Page background (warm off-white) |
| `--paper-2` | `#eae5d6` | Secondary surface / track backgrounds |
| `--charcoal` | `#2b2b2b` | Simulation-mode accents |
| `--gold` | `#c8a94e` | Flag accent, active toggles |
| `--gold-deep` | `#9a7d2e` | Gold text / category tags (readable on paper) |
| `--red` | `#b5231f` | Flag accent, primary CTA hover, wrong answers, emphasis borders |
| `--green` | `#2f6b3f` | Correct answers, pass states |
| `--muted` | `#6b6456` | Secondary text, labels |
| `--muted-2` | `#8a8375` | Tertiary text, captions |

**Tints / lines (derived):**
- `--green-bg` `rgba(47,107,63,.1)` — correct-answer fill
- `--red-bg` `rgba(181,35,31,.08)` — wrong-answer fill / weak badge
- `--line` `rgba(26,26,26,.14)` — hairline borders
- `--line-strong` `rgba(26,26,26,.28)` — interactive/input borders

**Flag bar motif:** three vertical bars `#111` (black) / `--red` / `--gold`, 64×8px, 1px radius — appears in the header.

## Typography

- **Serif (body/headings):** `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` — questions, answers, headlines. Weights 400–700.
- **Sans (labels/UI):** `"Helvetica Neue", Arial, sans-serif` — eyebrows, tags, buttons, stat labels, captions, all English translations.

**Type roles:**
| Role | Family | Size | Notes |
|------|--------|------|-------|
| H1 | serif | `clamp(1.7rem, 5vw, 2.3rem)` | weight 600, letter-spacing `-.01em` |
| Big score | serif | `clamp(3.5rem, 14vw, 5rem)` | weight 700, letter-spacing `-.03em` |
| Question text | serif | `1.15rem` | weight 500, line-height 1.5 |
| Answer option | serif | `.98rem` | line-height 1.45 |
| Eyebrow / section label | sans | `.62rem` | weight 600, `text-transform:uppercase`, letter-spacing `.22em–.32em` |
| Subtitle | sans | `.68rem` | uppercase, letter-spacing `.18em` |
| Button | sans | `.82rem` | weight 600, uppercase, letter-spacing `.04em` |
| Stat number | serif | `1.5rem` | weight 700 |
| Caption / EN translation | sans | `.76–.85rem` | color `--muted` / `--muted-2` |

Convention: **uppercase + wide letter-spacing sans-serif** for every label/eyebrow; serif for anything readable/content.

## Layout & shape

- **Container:** `max-width: 640px`, centered, padding `2.5rem 1.25rem 4rem`. Single-column, mobile-first.
- **Radius:** `3px` on nearly everything (cards, buttons, options); `2px` badges/progress bar; `999px` account pill; `50%` toggle thumb & numbered mode icons.
- **Borders:** 1px hairlines (`--line`); interactive elements use `--line-strong`. Emphasis via a `3px` colored **left border** (`--red` on question/result cards, `--red`/`green` on list items).
- **Surfaces:** cards are solid `#fff` on the `--paper` page; secondary panels use `rgba(255,255,255,.5)`.
- **Shadow:** almost none. Hover lift only: `0 4px 14px rgba(26,26,26,.08)`.
- **Background texture:** faint dot grid — `radial-gradient` dots, `22px` grid, opacity `.035`.
- **Transitions:** `.16s` for interactive hovers, `.2s` for toggles, `.4s ease` for progress fills.

## Component patterns

- **Card** (`.q-card`, `.result-card`, `.missed-item`): white, 1px `--line` border, 3px radius, often a 3px colored left border. Padding `1.5rem`–`2rem`.
- **Primary button** (`.act-btn`): solid `--ink` bg, `--paper` text, uppercase sans; **hover → `--red`**. Ghost variant: transparent with `--line-strong` border.
- **Mode button** (`.mode-btn`): white card, left circular index badge (numbered/`∞`/`★`), title (serif) + description (sans muted), right arrow that slides on hover. Variant accents: primary=`--red`, sim=`--charcoal`, infinite=`--gold-deep`, weak=`--red`.
- **Answer option** (`.opt`): white, letter prefix (A/B/C/D) in muted sans; hover shifts right 2px; states `.correct` → green tint+border, `.wrong` → red tint+border.
- **Feedback banner** (`.feedback`): tinted bg + matching 1px border, `.ok` green / `.fail` red.
- **Toggle** (DE/EN): 42×23px pill track, thumb slides; checked track = `--gold`, thumb turns white.
- **Progress bar**: 2px track (`--paper-2`), `--red` fill.
- **Badge / tag**: uppercase sans, wide tracking, small tinted pill (`.sim` charcoal, `.weak-badge` red).

## Notes for design work

- The app is **German-primary** with an optional English translation shown in muted sans beneath each string. Any new content component should leave room for a secondary translated line.
- Keep it restrained — this reads as an official study document, not a consumer game. Favor hairlines, whitespace, and the flag palette over gradients, big shadows, or bright colors outside the token set.
