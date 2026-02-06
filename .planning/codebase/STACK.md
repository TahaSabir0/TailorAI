# Technology Stack

**Analysis Date:** 2026-02-05

## Languages

**Primary:**
- JavaScript (Vanilla, ES6+) - Core application logic, Chrome extension scripts
- HTML - Extension popup UI, cover letter template

**Secondary:**
- CSS - Styling for popup interface and cover letter template

## Runtime

**Environment:**
- Chrome Extension (Manifest V3) - Browser-based extension runtime

**Package Manager:**
- npm - Used only for jsPDF dependency
- Lockfile: `package-lock.json` (not detected in manifest, but implied)

## Frameworks

**Core:**
- Chrome Extension APIs (Manifest V3) - Extension platform APIs for storage, tabs, downloads, scripting, and messaging

**Testing:**
- Not detected

**Build/Dev:**
- None - Direct file editing, no transpilation or bundling required

## Key Dependencies

**Critical:**
- jsPDF (2.5.2) - PDF generation and document creation
  - Location: `libs/jspdf.umd.min.js`, `package.json`
  - Purpose: Create PDF documents from cover letter templates

**Infrastructure:**
- PDF.js (Mozilla, 2023) - PDF text extraction from uploaded CVs
  - Location: `libs/pdf.min.mjs`, `libs/pdf.worker.min.mjs`
  - Purpose: Extract text and hyperlinks from PDF resumes

- Mammoth.js (latest) - DOCX text extraction
  - Location: `libs/mammoth.browser.min.js`
  - Purpose: Extract text and hyperlinks from DOCX resumes

- html2canvas (1.4.1) - HTML to canvas conversion
  - Location: `libs/html2canvas.min.js`
  - Purpose: Convert HTML cover letter to canvas for PDF rendering

## Configuration

**Environment:**
- Chrome Extension - No traditional environment configuration
- All configuration stored in `chrome.storage.local`

**Build:**
- No build configuration files
- No transpilation step
- Direct file loading via `<script>` tags in `popup/popup.html`

## Platform Requirements

**Development:**
- Google Chrome browser (any recent version)
- Chrome Developer mode enabled for extension loading
- No Node.js runtime required (except for jsPDF npm install)

**Production:**
- Chrome browser
- Users load extension via `chrome://extensions/` in Developer mode
- No server deployment required

---

*Stack analysis: 2026-02-05*
