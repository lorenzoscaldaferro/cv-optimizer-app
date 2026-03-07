# Changelog

## [Unreleased]

### Fixed

#### Chat invisible on desktop without DevTools open
**Root cause:** `SectionTracker` renders two internal variants — a desktop sidebar (`hidden lg:flex h-full`) and a mobile bar (`lg:hidden`). In `build/page.tsx`, the right panel called `<SectionTracker />` unconditionally. On desktop (≥ lg breakpoint), this activated the `h-full` desktop sidebar variant inside a flex-column container, consuming all available height and collapsing the `flex-1` chat div to 0px. The chat existed in the DOM but was invisible.

Opening DevTools narrowed the viewport below the `lg` breakpoint, switching `SectionTracker` to its compact mobile variant — which revealed the chat. This made it appear as if DevTools "fixed" the problem, when it was a layout bug all along.

**Fix:** Wrapped the `<SectionTracker />` call inside the right panel with `<div className="lg:hidden">` so it only renders on mobile. The left `<aside>` already renders the desktop variant for screens ≥ lg.

**File:** `src/app/build/page.tsx`

---

#### Session state loss on Fast Refresh (Zustand persist)
**Root cause:** The Zustand store had no persistence. Any HMR / Fast Refresh event reset all state to `initialState` (`sessionMode: null`, `messages: []`), causing the build page to flash blank and the chat to lose its history.

**Fix:** Wrapped the store with Zustand `persist` middleware using `sessionStorage` (single-tab, cleared on tab close). Only meaningful state is persisted — `sessionMode`, `parsedCVText`, `uploadedFilename`, `messages`, `sections`, `cvData`. Ephemeral state (`isStreaming`, `streamingContent`, `isGenerating`, `downloadUrl`, `showModal`) is excluded and always resets.

**File:** `src/store/cv-store.ts`

---

#### Hydration race condition on build page redirect
**Root cause:** After adding `persist`, the store hydrates from `sessionStorage` asynchronously. On Fast Refresh, `build/page.tsx` would check `sessionMode` before hydration finished, see `null`, and render blank.

**Fix:** Added a `hydrated` state in `BuildPage` that waits for `useCVStore.persist.hasHydrated()` / `onFinishHydration` before evaluating `sessionMode`. The redirect to `/onboarding` only fires after hydration is confirmed.

**File:** `src/app/build/page.tsx`

---

#### Redundant `useSectionProgress` hook removed
**Root cause:** `useSectionProgress` scanned `messages` for `<SECTION_COMPLETE>` tags on every render, but those tags are stripped before messages are committed to the store (in `useStreamingChat.processAndCommit`). The hook was a no-op causing unnecessary re-renders.

**Fix:** Removed the hook call and import from `ChatInterface`. Section progress is correctly tracked by the direct `markSectionComplete()` calls in `useStreamingChat`.

**Files:** `src/components/chat/ChatInterface.tsx`, `src/hooks/useSectionProgress.ts`
