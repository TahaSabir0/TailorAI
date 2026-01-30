# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TailorAI is a Chrome extension (Manifest V3) that generates AI-powered personalized cover letters from job postings. The extension:
1. Stores user CV with structured metadata extraction via Google Gemini API
2. Scrapes job postings from Handshake
3. Generates tailored cover letters using Google Gemini API
4. Outputs formatted PDF documents

**Tech Stack:** Vanilla JavaScript, Chrome Extension APIs (Manifest V3), Google Gemini API (gemini-2.0-flash), jsPDF, pdf.js (PDF extraction), mammoth.js (DOCX extraction), html2canvas

## Chrome Extension Architecture

This is a **Manifest V3** Chrome extension with the following component structure:

### Core Components

- **popup/** - Extension popup UI (popup.html, popup.js, popup.css)
  - Main user interface with settings panel and "Tailor" button
  - Handles CV upload workflow and initiates cover letter generation
  - Manages chrome.storage.local for persistent data

- **background/** - Service worker (background.js)
  - Currently minimal - only handles extension lifecycle events
  - Extension architecture designed with popup as primary orchestrator

- **content/** - Content script (content.js)
  - Injected into all web pages via manifest
  - Extracts job posting data from Handshake pages via DOM scraping
  - Responds to messages from popup with job data

- **utils/** - Utility modules (imported as scripts, not ES modules)
  - `cvExtractor.js` - CV text extraction (PDF/DOCX) and Gemini-powered structured metadata extraction
  - `htmlGenerator.js` - HTML template management with two-phase population
  - `pdfGenerator.js` - PDF generation using jsPDF and html2canvas
  - `gemini.js` - Google Gemini API integration with retry logic for rate limits

- **libs/** - Third-party libraries (loaded via script tags)
  - `jspdf.umd.min.js` - PDF generation
  - `mammoth.browser.min.js` - DOCX text extraction
  - `html2canvas.min.js` - HTML to canvas conversion for PDF rendering

### Message Flow

```
User clicks "Tailor"
  → popup.js sends "extractJobPosting" message
  → content.js extracts job data from page
  → content.js responds with job data
  → popup.js calls generateCoverLetter() (Gemini API)
  → popup.js calls generateCoverLetterHtml()
  → popup.js calls generateCoverLetterPDF()
  → PDF downloads to user's machine
```

## Two-Phase Template System

The extension uses a **two-phase HTML template population** strategy to separate persistent CV data from job-specific data:

### Phase 1: CV Upload (Persistent Data)
When user uploads CV:
1. Extract text from PDF/DOCX (`extractTextFromCV()`)
2. Send CV text to Gemini API for structured extraction (`extractStructuredCVData()`)
3. Extract: firstName, lastName, fullName, email, phoneNumber, github, linkedin, portfolio, resumeBody
4. Store in `chrome.storage.local.cvMetadata`
5. Load base HTML template (`cover_letter_template.html`)
6. Populate `{{FULL_NAME}}` and `{{CONTACT_LINE}}` placeholders
7. Store partial template in `chrome.storage.local.htmlTemplate`

### Phase 2: Job Application (Per-Job Data)
When user clicks "Tailor" on a job posting:
1. Content script extracts job data from Handshake page
2. Gemini API generates cover letter body text
3. Retrieve stored partial template from chrome.storage
4. Populate `{{DATE}}`, `{{COMPANY_NAME}}`, `{{LETTER_BODY}}` placeholders
5. Convert complete HTML to PDF using jsPDF + html2canvas
6. Download PDF with filename: `{firstName}-{lastName}-{jobTitle}-CoverLetter.pdf`

This architecture ensures CV metadata is extracted once and reused for all applications.

## Data Storage Schema

All data stored in `chrome.storage.local`:

```javascript
{
  // Raw CV text
  cvText: string,

  // Structured CV metadata (Gemini-extracted)
  cvMetadata: {
    firstName: string,
    lastName: string,
    fullName: string,
    email: string,
    phoneNumber: string | null,
    github: string | null,
    linkedin: string | null,
    portfolio: string | null,
    fullText: string,           // Original CV text
    resumeBody: string,          // CV text with header stripped
    fileName: string,
    uploadDate: string,          // ISO date
    textLength: number,
    wordCount: number
  },

  // Gemini API key
  openaiApiKey: string,  // Historical name, actually stores Gemini key

  // Partial HTML template (CV data pre-populated)
  htmlTemplate: string,  // HTML with {{DATE}}, {{COMPANY_NAME}}, {{LETTER_BODY}} still as placeholders

  // Temporary job-specific data (not persistent across sessions)
  currentJobData: object,
  currentCoverLetter: string
}
```

## Development Commands

### Loading the Extension
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `TailorAI` folder

### Reloading After Changes
1. Go to `chrome://extensions/`
2. Click the refresh icon on the TailorAI extension card
3. Close and reopen the popup to see changes

### Debugging
- **Popup**: Right-click extension icon → "Inspect popup"
- **Background Script**: `chrome://extensions/` → "Inspect views: background page"
- **Content Script**: Open DevTools (F12) on any webpage

No build process or compilation required - all vanilla JavaScript.

## API Integration

### Google Gemini API
- **Model:** `gemini-2.0-flash`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Key Format:** Must start with "AIza" (validated in `utils/gemini.js`)
- **Rate Limits:** 15 RPM on free tier - handled with exponential backoff retry logic
- **Use Cases:**
  1. CV structured metadata extraction (low temperature 0.1 for consistency)
  2. Cover letter generation (temperature 0.7 for creativity)

### Rate Limit Handling
The `callGeminiAPI()` function in `utils/gemini.js` implements:
- 3 retry attempts with exponential backoff (2s, 4s, 8s)
- Catches 429 status codes and "RATE_LIMIT" errors
- Use `debugGeminiAPI(apiKey)` in browser console for diagnostics

## Handshake Scraping Strategy

Content script targets Handshake-specific DOM selectors:

```javascript
// Job Title: The only <h1> on the page
document.querySelector("h1")

// Company Name: From aria-label of employer follow button
document.querySelector('a[aria-label^="Follow this employer"]')

// Description: Container with overflow-wrap style
document.querySelector('div[style*="overflow-wrap: break-word"]')

// Location: From "At a glance" section
Array.from(document.querySelectorAll("h3")).find(h => h.innerText === "At a glance")
```

Currently **only Handshake is supported**. Other job boards return error in `source` field.

## File Organization Rules

- **No ES Modules:** All utils files use global functions, loaded via `<script>` tags in popup.html
- **Library Loading:** Third-party libs in `libs/` are web_accessible_resources and loaded via chrome.runtime.getURL()
- **Template Files:** `cover_letter_template.html` is in root, marked as web_accessible_resource
- **No Build Step:** Direct file editing, no transpilation or bundling

## Common Issues

### CV Upload Requires API Key First
The structured extraction requires Gemini API, so popup.js enforces API key validation before allowing CV upload. Check `handleCVUpload()` function.

### Chrome Extension Module Loading
- pdf.js must be dynamically imported: `await import(chrome.runtime.getURL('libs/pdf.min.mjs'))`
- mammoth.js is loaded via global script tag, accessed as `window.mammoth`
- Do not use `import/export` syntax - all code must be browser-compatible scripts

### CV Deletion Must Clean Both Storage Keys
When deleting CV, must remove both `cvMetadata` and `htmlTemplate` from chrome.storage.local (see `handleDeleteCV()` in popup.js)

## Important Architectural Notes

1. **Content Script Runs on All URLs:** The content script is injected on `<all_urls>` but only responds to Handshake pages - this is intentional for future multi-platform support

2. **Template Placeholder Format:** Use double curly braces: `{{PLACEHOLDER}}` - must escape in regex operations

3. **Security:** All user inputs (CV text, job data) are escaped via `escapeHtml()` before insertion into HTML to prevent XSS

4. **PDF Filename Sanitization:** Job titles are sanitized to remove special characters for valid filenames (spaces → hyphens, remove `/\?<>:|*"`)

5. **Gemini Prompt Engineering:** The cover letter generation prompt in `buildCoverLetterPrompt()` explicitly instructs Gemini NOT to include contact info, dates, or signatures (these are templated separately)
