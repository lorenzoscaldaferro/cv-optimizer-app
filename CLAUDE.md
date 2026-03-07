# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

No test framework is configured.

## Environment Setup

Create `.env.local` with:

```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash   # optional, defaults applied in code
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Python Dependency

`python3` must be available on PATH, with `python-docx` installed:

```bash
pip install python-docx
```

This is required for `.docx` CV generation via `scripts/generate_cv.py`.

## Architecture

### User Flow

```
/ (Landing) → /onboarding → /build
```

- `/` — Marketing landing page
- `/onboarding` — Collects user info (name, target role, job description, existing CV)
- `/build` — Chat interface with Gemini; AI rewrites CV section by section, then exports to `.docx`

### AI Tag Protocol

Gemini responses contain special tags that drive UI state transitions:

| Tag | Meaning |
|-----|---------|
| `<SECTION_COMPLETE>` | One CV section is done; advance progress tracker |
| `<CV_READY>` | All sections complete; show download button |

These tags are detected in `useStreamingChat.ts` after each streamed chunk.

### State Management

Zustand store at `src/store/cv-store.ts` holds:
- User onboarding data (name, role, job description, uploaded CV text)
- Completed CV sections (keyed by section name)
- Progress state

### Streaming

- API route: `src/app/api/chat/route.ts` — streams Gemini responses as SSE
- Client hook: `src/hooks/useStreamingChat.ts` — reads the SSE stream, accumulates text, detects tags

### System Prompt

- Source file: `scripts/SKILL.md` — the CV optimizer prompt (Markdown)
- Loader: `src/lib/skill-prompt.ts` — reads `SKILL.md` at runtime and returns it as a string
- Used by: `/api/chat` route, injected as the system prompt for each Gemini request

### Docx Generation

- API route: `src/app/api/generate-docx/route.ts` — receives completed CV sections as JSON
- Spawns: `scripts/generate_cv.py` via `child_process.spawn`
- Output: returns the `.docx` file as a binary response for download

## Key Files

```
src/
  app/
    page.tsx                        # Landing page
    layout.tsx                      # Root layout
    globals.css                     # Global styles + Tailwind
    onboarding/page.tsx             # Onboarding form
    build/page.tsx                  # Chat + CV build UI
    api/
      chat/route.ts                 # Gemini SSE streaming endpoint
      generate-docx/route.ts        # Python docx generation endpoint
  components/
    landing/                        # Landing page sections
    onboarding/                     # Onboarding form components
    chat/                           # Chat UI components
    progress/                       # Section progress tracker
    download/                       # Download button component
    ui/                             # Shared UI primitives (shadcn-style)
  hooks/
    useStreamingChat.ts             # SSE streaming + tag detection hook
  store/
    cv-store.ts                     # Zustand global state
  lib/
    skill-prompt.ts                 # Loads scripts/SKILL.md as system prompt
  types/                            # Shared TypeScript types

scripts/
  SKILL.md                          # AI system prompt (CV optimizer instructions)
  generate_cv.py                    # Python script: JSON sections → .docx file
```

## Important Patterns

- **Gemini model**: configured via `GEMINI_MODEL` env var; default applied in the API route if unset
- **SSE format**: `/api/chat` writes `data: <chunk>\n\n` lines; client splits on `data: ` prefix
- **Tag stripping**: `<SECTION_COMPLETE>` and `<CV_READY>` tags must be stripped from displayed text after detection
- **Python spawn**: `/api/generate-docx` pipes JSON to `stdin` of `generate_cv.py` and reads `.docx` bytes from `stdout`
- **No auth**: the app has no authentication layer; it is a single-session tool
