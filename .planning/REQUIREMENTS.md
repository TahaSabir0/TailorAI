# Requirements: TailorAI Frontend Redesign

**Defined:** 2026-02-06
**Core Value:** Users feel confident and professional when using TailorAI for job applications

## v1 Requirements

### UI State Management

- [ ] **UIST-01**: Extension detects first-time users and displays onboarding mode
- [ ] **UIST-02**: Extension detects returning users with data and displays ready mode
- [ ] **UIST-03**: User can access settings mode to update CV or API key
- [ ] **UIST-04**: UI state transitions smoothly between onboarding, ready, and settings modes
- [ ] **UIST-05**: Current mode is visually indicated to user (active state highlighting)

### Onboarding

- [ ] **ONBD-01**: Onboarding mode displays only CV upload input and API key text box
- [ ] **ONBD-02**: Onboarding includes progress indicator showing user's setup stage
- [ ] **ONBD-03**: Clear instructions guide user through CV upload process
- [ ] **ONBD-04**: Clear instructions guide user through API key entry process
- [ ] **ONBD-05**: Onboarding completes when both CV and API key are successfully stored
- [ ] **ONBD-06**: After successful onboarding, UI transitions to ready mode

### Visual Design

- [ ] **DSGN-01**: Color scheme uses deep blue/charcoal as primary color
- [ ] **DSGN-02**: Accent color is teal or soft blue
- [ ] **DSGN-03**: Background is white or light gray
- [ ] **DSGN-04**: UI has clear visual hierarchy with primary actions emphasized
- [ ] **DSGN-05**: Layout uses generous whitespace for readability
- [ ] **DSGN-06**: Design is clean and professional (Linear meets modern job platform aesthetic)
- [ ] **DSGN-07**: No emojis anywhere in UI
- [ ] **DSGN-08**: Typography uses modern sans-serif font
- [ ] **DSGN-09**: Popup dimensions remain reasonable for browser extension

### Icons

- [ ] **ICONS-01**: All emojis replaced with SVG icons
- [ ] **ICONS-02**: Icons are professional and relevant to function
- [ ] **ICONS-03**: Icons scale properly at different sizes
- [ ] **ICONS-04**: Icon for CV upload is clear and meaningful
- [ ] **ICONS-05**: Icon for API key is clear and meaningful
- [ ] **ICONS-06**: Icon for settings is clear and accessible
- [ ] **ICONS-07**: Icons are inline SVG or from extension resources

### Interactions

- [ ] **INTR-01**: Primary "Tailor" button has hover state effect
- [ ] **INTR-02**: Loading states show animation during cover letter generation
- [ ] **INTR-03**: Transitions between UI modes are smooth and animated
- [ ] **INTR-04**: Buttons provide visual feedback on click
- [ ] **INTR-05**: Form inputs provide focus states for accessibility

### Accessibility

- [ ] **ACCS-01**: All interactive elements are keyboard navigable
- [ ] **ACCS-02**: All buttons have proper ARIA labels
- [ ] **ACCS-03**: Form inputs have associated labels
- [ ] **ACCS-04**: UI is usable with screen reader
- [ ] **ACCS-05**: Color contrast meets WCAG AA standards

### Settings

- [ ] **SETT-01**: User can update CV in settings mode
- [ ] **SETT-02**: User can update API key in settings mode
- [ ] **SETT-03**: Settings mode is accessible from ready mode
- [ ] **SETT-04**: Changes in settings mode update chrome.storage.local
- [ ] **SETT-05**: User can return to ready mode from settings

## v2 Requirements

(None yet - ship to validate)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend logic refactoring | Existing functionality works well; focus effort on UI/UX |
| Changing core feature set | CV upload and cover letter generation remain same |
| Adding new features beyond UI improvements | Project scope is frontend redesign only |
| Data model or storage changes | Must use existing chrome.storage.local schema |
| Mobile-specific optimizations | Extension is desktop-focused |
| Analytics or usage tracking | Not part of frontend redesign |
| Framework migration | Constraint: Vanilla JavaScript only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UIST-01 | Phase 1 | Pending |
| UIST-02 | Phase 1 | Pending |
| UIST-03 | Phase 1 | Pending |
| UIST-04 | Phase 1 | Pending |
| UIST-05 | Phase 1 | Pending |
| ONBD-01 | Phase 1 | Pending |
| ONBD-02 | Phase 1 | Pending |
| ONBD-03 | Phase 1 | Pending |
| ONBD-04 | Phase 1 | Pending |
| ONBD-05 | Phase 1 | Pending |
| ONBD-06 | Phase 1 | Pending |
| DSGN-01 | Phase 2 | Pending |
| DSGN-02 | Phase 2 | Pending |
| DSGN-03 | Phase 2 | Pending |
| DSGN-04 | Phase 2 | Pending |
| DSGN-05 | Phase 2 | Pending |
| DSGN-06 | Phase 2 | Pending |
| DSGN-07 | Phase 2 | Pending |
| DSGN-08 | Phase 2 | Pending |
| DSGN-09 | Phase 2 | Pending |
| ICONS-01 | Phase 2 | Pending |
| ICONS-02 | Phase 2 | Pending |
| ICONS-03 | Phase 2 | Pending |
| ICONS-04 | Phase 2 | Pending |
| ICONS-05 | Phase 2 | Pending |
| ICONS-06 | Phase 2 | Pending |
| ICONS-07 | Phase 2 | Pending |
| INTR-01 | Phase 3 | Pending |
| INTR-02 | Phase 3 | Pending |
| INTR-03 | Phase 3 | Pending |
| INTR-04 | Phase 3 | Pending |
| INTR-05 | Phase 3 | Pending |
| ACCS-01 | Phase 3 | Pending |
| ACCS-02 | Phase 3 | Pending |
| ACCS-03 | Phase 3 | Pending |
| ACCS-04 | Phase 3 | Pending |
| ACCS-05 | Phase 3 | Pending |
| SETT-01 | Phase 3 | Pending |
| SETT-02 | Phase 3 | Pending |
| SETT-03 | Phase 3 | Pending |
| SETT-04 | Phase 3 | Pending |
| SETT-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Last updated: 2026-02-06 after roadmap creation*

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after initial definition*
