# TailorAI Chrome Extension - Technical Context Summary

## Project Overview
TailorAI is a Chrome extension (Manifest V3) that generates personalized cover letters by:
1. Storing a user's CV with structured metadata extraction
2. Scraping job postings from Handshake
3. Using Google Gemini API to generate tailored cover letters
4. Outputting formatted PDF documents

**Tech Stack:** Vanilla JavaScript, Chrome Extension APIs, Google Gemini API, LaTeX (for PDF formatting)

---

## What It Was Before (Original System)

### CV Processing:
- User uploaded PDF/DOCX resume
- Basic regex extraction for name only (`extractNameFromCV()`)
- Stored as plain text in `chrome.storage.local` with minimal metadata:
  ```javascript
  {
    cvText: "full resume text",
    cvMetadata: {
      fileName: "Resume.pdf",
      uploadDate: "2026-01-23...",
      firstName: "John",  // regex extracted
      lastName: "Doe",    // regex extracted
    }
  }
  ```

### PDF Generation:
- Used **jsPDF** library (JavaScript-only)
- Generated basic PDFs directly in the browser
- Simple formatting with hardcoded layouts
- Function: `generateCoverLetterPDF()` in `utils/pdfGenerator.js`

### Workflow:
1. Upload CV → store text
2. Navigate to job → scrape data
3. Call Gemini → generate letter text
4. jsPDF → create basic PDF → download

**Problems with old system:**
- Limited CV data extraction (only name)
- Poor PDF typography and formatting
- No separation between persistent and job-specific data

---

## What Changed (New System)

### 1. Structured CV Metadata Extraction
**Implementation:** Modified `utils/cvExtractor.js`

Now uses **Gemini API** to extract structured data from uploaded CVs:

```javascript
// New data structure stored in chrome.storage.local
{
  // Personal Information
  firstName: string,
  lastName: string,
  fullName: string,
  email: string,
  phoneNumber: string | null,
  
  // Professional Links (optional)
  github: string | null,
  linkedin: string | null,
  portfolio: string | null,
  
  // Resume Content
  fullText: string,        // Original complete text
  resumeBody: string,      // Header stripped, content only
  
  // File Metadata
  fileName: string,
  uploadDate: string,
  textLength: number,
  wordCount: number
}
```

**New Function:** `extractStructuredCVData(cvText, apiKey)` 
- Sends CV text to Gemini with structured extraction prompt
- Returns JSON object with parsed contact info and links
- Has regex-based fallback if API fails
- Strips header from body content for cleaner processing

**Integration:** Modified `popup.js` `handleCVUpload()` to:
1. Require Gemini API key before CV upload
2. Call `createCVMetadata(fileName, cvText, apiKey)` (now async)
3. Store enriched metadata in chrome.storage

---

### 2. LaTeX Template System
**New Architecture:** Replaced jsPDF with LaTeX-based PDF generation

**Files Created:**
- `cover_letter_template.tex` - Professional LaTeX template
- `utils/latexGenerator.js` - Template management system

**Template Structure:**
```latex
\documentclass[11pt, letterpaper]{article}
% ... packages and setup ...

\begin{document}
% Populated ONCE during CV upload:
\headername{{{FULL_NAME}}}
\contactline{{{CONTACT_LINE}}}  % email | phone | linkedin | github

% Populated PER JOB:
{{DATE}}          % Current date when applying
{{COMPANY_NAME}}  % From job scraping
{{LETTER_BODY}}   % From Gemini generation

Sincerely,
{{FULL_NAME}}
\end{document}
```

**Two-Phase Population:**

**Phase 1 - CV Upload (Persistent Data):**
```javascript
// In popup.js after CV metadata extracted:
const partialTemplate = await populateCVMetadata(metadata);
await storePartialTemplate(partialTemplate);
```

Stored in `chrome.storage.local.latexTemplate` as:
```latex
\headername{John Doe}
\contactline{john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe}
{{DATE}}  % Still placeholder
{{COMPANY_NAME}}  % Still placeholder
{{LETTER_BODY}}  % Still placeholder
```

**Phase 2 - Job Application (Job-Specific Data):**
```javascript
// When generating cover letter:
const partialTemplate = await getStoredTemplate();
const completedLatex = completeTemplateWithJobData(
  partialTemplate, 
  jobData, 
  letterBody
);
// Returns complete LaTeX document ready for compilation
```

---

### 3. Key Functions Implemented

**In `utils/latexGenerator.js`:**
- `loadLatexTemplate()` - Loads base .tex file from extension
- `buildContactLine(cvMetadata)` - Constructs "email | phone | links" line
- `populateCVMetadata(cvMetadata)` - Replaces `{{FULL_NAME}}` and `{{CONTACT_LINE}}`
- `storePartialTemplate(template)` - Saves to chrome.storage.local
- `getStoredTemplate()` - Retrieves partial template
- `completeTemplateWithJobData(template, jobData, letterBody)` - Fills in job placeholders
- `escapeLaTeX(text)` - Sanitizes special characters (&, %, $, etc.)
- `generateCoverLetterLatex(jobData, letterBody)` - Main entry point

**Modified Files:**
- `manifest.json` - Added `cover_letter_template.tex` to web_accessible_resources
- `popup/popup.html` - Added `<script src="../utils/latexGenerator.js">`
- `popup/popup.js` - Integrated template population into CV upload flow
- `popup/popup.js` - Added template deletion to `handleDeleteCV()`

---

## Current State & Storage

### Chrome Storage Contents:
```javascript
chrome.storage.local = {
  cvText: "full original CV text...",
  cvMetadata: { 
    firstName: "John",
    email: "john@example.com",
    github: "https://github.com/johndoe",
    // ... full structured data
  },
  openaiApiKey: "AIza...",  // Gemini API key
  latexTemplate: "\\documentclass...{{DATE}}...{{COMPANY_NAME}}...",  // Partial template
  currentJobData: { company: "...", jobTitle: "..." },  // Temporary
  currentCoverLetter: "Dear Hiring Manager..."  // Temporary
}
```

### Workflow (Current Implementation):
✅ **Completed:**
1. User uploads CV → Gemini extracts structured metadata
2. Partial LaTeX template populated with CV data
3. Template stored in chrome.storage.local
4. User navigates to Handshake job page
5. Extension scrapes job data (company, title, description)
6. Gemini generates cover letter body text
7. Stored template retrieved and completed with job data
8. **Result:** Complete LaTeX document string in JavaScript

⏸️ **Blocked:**
9. **LaTeX → PDF Compilation** (not yet implemented)
10. PDF download to user's machine

---

## Current Blockage: LaTeX to PDF Conversion

### The Problem:
We have a complete LaTeX document as a JavaScript string:
```javascript
const completedLatex = `\\documentclass[11pt, letterpaper]{article}
\\begin{document}
\\headername{John Doe}
...
\\end{document}`;
```

**But:** Chrome extensions **cannot compile LaTeX to PDF** natively because:
- No access to pdflatex, XeLaTeX, or similar compilers
- No Node.js environment (it's a browser extension)
- File system access is restricted

### Solutions Being Considered:

**Option 1: Online LaTeX Compilation API**
- Services like LaTeX.Online, Overleaf API, CloudConvert
- Send LaTeX string via HTTP POST → receive PDF binary
- Pros: Professional output, proper LaTeX rendering
- Cons: Requires external dependency, privacy concerns

**Option 2: Self-Hosted Compilation Endpoint**
- Set up own server with TeX Live installed
- POST LaTeX → run pdflatex → return PDF
- Pros: Full control, privacy
- Cons: Requires server infrastructure

**Option 3: Browser-Based Compiler (TeXLive.js)**
- JavaScript port of TeX Live
- Compiles entirely in browser
- Pros: No server needed, works offline
- Cons: Limited package support, large bundle size (~80MB)

**Option 4: Fallback to HTML/CSS + jsPDF**
- Convert LaTeX structure to HTML/CSS
- Use original jsPDF for generation
- Pros: Simple, no dependencies
- Cons: Loses LaTeX typography quality, significant rework needed

### Current Code Point:
In `popup.js`, after Gemini generates the cover letter:
```javascript
// Line ~280 in handleTailorClick()
const coverLetter = await generateCoverLetter(result.cvText, jobData, result.openaiApiKey);

// This is where we need to:
const completedLatex = await generateCoverLetterLatex(jobData, coverLetter);
// ❓ TODO: Convert completedLatex string to PDF and download
```

The `pdfGenerator.js` file still exists but uses the old jsPDF system - needs replacement or integration with LaTeX workflow.

