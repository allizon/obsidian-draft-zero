# Plan: Draft Zero — Obsidian Plugin

## Context

draft-zero is a distraction-free sprint-writing web app. The goal is to reimagine it as an Obsidian plugin so that:

- Sprint sessions produce real vault notes (not ephemeral localStorage blobs)
- The core differentiators survive the port: **challenge modes** (no-delete, invisible ink) and the **idle pressure/annoyance system**
- Stats and streaks are computed from plugin-tracked sessions only (not the whole vault)
- Daily note integration is supported as an alternative to creating new files

The plugin lives in an `obsidian-plugin/` subfolder of this repo while the Next.js app stays intact; if the plugin proves out, the web app gets retired.

---

## Key Architecture Decision: Modal with `<textarea>`

The sprint experience lives inside a **full-screen `Modal`** (Obsidian's `Modal` class) containing a plain `<textarea>`. Rationale:

- Challenge modes need total control over keyboard events and CSS rendering
- `keydown` on a textarea reliably blocks backspace/delete for no-delete mode
- `color: transparent` on the textarea is the cleanest invisible-ink implementation
- A textarea in a modal avoids embedding CodeMirror in a Modal (poorly supported by Obsidian's API)
- Consistent with draft-zero's current behavior: both challenge modes already disabled Markdown preview, so the user was typing into a plain textarea anyway

---

## File Structure

```
obsidian-plugin/
  src/
    main.ts            # Plugin class: registers command, ribbon, settings tab
    setup-modal.ts     # Goal + challenge config modal (step 1)
    sprint-modal.ts    # Full-screen sprint editor modal (step 2 — the core experience)
    state.ts           # Session state machine (port of useWritingSession reducer)
    storage.ts         # Plugin data wrapper (port of localStorage module)
    stats.ts           # Streak + heatmap computation (port of computeStats)
    vault.ts           # Vault file creation and daily note appending
    settings.ts        # PluginSettings interface + SettingsTab class
    challenges.ts      # Challenge mode definitions (direct port of lib/challenges.ts)
    date-utils.ts      # localDateKey, isSameLocalDay (direct port of lib/dateUtils.ts)
    styles.css         # Annoyance level overlays, modal layout, invisible ink
  manifest.json        # id: "draft-zero", minAppVersion: "1.4.0"
  package.json
  tsconfig.json
  esbuild.config.mjs
  versions.json
```

---

## Data Model

### PluginSettings (persisted via `plugin.saveData()` → `.obsidian/plugins/draft-zero/data.json`)

```typescript
interface PluginSettings {
  sprintFolder: string; // default: "Writing Sprints"
  saveDestination: "new-file" | "daily-note" | "ask";
  dailyNotePathTemplate: string; // e.g. "Daily Notes/{{date:YYYY-MM-DD}}"
  defaultGoalType: "time" | "words";
  defaultGoalValue: number;
  defaultChallengeConfig: ChallengeConfig;
  sessions: SprintSession[]; // all completed sessions (replaces SessionRecord[])
  inProgressText: string | null; // crash-recovery auto-save
  inProgressGoal: Goal | null;
}
```

### SprintSession (replaces SessionRecord — note: no `text` field)

```typescript
interface SprintSession {
  id: string;
  savedAt: number;
  wordCount: number;
  durationSeconds: number;
  goalType: "time" | "words";
  goalValue: number;
  completed: boolean;
  challengeConfig: ChallengeConfig;
  vaultPath: string | null; // path of vault file, for linking
}
```

Text lives in the vault file. The session record links to it via `vaultPath`.

---

## Session Lifecycle

1. User invokes **"Draft Zero: Start Sprint"** command (or ribbon icon)
2. **SetupModal** opens: goal type, goal value, challenge toggles, save destination (if setting is "ask")
3. SetupModal closes → **SprintModal** opens full-screen
4. Writing phase: textarea is focused, timer ticks, idle tracking + annoyance levels active, auto-save to `inProgressText` every 30s
5. Goal met → completion UI renders inside SprintModal (extend / freewrite / finish buttons)
6. On finish: save text to vault, append `SprintSession` to plugin data, clear `inProgressText`, close modal
7. On next plugin load: if `inProgressText` is set, offer recovery

---

## State Machine (`src/state.ts`)

Port of `useWritingSession`'s reducer as a plain TypeScript class. Same 9 actions, same logic — no React.

```typescript
type SessionAction =
  | { type: "START"; goal: Goal; text: string; config: ChallengeConfig }
  | { type: "TICK" }
  | { type: "TYPE"; text: string }
  | { type: "COMPLETE" }
  | { type: "EXTEND" }
  | { type: "FREEWRITE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "END" };

class SessionStateMachine {
  state: SessionState;
  onChange: (state: SessionState) => void; // SprintModal subscribes to re-render

  dispatch(action: SessionAction): void; // updates state, calls onChange
  startTimer(): void; // setInterval 1s → dispatch TICK
  stopTimer(): void;
}
```

Idle thresholds and `getAnnoyanceLevel()` ported directly from `hooks/useWritingSession.ts:97-104`.

---

## Challenge Modes

**No-delete** (`sprint-modal.ts`):

```typescript
textarea.addEventListener("keydown", (e) => {
  if (this.machine.state.status !== "running") return;
  if (!this.machine.state.challengeConfig.noDelete) return;
  if (["Backspace", "Delete"].includes(e.key)) e.preventDefault();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x")
    e.preventDefault();
});
```

**Invisible ink** (`styles.css` + `sprint-modal.ts`):

```css
.dz-invisible-ink {
  color: transparent !important;
  caret-color: var(--text-normal); /* cursor remains visible */
  text-shadow: none !important;
}
```

Toggle class on textarea when `challengeConfig.invisibleInk && status === "running"`. Remove on pause.

---

## Annoyance Levels (`styles.css`)

CSS classes on the modal container + `transition: background 2s`. Uses a semi-opaque overlay so Obsidian themes still show through:

```css
.dz-sprint-modal {
  --dz-tint: transparent;
}
.dz-sprint-modal.dz-annoyance-1 {
  --dz-tint: rgba(255, 220, 0, 0.12);
}
.dz-sprint-modal.dz-annoyance-2 {
  --dz-tint: rgba(255, 140, 0, 0.22);
}
.dz-sprint-modal.dz-annoyance-3 {
  --dz-tint: rgba(200, 40, 40, 0.28);
}
.dz-sprint-modal {
  background: color-mix(in srgb, var(--background-primary), var(--dz-tint));
}
```

Idle timer badge shown at level ≥ 1, styled with `--text-warning` / `--text-error` Obsidian variables.

---

## Vault Integration (`src/vault.ts`)

### New File Mode

Path: `{sprintFolder}/{YYYY-MM-DD}-sprint-{n}.md` (auto-increments `n` if file exists)

```markdown
---
tags:
  - draft-zero
date: 2026-05-20
goal: "10 minutes"
word-count: 347
duration: "6m 12s"
challenges:
  - no-delete
completed: true
---

{sprint text}
```

### Daily Note Mode

Appends a callout + text to the resolved daily note path:

```markdown
---

> [!note] Draft Zero Sprint — 10:32 AM
> Goal: 10 minutes · Words: 347 · no-delete

{sprint text}
```

Daily note path resolved from `dailyNotePathTemplate` (with `{{date:YYYY-MM-DD}}` substitution), falling back to reading the Daily Notes core plugin's configured path via `app.internalPlugins`.

---

## Stats (`src/stats.ts`)

Direct port of `lib/computeStats.ts` using `SprintSession[]` from plugin data.

Changes from web app:

- **No 90-day cap on heatmap** — return all sessions, grouped by `localDateKey`
- Streak algorithm identical; `localDateKey` format identical (`"YYYY-M-D"`, 0-based month — preserve the existing format exactly to avoid subtle bugs)
- Input is `SprintSession[]` (no `text` field needed for stats)

---

## Heatmap View

Register a workspace leaf type with `registerView()`. Accessible via:

- Ribbon icon (quill icon)
- Command "Draft Zero: Open Stats"

Renders:

- Current streak, longest streak, total words, total sessions
- SVG/HTML heatmap grid (all-time, one cell per day, 4 intensity levels)
- Heatmap cell tooltip on hover: date + word count

---

## Settings Tab (`src/settings.ts`)

| Setting                  | Control                                     | Default                           |
| ------------------------ | ------------------------------------------- | --------------------------------- |
| Sprint folder            | Text input                                  | `Writing Sprints`                 |
| Save destination         | Dropdown (new file / daily note / ask)      | `new-file`                        |
| Daily note path template | Text input (shown when daily note selected) | `Daily Notes/{{date:YYYY-MM-DD}}` |
| Default goal type        | Radio/toggle                                | `time`                            |
| Default goal value       | Number input                                | `600` (10 min)                    |

---

## Build Config

`package.json` dependencies:

- `obsidian` (latest)
- devDeps: `esbuild`, `typescript`, `@types/node`, `builtin-modules`

`esbuild.config.mjs`: bundle `src/main.ts` → `main.js`; externals = `["obsidian", "electron", "@codemirror/*", "@lezer/*", "@codemirror/state", "@codemirror/view"]`

`tsconfig.json`: target `ES6`, lib `["DOM", "ES6", "DOM.Iterable"]`, `moduleResolution: "node"`, strict mode on.

---

## Implementation Order

1. Scaffold: `manifest.json`, `package.json`, `tsconfig.json`, `esbuild.config.mjs`, empty `src/main.ts`
2. Port pure logic: `date-utils.ts`, `challenges.ts`, `state.ts`, `stats.ts` (no Obsidian deps — unit-testable)
3. `storage.ts` — plugin data wrapper
4. `vault.ts` — new file creation first; daily note append second
5. `settings.ts` — interface + settings tab
6. `setup-modal.ts` — goal + challenge config UI
7. `sprint-modal.ts` — the main sprint experience (textarea, timer, challenge modes, annoyance, completion state)
8. `styles.css` — annoyance overlays, invisible ink, modal layout
9. Main stats/heatmap view

---

## Verification

**Build:**

```bash
cd obsidian-plugin && npm install && npm run build
# Expect: main.js produced, no TypeScript errors
```

**Manual install in Obsidian:**

```
cp main.js manifest.json styles.css {vault}/.obsidian/plugins/draft-zero/
```

Enable in Obsidian Settings → Community Plugins.

**Test checklist:**

- [ ] "Start Sprint" command opens setup modal
- [ ] Goal completion triggers completion UI (both time and word-count goals)
- [ ] No-delete blocks backspace, delete, and Ctrl/Cmd+X while running; works normally while paused
- [ ] Invisible ink hides text while running, reveals on pause
- [ ] Annoyance level escalates at 10s/20s/30s idle; resets on typing or pause/resume
- [ ] Sprint file created in correct vault folder with correct frontmatter
- [ ] Daily note append adds callout + text at correct path
- [ ] Stats view shows correct streak, word totals, heatmap
- [ ] Crash recovery: close Obsidian mid-sprint, reopen → recovery offer appears

**Unit tests (Vitest):**

- `state.ts` — all 9 actions, idle level transitions
- `stats.ts` — streak across consecutive days, streak break, heatmap grouping
- `date-utils.ts` — localDateKey format, isSameLocalDay edge cases
