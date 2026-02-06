# TailorAI Frontend Redesign

## What This Is

Complete redesign of TailorAI Chrome extension's popup interface, visual design, and user experience. The extension generates AI-powered cover letters from job postings using Google Gemini API, and the frontend needs professional polish, state-based UI, and better onboarding workflow.

## Core Value

Users feel confident and professional when using TailorAI for job applications. The UI must feel trustworthy, efficient, and polished - matching the high-stakes context of career advancement.

## Requirements

### Validated

- ✓ CV upload (PDF/DOCX) with text extraction — existing
- ✓ Gemini API key input and storage — existing
- ✓ Structured CV metadata extraction — existing
- ✓ Job posting scraping from Handshake — existing
- ✓ AI cover letter generation via Gemini API — existing
- ✓ Two-phase template system (CV + job data) — existing
- ✓ PDF generation and download — existing
- ✓ Chrome storage persistence — existing

### Active

- [ ] Implement state-based UI with three modes: onboarding, ready, settings
- [ ] Onboarding mode: Show only CV upload + API key inputs for first-time users
- [ ] Ready mode: Show only "Tailor" button for returning users with data
- [ ] Settings mode: Allow CV and API key updates via accessible options
- [ ] Redesign with clean, professional aesthetic (Linear meets modern job platform)
- [ ] Apply consistent color scheme: deep blue/charcoal primary, teal/blue accent, white/light gray background
- [ ] Replace emojis with professional SVG icons
- [ ] Improve visual hierarchy and whitespace
- [ ] Add smooth transitions between UI states
- [ ] Enhance onboarding flow with progress indicators
- [ ] Add micro-interactions (button hover states, loading animations)
- [ ] Design empty states for "cover letter ready" messaging
- [ ] Improve accessibility and keyboard navigation

### Out of Scope

- Backend logic refactoring (Gemini API, content scraping, PDF generation already work)
- Changing core feature set (CV upload, cover letter generation remain the same)
- Adding new features beyond UI/UX improvements
- Changing data model or storage structure
- Mobile-specific optimizations (extension is desktop-focused)
- Analytics or usage tracking

## Context

This is a brownfield project building on an existing, functional Chrome extension. The backend logic (CV extraction, Gemini API integration, job scraping, PDF generation) works correctly and should not be modified. The current UI was built for testing purposes with basic styling, emojis, and lacks polish. Users have expressed frustration with the AI-generated aesthetic and unclear onboarding flow.

The extension is used during job applications - a high-stakes, stressful moment. Users need the UI to feel professional, trustworthy, and efficient. Good design here directly impacts user confidence in the tool and their applications.

## Constraints

- **Technology**: Vanilla JavaScript, HTML, CSS — no framework migration allowed
- **Platform**: Chrome Extension Manifest V3 — must remain compatible
- **Build process**: No build step — direct file editing only
- **Storage**: Must use existing chrome.storage.local schema (cvMetadata, htmlTemplate, openaiApiKey)
- **Message passing**: Must maintain existing content script communication pattern
- **Icons**: Must use SVG icons inline or from chrome extension resources
- **Size**: Popup dimensions must remain reasonable for browser extension UI

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| State-based UI with three modes | Users only need what's relevant to their current stage in the workflow | — Pending |
| Clean, professional design direction | Job applications require trust and professionalism; "vibe coding" undermines credibility | — Pending |
| Remove emojis, use SVG icons | Emojis signal "not serious"; SVG icons are more professional and scalable | — Pending |
| Onboarding-first UX | First impression matters; users should know exactly what to do when they first open extension | — Pending |
| Keep backend unchanged | Existing functionality works well; focus effort on UI/UX where the gap exists | — Pending |

---
*Last updated: 2026-02-06 after initialization*
