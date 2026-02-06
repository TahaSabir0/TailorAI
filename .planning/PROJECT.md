# TailorAI Frontend Redesign

## What This Is

A complete visual and UX overhaul of the TailorAI Chrome extension popup interface. The extension generates AI-powered personalized cover letters from job postings, and this redesign transforms it from a testing prototype to a polished, professional tool.

## Core Value

Job seekers feel confident and professional when using the extension to apply for positions. The UI inspires trust and makes the cover letter generation process feel effortless.

## Requirements

### Validated

- ✓ CV upload with text extraction (PDF/DOCX) — existing
- ✓ CV metadata extraction via Gemini API — existing
- ✓ Job posting scraping from Handshake — existing
- ✓ Cover letter generation via Gemini API — existing
- ✓ PDF generation and download — existing
- ✓ API key configuration — existing
- ✓ chrome.storage.local persistence — existing

### Active

- [ ] Three-mode UI: Onboarding, Ready, Settings
- [ ] Clean, professional visual design (Linear/Notion-inspired)
- [ ] Smooth state transitions between UI modes
- [ ] Remove all emojis, replace with icons
- [ ] Modern color palette (deep blue/charcoal primary, teal accent)
- [ ] Progress indicators for onboarding flow
- [ ] "Tailor" button as hero element in Ready mode
- [ ] Settings access button for updating CV/API key
- [ ] Micro-interactions (hover states, loading animations)
- [ ] Improved empty state messaging
- [ ] Responsive layout within popup dimensions

### Out of Scope

- Backend logic changes — keeping existing CV extraction, Gemini integration, PDF generation
- New features (CV versioning, history, customization options) — defer to future milestone
- Multi-platform job board support — only Handshake for now
- Mobile optimization — Chrome extension popup only

## Context

Current UI was built as a testing prototype with intentional minimal design. User feedback indicates it looks "AI-generated" and lacks polish. Key issues:
- Bland colors, no visual hierarchy
- Emojis used as placeholders (unprofessional)
- No state-based UI — all options always visible regardless of user context
- Poor onboarding experience — new users see cluttered interface with unclear next steps
- Settings panel always visible, even when not needed

The extension works well functionally but the UX undermines user confidence during the high-stakes moment of job applications.

## Constraints

- **Architecture**: Existing popup/content/background structure must be maintained — only UI changes in `popup/` directory
- **Tech Stack**: Vanilla JavaScript, no framework additions (keep lightweight)
- **Browser APIs**: Must use chrome.storage.local for state persistence
- **Popup Size**: Chrome extension popup size constraints (typically 350-600px width, 400-800px height)
- **Loading Performance**: 2.5MB of existing libraries already load — must not add significant overhead
- **Manifest V3**: Must comply with Chrome Extension Manifest V3 requirements
- **Design System**: No external CSS frameworks — must build custom styles in `popup.css`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Clean/Professional design direction | Users handle career data during job applications — trust and professionalism are critical | — Pending |
| Three-mode UI (Onboarding/Ready/Settings) | Eliminates UI clutter, shows only what's relevant based on user state | — Pending |
| Linear/Notion-inspired aesthetic | Modern, minimal, creates sense of calm during stressful job search process | — Pending |
| Remove all emojis | Emojis feel amateurish and unprofessional for career tools | — Pending |
| Deep blue/charcoal primary colors | Evokes trust, professionalism, and confidence | — Pending |
| No framework addition | Extension is vanilla JS, keeps bundle size manageable | — Pending |

---
*Last updated: 2025-02-06 after initialization*
