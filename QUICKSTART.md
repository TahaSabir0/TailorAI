# TailorAI - Quick Start Guide

## Stage 1: Testing the Basic Extension

### Step 1: Generate Icons

1. Open `assets/icons/generate_icons.html` in Chrome
2. Click "Download All Icons"
3. The files will download to your Downloads folder
4. Move `icon16.png`, `icon48.png`, and `icon128.png` to the `assets/icons/` folder

### Step 2: Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Navigate to and select the `TailorAI` folder
6. The extension should appear with the TailorAI icon

### Step 3: Test the Extension

1. **Test Popup Opens**:
   - Click the TailorAI icon in Chrome toolbar
   - Popup should open showing the main interface
   - You should see:
     - "TailorAI" header with settings icon
     - Status message: "Upload your CV to get started"
     - Disabled "Tailor" button
     - Hint text below button

2. **Test Settings Panel**:
   - Click the gear (⚙️) icon
   - Settings panel should appear
   - You should see:
     - CV upload section
     - API key input field
     - Links and help text

3. **Test API Key Save**:
   - In settings, enter a test API key (format: `sk-test123`)
   - Click "Save API Key"
   - You should see a success message
   - Reload the extension popup
   - Click settings again
   - The API key should still be there (persisted)

4. **Test Close Settings**:
   - Click the X button to close settings
   - Settings panel should disappear

### Step 4: Check Console (No Errors)

1. Right-click the extension icon
2. Select "Inspect popup"
3. Check the Console tab
4. You should see:
   - No error messages
   - May see info logs like "TailorAI background service worker loaded"

### Step 5: Test Content Script

1. Go to any website (e.g., linkedin.com/jobs)
2. Open DevTools (F12)
3. Check Console
4. You should see: "TailorAI content script loaded"

## Verification Checklist

- [ ] Icons generated and placed in correct folder
- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Extension icon appears in Chrome toolbar
- [ ] Clicking icon opens popup
- [ ] Popup displays correctly with no layout issues
- [ ] Settings panel opens and closes
- [ ] API key can be saved and persists
- [ ] "Tailor" button is disabled (expected - no CV uploaded yet)
- [ ] No console errors in popup inspector
- [ ] Content script loads on websites
- [ ] Background service worker is running (check in chrome://extensions/)

## Known Limitations in Stage 1

These are expected and will be implemented in later stages:

- ✗ Cannot upload CV yet (Stage 2)
- ✗ "Tailor" button doesn't work yet (Stage 3-5)
- ✗ No actual cover letter generation (Stage 4)
- ✗ No PDF download (Stage 5)
- ✗ Placeholder messages for unimplemented features

## Next Steps

Once Stage 1 is verified:

1. **Stage 2**: Implement CV upload and text extraction
   - Add PDF.js library for PDF extraction
   - Add Mammoth.js for DOCX extraction
   - Implement file upload handling
   - Store CV data in chrome.storage.local

2. **Stage 3**: Implement job posting extraction
   - Test on LinkedIn, Indeed, Glassdoor
   - Refine extraction logic
   - Test message passing

3. **Stage 4**: Add OpenAI integration
   - Implement API calls
   - Add error handling
   - Test cover letter generation

4. **Stage 5**: Add PDF generation
   - Integrate jsPDF
   - Create formatting templates
   - Implement auto-download

## Troubleshooting

### Extension won't load
- Check that all files are in the correct folders
- Ensure icons exist in `assets/icons/`
- Look for red errors in `chrome://extensions/`

### Popup doesn't open
- Check that manifest.json is valid
- Ensure popup.html exists in popup/ folder
- Check browser console for errors

### Settings don't save
- Check Chrome DevTools console for errors
- Verify `storage` permission in manifest.json
- Try clearing extension storage and reloading

### Content script not loading
- Check that content.js exists in content/ folder
- Verify it's listed in manifest.json
- Check for JavaScript errors in the file

## Development Tips

### Making Changes

After editing any file:
1. Go to `chrome://extensions/`
2. Click the refresh (↻) icon on TailorAI
3. Close and reopen the popup to see changes
4. For content script changes, reload the webpage

### Debugging

- **Popup**: Right-click extension icon → "Inspect popup"
- **Background**: `chrome://extensions/` → "Inspect views: background page"
- **Content Script**: Open DevTools (F12) on any webpage

### Common Issues

1. **Changes not appearing**: Refresh the extension
2. **Console errors**: Check file paths and syntax
3. **Storage not working**: Check permissions in manifest.json

---

## Stage 1 Complete! ✅

If all checklist items pass, Stage 1 is complete and you're ready to move to Stage 2.

**What we built:**
- Complete Chrome extension structure
- Beautiful popup UI with gradient design
- Settings panel with CV upload and API key inputs
- Background service worker for orchestration
- Content script for page data extraction
- Utility modules ready for implementation
- Comprehensive documentation

**Ready for Stage 2!**

---

## Stage 2: CV Upload and Text Extraction

### What's New in Stage 2

Stage 2 implements the CV upload functionality, allowing users to upload PDF or DOCX files and extract text from them.

**Features Implemented:**
- PDF.js library integration for PDF text extraction
- Mammoth.js library integration for DOCX text extraction
- File upload handling with validation
- CV text storage in chrome.storage.local
- CV metadata extraction (name, upload date, file info)
- CV status display in settings
- Delete CV functionality

### Step 1: Reload the Extension

After implementing Stage 2:

1. Go to `chrome://extensions/`
2. Click the refresh (↻) icon on TailorAI
3. Verify no errors appear

### Step 2: Test PDF Upload

1. **Prepare a Test PDF CV**:
   - Use your own PDF CV, or
   - Create a simple test PDF with your name and some text

2. **Upload the PDF**:
   - Click the TailorAI extension icon
   - Click the settings (⚙️) icon
   - Click "Choose CV File"
   - Select your PDF file
   - Wait for processing (you should see "Processing CV...")

3. **Verify Success**:
   - You should see "CV uploaded successfully!" message
   - CV status should display:
     - File name
     - Upload date
     - Extracted name from CV
   - "Delete CV" button should appear
   - Main status should change to "✅ Ready to generate cover letters!"
   - "Tailor" button should become enabled

4. **Check Console**:
   - Right-click extension icon → "Inspect popup"
   - Check Console tab
   - Should see logs like:
     - "Extracting text from PDF: [filename]"
     - "PDF loaded. Number of pages: X"
     - "PDF text extracted. Length: XXXX"
     - "CV uploaded successfully: {metadata}"

### Step 3: Test DOCX Upload

1. **Prepare a Test DOCX CV**:
   - Use your own DOCX CV, or
   - Create a simple Word document with your name and text
   - Save as .docx format

2. **Delete Previous CV**:
   - Click "Delete CV" button
   - Confirm deletion
   - Verify CV status shows "No CV uploaded yet"

3. **Upload the DOCX**:
   - Click "Choose CV File"
   - Select your DOCX file
   - Wait for processing

4. **Verify Success**:
   - Same verification steps as PDF upload
   - Should see "DOCX text extracted" in console

### Step 4: Test File Validation

Test that the extension properly validates uploaded files:

1. **Test Invalid File Type**:
   - Try uploading a .txt or .jpg file
   - Should see error: "Please upload a PDF or DOCX file"

2. **Test Large File**:
   - Try uploading a file larger than 10MB (if you have one)
   - Should see error: "File size must be less than 10MB"

3. **Test Empty/Corrupted File**:
   - Try uploading a very small or corrupted PDF/DOCX
   - Should see error about file being too short or extraction failure

### Step 5: Test CV Persistence

1. **Upload a CV** (PDF or DOCX)
2. **Close the popup** (click outside or close)
3. **Reopen the popup**
4. **Verify**:
   - Status still shows "✅ Ready to generate cover letters!"
   - "Tailor" button is enabled
5. **Open settings**
6. **Verify**:
   - CV information is still displayed
   - All metadata persists (name, date, filename)

### Step 6: Test Delete CV

1. **With a CV uploaded**:
   - Open settings
   - Click "Delete CV"
   - Confirm the deletion dialog

2. **Verify Deletion**:
   - CV status shows "No CV uploaded yet"
   - "Delete CV" button disappears
   - Main status changes to "ℹ️ Upload your CV to get started"
   - "Tailor" button becomes disabled

3. **Verify Storage Cleared**:
   - Close and reopen popup
   - Verify CV is still deleted (not restored)

## Stage 2 Verification Checklist

- [ ] Extension reloads without errors
- [ ] Can upload PDF file successfully
- [ ] PDF text extraction works (check console logs)
- [ ] Can upload DOCX file successfully
- [ ] DOCX text extraction works (check console logs)
- [ ] Invalid file types are rejected with proper error
- [ ] Large files (>10MB) are rejected
- [ ] CV metadata is correctly extracted (name, date, filename)
- [ ] CV status displays correctly in settings
- [ ] "Tailor" button becomes enabled after upload
- [ ] Main status updates to "Ready to generate cover letters!"
- [ ] CV data persists after closing/reopening popup
- [ ] Delete CV functionality works
- [ ] After deletion, "Tailor" button becomes disabled
- [ ] No console errors during upload/delete operations

## Known Limitations in Stage 2

These are expected and will be implemented in later stages:

- ✓ Can upload and store CV (Stage 2 - COMPLETE)
- ✗ "Tailor" button still doesn't generate cover letters (Stage 3-5)
- ✗ No job posting extraction yet (Stage 3)
- ✗ No OpenAI integration yet (Stage 4)
- ✗ No PDF download yet (Stage 5)

## Troubleshooting Stage 2

### PDF Upload Fails

**Problem**: "Failed to extract text from PDF" error

**Solutions**:
- Check console for specific error messages
- Verify PDF is not password-protected
- Verify PDF contains text (not just scanned images)
- Try a different PDF file
- Check that `libs/pdf.min.mjs` and `libs/pdf.worker.min.mjs` exist

### DOCX Upload Fails

**Problem**: "Failed to extract text from DOCX" error

**Solutions**:
- Check console for error: "Mammoth.js library not loaded"
- Verify `libs/mammoth.browser.min.js` exists
- Check that file is valid .docx format (not .doc)
- Try re-saving file in Word as .docx
- Try a different DOCX file

### Name Not Extracted Correctly

**Problem**: CV shows "User Name" instead of actual name

**Explanation**: The name extraction looks for a capitalized name in the first few lines. If your CV has a different format, it may not detect the name correctly.

**Workaround**: This is cosmetic only and doesn't affect functionality. The CV text is still stored correctly.

### Console Errors About Module Loading

**Problem**: Errors about "import" or "module" in console

**Solutions**:
- Verify `manifest.json` has `web_accessible_resources` configured
- Check that library files are in the `libs/` folder
- Reload the extension completely
- Clear browser cache and reload

### CV Status Not Persisting

**Problem**: CV disappears after closing popup

**Solutions**:
- Check browser console for storage errors
- Verify `storage` permission in manifest.json
- Try clearing extension storage: Chrome DevTools → Application → Storage → Clear site data
- Re-upload CV

## Next Steps

Once Stage 2 is verified:

**Stage 3**: Implement job posting extraction
- Extract job description from current webpage
- Support LinkedIn, Indeed, Glassdoor
- Test message passing between content script and popup

**Stage 4**: Add OpenAI integration
- Implement API calls to OpenAI
- Generate cover letters based on CV and job posting
- Add error handling and rate limiting

**Stage 5**: Add PDF generation
- Integrate jsPDF library
- Format cover letter as PDF
- Implement auto-download functionality

---

## Stage 2 Complete! ✅

If all checklist items pass, Stage 2 is complete and you're ready to move to Stage 3.

**What we built in Stage 2:**
- PDF text extraction using PDF.js
- DOCX text extraction using Mammoth.js
- Full CV upload flow with validation
- CV data persistence in Chrome storage
- Name extraction from CV text
- CV metadata tracking
- Delete CV functionality
- Proper error handling and user feedback

**Ready for Stage 3!**
