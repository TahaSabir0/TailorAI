# Roadmap: TailorAI Frontend Redesign

## Overview

Transform TailorAI Chrome extension from a functional but basic testing UI to a polished, professional, state-based interface. The journey builds core UI state management and onboarding flow, establishes a trustworthy visual design system, and refines interactions with full accessibility and settings capabilities. This is a pure frontend redesign - all backend logic (CV extraction, Gemini API, job scraping, PDF generation) remains unchanged.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: UI State Foundation & Onboarding** - Implement state detection and guide first-time users through setup
- [ ] **Phase 2: Visual Design System** - Establish professional aesthetic with icons
- [ ] **Phase 3: Interactions, Accessibility & Settings** - Polish UX and complete settings mode

## Phase Details

### Phase 1: UI State Foundation & Onboarding
**Goal**: Extension intelligently detects user context and guides first-time users through complete setup
**Depends on**: Nothing (first phase)
**Requirements**: UIST-01, UIST-02, UIST-03, UIST-04, UIST-05, ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05, ONBD-06
**Success Criteria** (what must be TRUE):
  1. First-time user opens extension and sees only CV upload + API key inputs
  2. User can complete onboarding with clear progress feedback and instructions
  3. After successful setup, UI transitions smoothly to ready mode
  4. Returning user with stored data sees ready mode immediately
  5. User can access settings mode from ready mode and return
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Add state detection and three-mode HTML structure (onboarding, ready, settings)
- [ ] 01-02-PLAN.md — Implement onboarding logic with step tracking and mode-aware event handlers

### Phase 2: Visual Design System
**Goal**: Extension presents a professional, trustworthy aesthetic matching the high-stakes job application context
**Depends on**: Phase 1
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06, DSGN-07, DSGN-08, DSGN-09, ICONS-01, ICONS-02, ICONS-03, ICONS-04, ICONS-05, ICONS-06, ICONS-07
**Success Criteria** (what must be TRUE):
  1. All UI elements use deep blue/charcoal primary and teal/blue accent colors with white/light gray background
  2. Design has clear visual hierarchy with generous whitespace and modern sans-serif typography
  3. All icons are professional SVGs (no emojis) and scale properly at different sizes
  4. Icons for CV upload, API key, and settings are clear and meaningful
  5. Overall design feels professional and trustworthy (Linear meets modern job platform aesthetic)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Interactions, Accessibility & Settings
**Goal**: Extension provides smooth, accessible interactions and complete settings management
**Depends on**: Phase 2
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04, INTR-05, ACCS-01, ACCS-02, ACCS-03, ACCS-04, ACCS-05, SETT-01, SETT-02, SETT-03, SETT-04, SETT-05
**Success Criteria** (what must be TRUE):
  1. "Tailor" button has hover effect and loading states during cover letter generation
  2. Transitions between UI modes are smooth and animated with proper button feedback and form input focus states
  3. All interactive elements are keyboard navigable with proper ARIA labels and form input labels
  4. UI is usable with screen reader and meets WCAG AA color contrast standards
  5. User can update CV and API key in settings mode and return to ready mode with storage updates persisted
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. UI State Foundation & Onboarding | 0/0 | Not started | - |
| 2. Visual Design System | 0/0 | Not started | - |
| 3. Interactions, Accessibility & Settings | 0/0 | Not started | - |

---
*Created: 2026-02-06*
