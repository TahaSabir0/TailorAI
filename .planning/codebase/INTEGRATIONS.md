# External Integrations

**Analysis Date:** 2026-02-05

## APIs & External Services

**AI/ML Services:**
- Google Gemini API (gemini-2.0-flash) - AI-powered content generation
  - SDK/Client: Custom fetch-based integration in `utils/gemini.js`
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
  - Auth: User-provided API key stored in `chrome.storage.local.openaiApiKey` (historical name)
  - Usage:
    1. CV structured metadata extraction (temperature: 0.1 for consistency)
    2. Cover letter generation (temperature: 0.7 for creativity)
  - Rate Limits: 15 RPM on free tier - handled with exponential backoff retry logic (3 attempts: 2s, 4s, 8s)

**Job Board Integration:**
- Handshake (joinhandshake.com) - Job posting data extraction
  - Implementation: DOM scraping via content script in `content/content.js`
  - GraphQL API: `https://app.joinhandshake.com/hs/graphql` for employer address fetching
  - Auth: Uses user's existing Handshake session (cookies/credentials)
  - CSRF Token: Extracted from `<meta name="csrf-token">` tag for GraphQL requests
  - Query: `getEmployerBrand` to fetch employer location data

## Data Storage

**Databases:**
- None - No external database services

**Browser Storage:**
- Chrome Storage API (chrome.storage.local) - Local persistent data storage
  - Implementation: Native Chrome Extension Storage API
  - Schema: Stored as JSON object
  - Keys:
    - `cvText` - Raw CV text content
    - `cvMetadata` - Structured CV data (name, email, phone, links)
    - `openaiApiKey` - Gemini API key (historical name)
    - `htmlTemplate` - Partially-populated HTML template with CV data
    - `currentJobData` - Temporary job posting data
    - `currentCoverLetter` - Temporary generated cover letter text

**File Storage:**
- Local filesystem only - PDF files downloaded directly to user's machine
  - Location: User's default downloads folder
  - Naming convention: `Cover_Letter_{company}_{jobTitle}.pdf`

**Caching:**
- None - Data persists in chrome.storage.local

## Authentication & Identity

**Auth Provider:**
- Custom - User manually provides Gemini API key
  - Implementation: Manual input in extension popup settings panel
  - Storage: `chrome.storage.local.openaiApiKey`
  - Validation: API key format validated in `utils/gemini.js` (must start with "AIza")
  - No OAuth or third-party auth required

**Identity:**
- No user account system
- Extension operates as standalone client-side application

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service

**Logs:**
- Console logging only - Chrome DevTools console
  - Implementation: `console.log`, `console.error`, `console.warn` throughout codebase
  - Accessible via:
    - Popup: Right-click extension icon → "Inspect popup"
    - Background: `chrome://extensions/` → "Inspect views: background page"
    - Content Script: DevTools on any webpage (F12)

## CI/CD & Deployment

**Hosting:**
- None - Chrome Extension (client-side only)
  - Distribution: Manual installation via "Load unpacked" in Developer mode
  - No web server or hosting required

**CI Pipeline:**
- None - No automated CI/CD
  - Manual file editing and Chrome extension reloading for development
  - `.github/` directory exists but no workflows detected

## Environment Configuration

**Required env vars:**
- None traditional environment variables
- User-provided configuration via extension settings:
  - Gemini API key (entered manually in popup settings)
  - CV file (uploaded manually via popup settings)

**Secrets location:**
- `chrome.storage.local.openaiApiKey` - API key stored in browser's local extension storage
  - Accessible only within the extension context
  - Not committed to codebase

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints

**Outgoing:**
- None - No webhook calls
  - All API calls are direct HTTP requests initiated by user action

---

*Integration audit: 2026-02-05*
