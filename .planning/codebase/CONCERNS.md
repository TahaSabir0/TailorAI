# Codebase Concerns

**Analysis Date:** 2026-02-05

## Tech Debt

**API Key Naming Inconsistency:**
- Issue: Storage key is named `openaiApiKey` but stores Google Gemini API key
- Files: `popup/popup.js` (lines 121, 192, 217, 228, 271)
- Impact: Misleading naming causes developer confusion, potential for using wrong API
- Fix approach: Rename to `geminiApiKey` and migrate existing storage

**No Test Coverage:**
- Issue: Zero test files exist. package.json shows "No tests yet"
- Files: `package.json` (line 7)
- Impact: No confidence in refactoring, bugs likely to go unnoticed
- Fix approach: Add Jest or Vitest, test critical paths (CV extraction, PDF generation, Gemini API calls)

**Large Bundle Size:**
- Issue: 2.5MB of libraries loaded in popup on every open
- Files: `libs/` directory (pdf.min.mjs 299KB, pdf.worker.min.mjs 1MB, mammoth.browser.min.js 628KB, jspdf.umd.min.js 358KB, html2canvas.min.js 195KB)
- Impact: Slow popup load time, poor user experience on slow connections
- Fix approach: Lazy load libraries only when needed, use CDN, or switch to lighter alternatives

**Content Script Overhead:**
- Issue: Content script injected on `<all_urls>` but only processes Handshake pages
- Files: `manifest.json` (line 21), `content/content.js`
- Impact: Wastes browser resources on every website visited
- Fix approach: Restrict `matches` to Handshake domains only

**Unused Background Service Worker:**
- Issue: background.js exists but is mostly empty with only lifecycle hooks
- Files: `background/background.js`
- Impact: Dead code, confusion about architecture
- Fix approach: Remove or implement background tasks (e.g., CV pre-processing, API caching)

## Known Bugs

**PDF Word Limit Not Validated:**
- Symptoms: Cover letters exceeding 320 words break single-page PDF layout
- Files: `utils/gemini.js` (line 111), `utils/pdfGenerator.js` (lines 112-143)
- Trigger: Gemini generates longer output than 270-320 word limit
- Workaround: Manually edit cover letter or use multi-page PDF (cuts text mid-paragraph)
- Impact: Poor formatting, unprofessional output

**Multi-page PDF Text Cutting:**
- Symptoms: Multi-page PDF splits canvas without word boundary detection
- Files: `utils/pdfGenerator.js` (lines 117-143)
- Trigger: Cover letter content exceeds single page
- Workaround: Regenerate with shorter content or edit manually
- Impact: Text cut mid-word/mid-paragraph, unprofessional

**Handshake DOM Selector Fragility:**
- Symptoms: Job extraction fails if Handshake changes HTML structure
- Files: `content/content.js` (lines 28, 32, 50, 64, 72, 116, 127-146)
- Trigger: Handshake UI updates, CSS class changes, aria-label format changes
- Workaround: None - requires code update
- Impact: Extension becomes non-functional for Handshake users

**PDF Link Annotation Positioning:**
- Symptoms: Clickable links in PDF may have incorrect positions on multi-page documents
- Files: `utils/pdfGenerator.js` (lines 146-157)
- Trigger: Multi-page PDF generation
- Workaround: None - links may not work correctly
- Impact: Contact links (email, LinkedIn, GitHub) may be unclickable or mispositioned

## Security Considerations

**API Key Storage:**
- Risk: API key stored in chrome.storage.local without encryption
- Files: `popup/popup.js` (lines 192-194, 216-221)
- Current mitigation: Storage cleared when extension uninstalled
- Recommendations: Use chrome.storage.session (cleared on browser close), or implement encryption wrapper

**XSS Vulnerability in Popup:**
- Risk: `innerHTML` used with user-controlled data from CV metadata
- Files: `popup/popup.js` (lines 62-68, 178, 363-374)
- Current mitigation: None - CV data inserted without sanitization
- Recommendations: Escape all user data before using `innerHTML`, or use `textContent` instead

**CSRF Token Exposure in Content Script:**
- Risk: Content script fetches Handshake GraphQL API using user's CSRF token
- Files: `content/content.js` (lines 54-110)
- Current mitigation: None - token accessible to any content script
- Recommendations: Validate GraphQL queries, rate limit requests, consider proxying through background script

**Web Accessible Resources:**
- Risk: Large libraries exposed as web_accessible_resources, accessible by any page
- Files: `manifest.json` (lines 34-39)
- Current mitigation: CSP restricts script execution to 'self'
- Recommendations: Restrict `matches` to specific domains, implement integrity checks

**Unvalidated Job Scraped Data:**
- Risk: No input validation on job data extracted from web pages
- Files: `content/content.js` (lines 20-52), `popup/popup.js` (lines 246-264)
- Current mitigation: None - arbitrary text sent to Gemini API
- Recommendations: Validate and sanitize job title, company name, and description

**HTML Template Injection:**
- Risk: Letter body from Gemini inserted directly into template without validation
- Files: `utils/htmlGenerator.js` (lines 180-199, 240-267)
- Current mitigation: `escapeHtml()` function used for most fields
- Recommendations: Ensure `escapeHtml()` applied to ALL user inputs, validate HTML structure

## Performance Bottlenecks

**Large Library Loading:**
- Problem: All 2.5MB of libraries loaded synchronously in popup
- Files: `popup/popup.html` (lines 74-76)
- Cause: No lazy loading or code splitting
- Improvement path: Load pdf.js/mammoth.js only during CV upload, html2canvas/jsPDF only during PDF generation

**PDF Generation Blocking UI:**
- Problem: html2canvas rendering is synchronous and blocks popup
- Files: `utils/pdfGenerator.js` (lines 75-91, 55)
- Cause: No loading indicator during canvas rendering, only 100ms delay
- Improvement path: Show loading state before html2canvas call, use web worker for canvas operations

**Multi-page PDF Memory Usage:**
- Problem: Creates multiple canvas elements for each page segment
- Files: `utils/pdfGenerator.js` (lines 126-143)
- Cause: No cleanup of intermediate canvases
- Improvement path: Reuse canvas, cleanup temporary canvases immediately after use

**No Request Debouncing:**
- Problem: User can spam "Tailor" button causing multiple API calls
- Files: `popup/popup.js` (lines 226-290)
- Cause: No debouncing or request queuing
- Improvement path: Disable button during operation, add request queue with rate limiting

## Fragile Areas

**DOM Scraping:**
- Files: `content/content.js`
- Why fragile: Handshake page structure changes frequently, hardcoded selectors break easily
- Safe modification: Add multiple fallback selectors, implement scraping tests on actual Handshake pages
- Test coverage: None - scraping logic completely untested

**PDF Generation:**
- Files: `utils/pdfGenerator.js`
- Why fragile: Complex canvas manipulation, word boundary detection missing, multi-page splitting naive
- Safe modification: Add comprehensive test suite with known-good PDF outputs, test multi-page scenarios
- Test coverage: None - PDF generation logic untested

**CV Text Extraction:**
- Files: `utils/cvExtractor.js`
- Why fragile: PDF.js and mammoth.js may fail on certain file formats, fallback regex extraction error-prone
- Safe modification: Test with diverse CV formats (different PDF versions, complex DOCX layouts)
- Test coverage: None - extraction pipeline untested

**Gemini API Integration:**
- Files: `utils/gemini.js`
- Why fragile: API rate limits, quota exhaustion, network failures cause user-facing errors
- Safe modification: Add offline fallback, implement retry with exponential backoff already exists but could be improved
- Test coverage: Debug function exists but no automated tests for API failure scenarios

**Storage Synchronization:**
- Files: `popup/popup.js` (lines 41-58, 119-166)
- Why fragile: Multiple storage keys (cvText, cvMetadata, htmlTemplate) can become desynchronized
- Safe modification: Use single storage object with schema validation, add integrity checks on load
- Test coverage: None - storage state management untested

## Scaling Limits

**Chrome Storage Quota:**
- Current capacity: ~5MB for chrome.storage.local (varies by browser)
- Limit: Cannot store many CVs or cover letters
- Scaling path: Use IndexedDB for larger storage, implement CV rotation/deletion of old data

**Gemini API Rate Limits:**
- Current capacity: 15 requests per minute on free tier
- Limit: Cannot generate cover letters rapidly
- Scaling path: Upgrade to paid tier, cache responses for similar jobs, implement client-side generation fallback

**Popup Memory Constraints:**
- Current capacity: ~50-100MB typical for extension popup
- Limit: Large CV files or complex PDFs may crash popup
- Scaling path: Move CV processing to background service worker, stream PDF generation

**Concurrent Operations:**
- Current capacity: One cover letter generation at a time
- Limit: Cannot process multiple jobs simultaneously
- Scaling path: Implement request queue, background processing for batch operations

## Dependencies at Risk

**pdf.js:**
- Risk: Large library (1.3MB combined), complex API, frequent updates
- Impact: CV extraction from PDFs fails
- Migration plan: Consider pdf-lib or pure-PDF text extraction alternatives, evaluate if full PDF rendering needed

**html2canvas:**
- Risk: Heavy library, inconsistent rendering across browsers, poor performance on large documents
- Impact: PDF generation fails or looks different than expected
- Migration plan: Use jsPDF's built-in HTML rendering or switch to Puppeteer-based PDF generation (requires backend)

**mammoth.js:**
- Risk: DOCX extraction may fail on complex Word documents
- Impact: CV upload fails for DOCX users
- Migration plan: Add fallback to server-side conversion, consider docx.js as alternative

**jsPDF:**
- Risk: Limited HTML-to-PDF capabilities, requires canvas workaround
- Impact: PDF generation quality issues, font rendering problems
- Migration plan: Consider Puppeteer or Playwright for server-side PDF generation, evaluate if client-side generation necessary

## Missing Critical Features

**CV Version Management:**
- Problem: Only one CV can be stored at a time
- Blocks: Users with multiple resume versions (technical vs non-technical)
- Impact: Users must delete and re-upload CVs for different job types

**Offline Capability:**
- Problem: No functionality without internet (Gemini API required)
- Blocks: Cover letter generation during travel/internet outages
- Impact: Users cannot use extension offline, poor reliability

**Cover Letter History:**
- Problem: No storage or retrieval of previously generated cover letters
- Blocks: Users cannot review or re-download past cover letters
- Impact: Lost work if PDF not saved, no audit trail

**Customization Options:**
- Problem: No user control over tone, length, or content of generated letters
- Blocks: Users with specific requirements (e.g., "more formal", "shorter")
- Impact: Generic output may not match user needs

**Multi-Platform Support:**
- Problem: Only Handshake supported despite content script running on all URLs
- Blocks: LinkedIn, Indeed, Glassdoor, company career sites
- Impact: Limited user base, manual job data entry required

## Test Coverage Gaps

**CV Extraction Pipeline:**
- What's not tested: PDF text extraction accuracy, DOCX parsing, hyperlink extraction, metadata extraction from Gemini
- Files: `utils/cvExtractor.js`, `utils/pdf.js`, `utils/mammoth.js`
- Risk: CV parsing fails silently or extracts incorrect data, leading to bad cover letters
- Priority: High - core feature

**PDF Generation:**
- What's not tested: Canvas rendering accuracy, multi-page splitting, link positioning, fallback PDF generation
- Files: `utils/pdfGenerator.js`, `utils/htmlGenerator.js`
- Risk: PDF output broken on certain content, fonts missing, layout issues
- Priority: High - user-facing output

**Gemini API Error Handling:**
- What's not tested: Rate limit handling, invalid API keys, quota exhaustion, malformed responses, network failures
- Files: `utils/gemini.js`
- Risk: API failures cause poor user experience, silent errors, confusing error messages
- Priority: High - critical integration

**Job Scraping:**
- What's not tested: DOM selector accuracy on real Handshake pages, fallback selectors, data cleaning
- Files: `content/content.js`
- Risk: Scraping fails silently, wrong data extracted, extension becomes unusable on Handshake updates
- Priority: Medium - changes frequently

**Storage State Management:**
- What's not tested: Storage synchronization, data integrity, migration scenarios, quota handling
- Files: `popup/popup.js`
- Risk: Corrupted storage, lost CV data, extension state inconsistencies
- Priority: Medium - data persistence

**UI State Transitions:**
- What's not tested: Loading states, error displays, button enable/disable logic, settings panel behavior
- Files: `popup/popup.js`
- Risk: Poor UX, confused users, broken workflows
- Priority: Low - visual, but important for adoption

---

*Concerns audit: 2026-02-05*
