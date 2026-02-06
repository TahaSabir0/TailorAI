# Codebase Structure

**Analysis Date:** 2026-02-05

## Directory Layout

```
TailorAI/
├── .github/                    # GitHub-specific files
│   └── appmod/                 # Application moderation files
├── .planning/                  # Planning and documentation
│   └── codebase/               # Codebase analysis documents
├── assets/                     # Static assets
│   └── icons/                  # Extension icons (16px, 48px, 128px)
├── background/                 # Service worker script
│   └── background.js           # Extension lifecycle event handler (minimal)
├── content/                    # Content script
│   └── content.js              # Web page DOM scraper for job postings
├── libs/                       # Third-party libraries (minified)
│   ├── html2canvas.min.js      # HTML to canvas rendering
│   ├── jspdf.umd.min.js        # PDF generation
│   ├── mammoth.browser.min.js  # DOCX text extraction
│   ├── pdf.min.mjs             # PDF text extraction (ES module)
│   └── pdf.worker.min.mjs      # PDF.js worker thread
├── popup/                      # Extension popup UI
│   ├── popup.html              # Main UI markup
│   ├── popup.js                # Workflow orchestration and event handling
│   └── popup.css               # Apple-inspired styling
├── utils/                      # Utility modules (global functions)
│   ├── cvExtractor.js          # CV text extraction and metadata extraction
│   ├── gemini.js               # Gemini API integration with retry logic
│   ├── htmlGenerator.js        # HTML template population (two-phase system)
│   └── pdfGenerator.js         # PDF generation from HTML
├── cover_letter_template.html  # Base HTML template for cover letters
├── cover_letter_template.tex   # LaTeX template (unused legacy)
├── manifest.json               # Chrome extension manifest (Manifest V3)
├── package.json                # NPM package metadata (minimal)
├── CLAUDE.md                   # Developer documentation
├── README.md                   # User documentation
├── context.md                  # Project context
└── .gitignore                  # Git ignore rules
```

## Directory Purposes

**background/**:
- Purpose: Service worker for extension lifecycle events
- Contains: Single background script for installation/update handling
- Key files: `background.js`
- Note: Currently minimal, popup handles most orchestration

**content/**:
- Purpose: Content script injected into web pages for job posting scraping
- Contains: DOM scraping logic and message listener for popup communication
- Key files: `content.js`
- Injection: Loaded on all URLs via manifest, but only responds to Handshake pages

**libs/**:
- Purpose: Third-party libraries loaded as scripts (web_accessible_resources)
- Contains: PDF.js, Mammoth.js, jsPDF, html2canvas
- Key files: `pdf.min.mjs`, `mammoth.browser.min.js`, `jspdf.umd.min.js`, `html2canvas.min.js`, `pdf.worker.min.mjs`
- Generated: No - manually vendored minified libraries
- Committed: Yes - all libraries committed to repository

**popup/**:
- Purpose: Extension popup UI and primary orchestrator for all workflows
- Contains: HTML markup, JavaScript event handling, CSS styling
- Key files: `popup.html`, `popup.js`, `popup.css`
- Entry point: Opens when user clicks extension icon

**utils/**:
- Purpose: Shared business logic and external API integration
- Contains: CV extraction, Gemini API integration, HTML generation, PDF generation
- Key files: `cvExtractor.js`, `gemini.js`, `htmlGenerator.js`, `pdfGenerator.js`
- Note: All functions are global (no ES modules), loaded via script tags in popup.html

**assets/icons/**:
- Purpose: Extension icons for browser UI
- Contains: PNG icons at 16px, 48px, and 128px sizes
- Key files: `icon16.png`, `icon48.png`, `icon128.png`
- Note: `generate_icons.html` tool included for recreating icons

## Key File Locations

**Entry Points:**
- `popup/popup.html`: Main UI entry point (opened when extension icon clicked)
- `background/background.js`: Service worker entry point (extension lifecycle events)
- `content/content.js`: Content script entry point (injected into all web pages)

**Configuration:**
- `manifest.json`: Chrome extension configuration (permissions, scripts, resources)
- `package.json`: NPM package metadata (minimal, for potential future build step)

**Core Logic:**
- `popup/popup.js`: Primary orchestrator - manages CV upload, job extraction, cover letter generation workflows
- `content/content.js`: DOM scraping logic for job posting data extraction
- `utils/cvExtractor.js`: CV text extraction and structured metadata extraction via Gemini API
- `utils/gemini.js`: Gemini API integration with exponential backoff retry logic
- `utils/htmlGenerator.js`: Two-phase HTML template population system
- `utils/pdfGenerator.js`: PDF generation using jsPDF and html2canvas

**Styling:**
- `popup/popup.css`: Apple-inspired UI styling for extension popup
- `cover_letter_template.html`: Professional cover letter HTML template with inline styles

**Testing:**
- No test directory or test files present (testing not implemented)

## Naming Conventions

**Files:**
- PascalCase for multi-word components: `popup.html`, `popup.js`, `popup.css`
- camelCase for utilities: `cvExtractor.js`, `htmlGenerator.js`, `pdfGenerator.js`
- Lowercase with extensions for libraries: `jspdf.umd.min.js`, `mammoth.browser.min.js`
- Descriptive names: `cover_letter_template.html`, `background.js`, `content.js`

**Directories:**
- lowercase for standard directories: `background`, `content`, `libs`, `popup`, `utils`
- Plural for collections: `assets`, `icons`, `libs`
- Underscore for multi-word directory: `codebase`

**Functions (JavaScript):**
- camelCase for all functions: `handleCVUpload`, `extractJobData`, `generateCoverLetter`
- Prefix verbs: `handle`, `extract`, `generate`, `load`, `save`, `get`, `set`
- Descriptive compound names: `populateCVMetadataHtml`, `completeHtmlTemplateWithJobData`

**Variables (JavaScript):**
- camelCase for all variables: `cvText`, `jobData`, `cvMetadata`
- Descriptive names: `apiKey`, `firstName`, `lastName`, `companyName`

**HTML IDs/Classes:**
- camelCase for IDs: `tailorBtn`, `settingsBtn`, `cvStatus`, `apiKey`
- kebab-case for classes: `tailor-btn`, `icon-btn`, `status-section`, `settings-panel`
- Exceptions: `coverLetterContent` (camelCase for template targeting)

**Storage Keys (chrome.storage.local):**
- camelCase: `cvText`, `cvMetadata`, `htmlTemplate`, `openaiApiKey`
- Note: `openaiApiKey` is historical (actually stores Gemini key)

## Where to Add New Code

**New Feature:**
- Primary code: `popup/popup.js` (add event handlers and orchestration logic)
- Helper functions: `utils/` (create new utility file if feature has distinct logic, e.g., `utils/newFeature.js`)
- UI elements: `popup/popup.html` (add HTML markup)
- Styling: `popup/popup.css` (add class styles)

**New Component/Module:**
- Implementation: `utils/newModule.js` (create as global function module)
- Usage: Add `<script src="../utils/newModule.js"></script>` to `popup/popup.html`
- Pattern: Export functions as globals, no import/export syntax

**New Job Board Support:**
- Implementation: `content/content.js` (add new extractor function like `extractLinkedInJob()`)
- Integration: Modify `extractJobData()` to detect URL pattern and call appropriate extractor
- Note: Currently only Handshake is supported, architecture designed for multi-platform support

**New Utility Functions:**
- Shared helpers: Add to existing `utils/` files based on functionality:
  - CV-related: `utils/cvExtractor.js`
  - API-related: `utils/gemini.js` (or create new `utils/newApi.js` for different API)
  - HTML/template-related: `utils/htmlGenerator.js`
  - PDF/document-related: `utils/pdfGenerator.js`

**New Template Versions:**
- Implementation: Create new template file `cover_letter_template_v2.html`
- Update: Modify `utils/htmlGenerator.js` to load new template (add function parameter or configuration)
- Note: Single template system currently in use

## Special Directories

**libs/**:
- Purpose: Third-party minified libraries (browser-compatible)
- Generated: No - manually vendored from upstream sources
- Committed: Yes - all libraries committed to repository
- Access: Declared as web_accessible_resources in manifest, loaded via chrome.runtime.getURL()
- Note: PDF.js loaded as ES module (`import()`), others loaded as global scripts

**assets/icons/**:
- Purpose: Extension icons for browser toolbar and chrome://extensions/
- Generated: No - custom-created icons
- Committed: Yes
- Sizes: 16x16px (toolbar), 48x48px (extensions page), 128x128px (Chrome Web Store)
- Tool: `generate_icons.html` included for recreating icons

**.planning/**:
- Purpose: Planning documents and codebase analysis
- Generated: Yes - documents written by automated tools (e.g., GSD mapping)
- Committed: Yes
- Structure: `codebase/` subdirectory for architecture and convention documents

**.github/**:
- Purpose: GitHub-specific configuration and workflows
- Generated: Partially - some files may be auto-generated by GitHub
- Committed: Yes
- Contents: `appmod/` for application moderation (likely GitHub-specific)

---

*Structure analysis: 2026-02-05*
