# Coding Conventions

**Analysis Date:** 2026-02-05

## Naming Patterns

**Files:**
- JavaScript files: camelCase (`popup.js`, `cvExtractor.js`, `gemini.js`, `htmlGenerator.js`, `pdfGenerator.js`)
- HTML files: camelCase (`popup.html`) or lowercase with underscores (`cover_letter_template.html`)
- CSS files: camelCase (`popup.css`)
- Library files: lowercase with dots (`mammoth.browser.min.js`, `jspdf.umd.min.js`)

**Functions:**
- camelCase for all function names (`handleCVUpload`, `generateCoverLetter`, `extractTextFromCV`)
- Verb-noun pattern for action functions (`handleCVUpload`, `validateCVText`, `extractStructuredCVData`)
- Noun-verb pattern for getters/setters (`extractNameFromCV`, `buildContactLineHtml`)

**Variables:**
- camelCase for all variables (`cvMetadata`, `jobData`, `apiKey`, `contactLine`)
- Descriptive names that indicate type/purpose (`cvText`, `htmlTemplate`, `structuredData`)

**Constants:**
- `const` declarations used, but not explicitly named with uppercase
- Values defined inline in function scopes (e.g., `const validTypes = [...]` in `handleCVUpload`)

**CSS Classes:**
- kebab-case for all class selectors (`.tailor-btn`, `.settings-panel`, `.cv-info`)
- BEM-like naming with modifiers (`.tailor-btn:disabled`, `.tailor-btn:hover`)
- State classes without prefixes (`.success`, `.error`)

**DOM Elements:**
- camelCase for IDs (`tailorBtn`, `settingsBtn`, `cvUpload`)
- camelCase for element variable references (`const tailorBtn = document.getElementById('tailorBtn')`)

## Code Style

**Formatting:**
- No automated formatting configured (no `.prettierrc`, `.eslintrc`, `biome.json`)
- Indentation: 2 spaces
- Single quotes preferred in JavaScript (`'string'`)
- Double quotes used in HTML attributes (`<button id="settingsBtn">`)
- Semicolons used consistently
- Trailing commas in objects/arrays

**Linting:**
- No linting configured (no `.eslintrc`, `eslint.config.*`)
- Manual code review only

**Language:**
- Plain JavaScript (Vanilla JS) - no TypeScript
- ES6+ features used: `async/await`, arrow functions, destructuring, template literals, `const`/`let`

## Import Organization

**Script Loading Order (from `popup/popup.html`):**
1. Third-party libraries (`libs/mammoth.browser.min.js`, `libs/jspdf.umd.min.js`, `libs/html2canvas.min.js`)
2. Utility scripts (`utils/cvExtractor.js`, `utils/gemini.js`, `utils/htmlGenerator.js`, `utils/pdfGenerator.js`)
3. Main application script (`popup.js`)

**Module System:**
- NO ES modules (`import/export` syntax not used)
- All functions declared as global functions (accessible via `window.functionName`)
- Files loaded via `<script>` tags in HTML
- Chrome extension APIs: `chrome.storage.local`, `chrome.runtime.getURL()`, `chrome.tabs.query()`, `chrome.tabs.sendMessage()`
- Dynamic imports for PDF.js: `await import(chrome.runtime.getURL('libs/pdf.min.mjs'))`
- Global library access: `window.mammoth`, `window.jspdf`, `window.html2canvas`

**Path Aliases:**
- None used - all paths are relative (`../utils/`, `../libs/`)

## Error Handling

**Patterns:**
- `try-catch` blocks around all async operations
- Errors re-thrown with context: `throw new Error('Failed to extract text from PDF: ' + error.message)`
- Custom error messages for user feedback
- State cleanup in catch blocks (e.g., `cvUploadInput.value = ''` in `handleCVUpload`)

**Error Types:**
- File validation errors: "Please upload a PDF or DOCX file", "File size must be less than 10MB"
- API errors: "Invalid API key format. Gemini keys start with "AIza""
- Network errors: "Could not establish connection", "Please refresh the job posting page"
- Data extraction errors: "Could not extract job posting. Make sure you are on a job posting page."

**Retry Logic:**
- Exponential backoff for API rate limits in `utils/gemini.js`
- 3 retry attempts with delays: 2s, 4s, 8s (`Math.pow(2, attempt) * 2000`)
- Checks for status code 429 and "RATE_LIMIT" errors

**Validation:**
- Input validation at function entry: `if (!cvText) throw new Error("CV text is required")`
- File type validation: MIME type checking (`'application/pdf'`, `'application/vnd.openxmlformats-officedocument.wordprocessingml.document'`)
- API key format validation: `if (!apiKey.startsWith('AIza'))`
- CV text length validation: minimum 100 characters, maximum 50,000 characters

## Logging

**Framework:** `console` API (no logging library)

**Patterns:**
- Error logging: `console.error('Error extracting job data:', error)`
- Success logging: `console.log("✅ Gemini API call successful. Generated", response.length, "characters")`
- Warning logging: `console.warn("⚠️ GEMINI RATE LIMIT: Attempt ${attempt + 1}/${maxRetries}")`
- Diagnostic logging with styled output in `debugGeminiAPI()`: `console.log("%c✓ Format looks valid", "color: green;")`

**Emoji Prefixes:**
- `✅` for success
- `❌` for errors
- `⚠️` for warnings
- `🤖` for AI operations
- `📄` for document operations
- `🔗` for links
- `👤` for user data

**Structured Logging:**
- Console group separators for debug output: `console.log('========================================')`
- Detailed metadata logging in `createCVMetadata()` showing all extracted CV fields

## Comments

**When to Comment:**
- Function documentation (JSDoc-style)
- Complex business logic explanations (e.g., scraping strategies in `content/content.js`)
- Section dividers for code organization
- Implementation notes (e.g., "Note: mammoth is loaded globally from the script tag in popup.html")

**JSDoc/TSDoc:**
- JSDoc used for function documentation with `/**` syntax
- No TSDoc (TypeScript not used)
- Params and returns documented: `@param {string} coverLetter`, `@returns {Promise<string>}`
- Example in `utils/pdfGenerator.js`:
```javascript
/**
 * Generate and download a PDF cover letter from HTML template
 * @param {string} coverLetter - The cover letter text body
 * @param {object} jobData - Job posting data (company, jobTitle, etc.)
 * @param {object} cvMetadata - CV metadata (name, email, etc.)
 * @returns {Promise<string>} - The generated filename
 */
```

**Inline Comments:**
- Used sparingly for complex logic
- Explains DOM scraping strategies in `content/content.js`
- Notes about Chrome extension architecture (e.g., "Keep message channel open" in `content/content.js`)

## Function Design

**Size:**
- No strict limit, but functions tend to be 10-50 lines
- Large functions present: `buildCoverLetterPrompt()` (~230 lines), `debugGeminiAPI()` (~135 lines)
- Helper functions for modularization (e.g., `sleep()`, `escapeHtml()`, `cleanText()`)

**Parameters:**
- Individual parameters (not objects) for most functions
- Destructuring in function parameters for complex objects
- Optional parameters with default values: `async function callGeminiAPI(prompt, apiKey, maxRetries = 3)`

**Return Values:**
- Functions return values directly (not wrapped in objects unless needed)
- Async functions return Promises
- Validation functions return objects with structure: `{ valid: boolean, message: string }`
- API functions return plain values (strings, objects)
- Example from `validateCVText()`:
```javascript
function validateCVText(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: 'Invalid CV text' };
  }
  // ...
  return { valid: true };
}
```

## Module Design

**Exports:**
- No `export` statements - all functions are global
- Functions called directly without module imports
- Order of script tags in HTML matters for dependencies

**Barrel Files:**
- None used - each utility file loaded separately

**Module Boundaries:**
- `utils/` contains reusable utility functions
- `popup/` contains popup-specific logic
- `content/` contains content script logic
- `background/` contains service worker logic
- `libs/` contains third-party libraries

**Chrome Extension Patterns:**
- `chrome.storage.local` for persistent data
- `chrome.runtime.sendMessage()` for popup-content communication
- `chrome.tabs.query()` and `chrome.tabs.sendMessage()` for cross-tab communication
- `chrome.runtime.getURL()` for accessing extension resources
- `chrome.downloads` is in permissions but not currently used

## CSS Conventions

**Naming:**
- kebab-case for classes: `.tailor-btn`, `.settings-panel`
- BEM-like structure: `.result-section`, `.result-header`, `.result-actions`
- Modifier pattern: `.tailor-btn:hover`, `.tailor-btn:disabled`, `.primary-btn:disabled`

**Organization:**
- Global reset (`* { margin: 0; padding: 0; }`)
- Base styles (body, container)
- Component-specific styles (button groups, sections)
- Utility/state classes (`.success`, `.error`)

**Values:**
- Apple-style design tokens: colors (#007aff, #1d1d1f), shadows, transitions
- Letter-spacing negative for tighter text: `letter-spacing: -0.5px`
- Box-shadows for depth: multi-layered shadows
- Transitions with cubic-bezier: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

---

*Convention analysis: 2026-02-05*
