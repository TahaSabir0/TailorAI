# Architecture

**Analysis Date:** 2026-02-05

## Pattern Overview

**Overall:** Event-driven Chrome Extension (Manifest V3) with message-based inter-component communication

**Key Characteristics:**
- Popup as primary orchestrator - controls all workflows
- Content script for web page DOM scraping
- chrome.storage.local as centralized persistence layer
- Global utility functions (no ES modules - loaded via script tags)
- Two-phase template population separating persistent CV data from job-specific data
- Third-party libraries via web_accessible_resources and script tags

## Layers

**Presentation Layer:**
- Purpose: User interface and interaction management
- Location: `popup/`
- Contains: `popup.html` (UI markup), `popup.js` (event handling, workflow orchestration), `popup.css` (styling)
- Depends on: `utils/` modules, `libs/` libraries, `chrome.storage.local`
- Used by: Browser extension popup (user-initiated)

**Content Script Layer:**
- Purpose: Web page DOM scraping and job data extraction
- Location: `content/`
- Contains: `content.js` (DOM selectors, message listeners, data extraction logic)
- Depends on: None (standalone scraper)
- Used by: All web pages via manifest injection, receives messages from `popup/popup.js`

**Background Layer:**
- Purpose: Extension lifecycle management (currently minimal)
- Location: `background/`
- Contains: `background.js` (service worker event listeners)
- Depends on: None
- Used by: Chrome extension system (installation, updates)

**Utility Layer:**
- Purpose: Business logic and external API integration
- Location: `utils/`
- Contains: `cvExtractor.js` (CV text extraction and metadata), `htmlGenerator.js` (template population), `pdfGenerator.js` (PDF rendering), `gemini.js` (AI API calls with retry logic)
- Depends on: `libs/` libraries, chrome.storage.local
- Used by: `popup/popup.js` (orchestrator)

**Library Layer:**
- Purpose: Third-party functionality
- Location: `libs/`
- Contains: `jspdf.umd.min.js`, `mammoth.browser.min.js`, `html2canvas.min.js`, `pdf.min.mjs`, `pdf.worker.min.mjs`
- Depends on: None (bundled libraries)
- Used by: `utils/` modules and `popup/popup.js`

**Data Layer:**
- Purpose: Persistent data storage
- Location: `chrome.storage.local` (browser API)
- Contains: `cvText`, `cvMetadata`, `htmlTemplate`, `openaiApiKey`, `currentJobData`, `currentCoverLetter`
- Depends on: None (browser-managed)
- Used by: `popup/popup.js` and `utils/` modules

## Data Flow

**CV Upload Flow (Phase 1 - One-time Setup):**

1. User clicks "Choose CV File" in popup
2. `popup/popup.js` reads file, validates type (PDF/DOCX) and size (10MB max)
3. `utils/cvExtractor.js` extracts text from PDF/DOCX (using PDF.js or Mammoth.js)
4. `utils/gemini.js` calls Gemini API with CV text to extract structured metadata
5. `utils/htmlGenerator.js` loads base template from `cover_letter_template.html`
6. `utils/htmlGenerator.js` populates `{{FULL_NAME}}` and `{{CONTACT_LINE}}` placeholders
7. `popup/popup.js` stores CV text, metadata, and partial template in `chrome.storage.local`

**Cover Letter Generation Flow (Phase 2 - Per-Job):**

1. User navigates to job posting and clicks extension icon
2. Popup opens, user clicks "Tailor" button
3. `popup/popup.js` sends `extractJobPosting` message to content script via `chrome.tabs.sendMessage()`
4. `content/content.js` scrapes DOM for job data (Handshake-specific selectors)
5. Content script responds with job data object
6. `utils/gemini.js` builds prompt and calls Gemini API with CV text + job data
7. `utils/htmlGenerator.js` retrieves partial template from storage
8. `utils/htmlGenerator.js` populates `{{DATE}}`, `{{COMPANY_NAME}}`, `{{LETTER_BODY}}` placeholders
9. `utils/pdfGenerator.js` renders HTML to canvas using html2canvas
10. `utils/pdfGenerator.js` generates PDF using jsPDF
11. Browser downloads PDF with filename: `{firstName}-{lastName}-{jobTitle}-CoverLetter.pdf`

**State Management:**
- All state persisted in `chrome.storage.local` with explicit key naming
- No in-memory state across popup closes (storage ensures continuity)
- Temporary job data stored per session (`currentJobData`, `currentCoverLetter`)

## Key Abstractions

**Two-Phase Template System:**
- Purpose: Separate persistent CV data from per-job data to minimize API calls and ensure consistency
- Examples: `utils/htmlGenerator.js` (populateCVMetadataHtml, completeHtmlTemplateWithJobData)
- Pattern: Base HTML template → Phase 1 populate CV metadata → store partial → Phase 2 populate job data → complete template
- Benefits: CV extracted once, reused for multiple applications; contact info consistent across all letters

**Message-Based Inter-Component Communication:**
- Purpose: Enable popup-to-content script communication across different contexts
- Examples: `popup/popup.js` sends `extractJobPosting` action, `content/content.js` responds with data
- Pattern: `chrome.tabs.sendMessage(tabId, {action: 'name'})` with promise-based response handling

**Global Utility Modules:**
- Purpose: Share business logic without ES module system complexity
- Examples: `utils/cvExtractor.js`, `utils/gemini.js`, `utils/htmlGenerator.js`, `utils/pdfGenerator.js`
- Pattern: Functions declared in global scope, loaded via `<script>` tags in `popup.html`, no imports/exports
- Constraint: Must avoid naming conflicts (all utilities use descriptive function names)

**chrome.storage.local Schema:**
- Purpose: Centralized data persistence accessible from all extension contexts
- Schema:
  - `cvText`: string - Raw extracted CV text
  - `cvMetadata`: object - Structured metadata (firstName, lastName, email, phone, github, linkedin, portfolio, resumeBody, etc.)
  - `htmlTemplate`: string - Partially populated HTML template
  - `openaiApiKey`: string - Gemini API key (historical naming)
  - `currentJobData`: object - Temporary job posting data
  - `currentCoverLetter`: string - Generated letter body text

## Entry Points

**Popup Entry Point:**
- Location: `popup/popup.html`
- Triggers: User clicks extension icon in browser toolbar
- Responsibilities:
  - Render main UI (status, Tailor button, settings panel)
  - Load all utility scripts and libraries
  - Initialize on `DOMContentLoaded` event
  - Orchestrat all workflows (CV upload, cover letter generation)
  - Manage chrome.storage.local read/write operations

**Background Service Worker Entry Point:**
- Location: `background/background.js`
- Triggers: Extension installation or update
- Responsibilities: Currently minimal - only listens to `chrome.runtime.onInstalled`
- Note: Background worker not actively used in current architecture (popup orchestrates everything)

**Content Script Entry Point:**
- Location: `content/content.js`
- Triggers: Content script injection on all URLs (`<all_urls>` in manifest)
- Responsibilities:
  - Listen for `extractJobPosting` messages from popup
  - Scrape job posting DOM using Handshake-specific selectors
  - Extract: job title (h1), company (aria-label), description (overflow-wrap container), location ("At a glance" section)
  - Fetch employer address via Handshake GraphQL API (if available)
  - Respond with structured job data object or error for unsupported sites

## Error Handling

**Strategy:** Try-catch blocks with user-friendly error messages, detailed console logging for debugging

**Patterns:**
- Popup-level: `try-catch` in all async functions with `showMessage(error.message, 'error')` for user feedback
- Content script: Promise-based error responses via `sendResponse({success: false, error: message})`
- Gemini API: Exponential backoff retry (3 attempts: 2s, 4s, 8s) for rate limits (429 status), immediate throw for auth errors
- PDF generation: Fallback to text-only PDF generation if html2canvas fails
- CV extraction: Fallback to regex-based extraction if Gemini API fails during metadata extraction

## Cross-Cutting Concerns

**Logging:** Extensive console logging with emoji prefixes for easy debugging (e.g., `📄 CV UPLOAD`, `🤖 Calling Gemini API`, `❌ GEMINI ERROR`)
**Validation:** File type validation (PDF/DOCX), file size limit (10MB), API key format validation (must start with "AIza"), CV text length validation (100-50000 chars)
**Authentication:** Gemini API key stored in chrome.storage.local, validated before use, format checked on save
**Security:** HTML escaping via `escapeHtml()` before template population to prevent XSS attacks; password input for API key; no secrets in source code
**Rate Limiting:** Built-in retry logic in `utils/gemini.js` with exponential backoff for 429 responses

---

*Architecture analysis: 2026-02-05*
