# Testing Patterns

**Analysis Date:** 2026-02-05

## Test Framework

**Runner:**
- None configured
- Package.json contains placeholder: `"test": "echo \"No tests yet\" && exit 0"`
- No test framework or assertion library installed

**Run Commands:**
```bash
npm test                # Runs placeholder (exits 0)
```

## Test File Organization

**Location:**
- Not applicable - no test directory or test files exist

**Naming:**
- Not applicable - no test files exist

**Structure:**
- No test directory structure

## Test Structure

**Suite Organization:**
- Not applicable - no tests exist

**Patterns:**
- Not applicable - no tests exist

## Mocking

**Framework:**
- No mocking framework configured

**Patterns:**
- Not applicable - no tests exist

**What to Mock:**
- Not applicable - no tests exist

**What NOT to Mock:**
- Not applicable - no tests exist

## Fixtures and Factories

**Test Data:**
- Not applicable - no test fixtures exist

**Location:**
- Not applicable - no fixtures directory

## Coverage

**Requirements:**
- None enforced

**View Coverage:**
- Not applicable - no coverage tool configured

## Test Types

**Unit Tests:**
- None exist

**Integration Tests:**
- None exist

**E2E Tests:**
- None exist

## Current State

**Test Coverage:**
- 0% - No tests present in the codebase

**Testing Infrastructure:**
- No test framework (Jest, Vitest, Mocha, etc.)
- No assertion library (Chai, Expect, etc.)
- No mocking library (Sinon, MSW, etc.)
- No test utilities/helpers
- No test fixtures or factories

**Recommended Testing Stack:**
Given this is a Chrome extension with vanilla JavaScript:
- **Unit Tests:** Jest or Vitest (supports vanilla JS, ESM)
- **Integration Tests:** Vitest with jsdom for DOM manipulation testing
- **E2E Testing:** Playwright (supports Chrome extensions) or Puppeteer

## Areas Requiring Testing

**Critical Paths:**
1. **CV Upload and Extraction** (`utils/cvExtractor.js`):
   - PDF text extraction
   - DOCX text extraction
   - Hyperlink extraction from both formats
   - File validation (type, size)
   - CV text length validation

2. **Gemini API Integration** (`utils/gemini.js`):
   - Cover letter generation
   - CV structured data extraction
   - Rate limit retry logic
   - API key validation
   - Error handling for various API responses

3. **HTML Template System** (`utils/htmlGenerator.js`):
   - Template loading
   - Placeholder replacement (CV metadata)
   - Placeholder replacement (job-specific data)
   - HTML escaping for XSS prevention
   - Contact line HTML generation

4. **PDF Generation** (`utils/pdfGenerator.js`):
   - HTML to PDF conversion
   - Multi-page handling
   - Clickable link annotations
   - Fallback PDF generation

5. **Job Scraping** (`content/content.js`):
   - Handshake job data extraction
   - DOM element selection
   - GraphQL API calls for employer address
   - Text cleaning

6. **Popup UI** (`popup/popup.js`):
   - Event listener setup
   - CV status checking
   - API key storage/retrieval
   - Message handling with content script
   - User feedback display

**Edge Cases to Test:**
- Large CV files (near 10MB limit)
- Empty or malformed CV text
- API rate limit exhaustion
- Network failures
- Unsupported file types
- Missing or invalid job data
- Empty or incomplete job descriptions
- Missing CV metadata fields
- HTML injection attacks (XSS)

## Manual Testing Approach

**Current Testing Method:**
- Manual testing through Chrome extension UI
- Browser console debugging (DevTools)
- Diagnostic function `debugGeminiAPI()` available globally in console

**Debug Tools:**
- Chrome DevTools for popup inspection
- Console logging throughout codebase
- Diagnostic `debugGeminiAPI()` function for API key validation

## Common Patterns

**Not Applicable** - No test patterns exist in the codebase.

## Recommendations for Adding Tests

**Setup Steps:**
1. Install test framework: `npm install --save-dev vitest jsdom @testing-library/dom`
2. Update `package.json` test script: `"test": "vitest"`
3. Create `tests/` directory
4. Add `vitest.config.js` configuration

**Sample Test Structure:**
```
tests/
├── unit/
│   ├── cvExtractor.test.js
│   ├── gemini.test.js
│   ├── htmlGenerator.test.js
│   └── pdfGenerator.test.js
├── integration/
│   ├── popup.test.js
│   └── content.test.js
└── fixtures/
    ├── sample-cv.pdf
    └── sample-cv.docx
```

**Testing Chrome Extension Specifics:**
- Use `jsdom` for DOM manipulation tests
- Mock `chrome.storage.local` APIs
- Mock `chrome.tabs` and `chrome.runtime` messaging
- Use MSW (Mock Service Worker) for API mocking
- Consider using CRXJS or similar for extension testing

---

*Testing analysis: 2026-02-05*
