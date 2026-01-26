# TailorAI - AI-Powered Cover Letter Generator

A Chrome extension that generates personalized cover letters from job postings with a single click using AI.

## Features

- **One-Click Generation**: Generate tailored cover letters instantly while viewing job postings
- **AI-Powered**: Uses Google Gemini to create professional, personalized content
- **Smart Extraction**: Automatically extracts job details from Handshake
- **PDF Export**: Downloads formatted cover letters as PDF with smart naming
- **Privacy-First**: All data stored locally in your browser
- **Easy Setup**: Simple CV upload and API key configuration

## Current Status

**Stage 1: COMPLETE** ✅
- Basic Chrome extension structure
- Popup UI with settings panel
- Background service worker
- Content script for page data extraction
- Utility modules (storage, PDF generator, CV extractor, OpenAI integration)

**Upcoming Stages:**
- Stage 2: CV Upload & Storage System
- Stage 3: Job Posting Content Extraction
- Stage 4: OpenAI Integration & Cover Letter Generation
- Stage 5: PDF Generation & Download
- Stage 6: Polish, Error Handling & UX
- Stage 7: Optional Enhancements

## Installation (Development Mode)

### Prerequisites

- Google Chrome browser
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Setup Steps

1. **Clone or Download** this repository to your local machine

2. **Generate Icons** (temporary solution for Stage 1):
   - Open `assets/icons/generate_icons.html` in your browser
   - Click "Download All Icons"
   - Move the downloaded icons to `assets/icons/` folder
   - OR follow instructions in `assets/icons/ICONS_README.txt`

3. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `TailorAI` folder
   - The extension should now appear in your extensions list

4. **Configure the Extension**:
   - Click the TailorAI icon in your Chrome toolbar
   - Click the settings (gear) icon
   - Add your Gemini API key
   - Upload your CV (PDF or DOCX)

## Usage

### First-Time Setup

1. Click the TailorAI extension icon
2. Open settings (gear icon)
3. Upload your CV (PDF or DOCX format)
4. Add your Gemini API key
5. Click "Save"

### Generating a Cover Letter

1. Navigate to a Handshake job posting page
2. Click the TailorAI extension icon
3. Click the "Tailor" button
4. Wait for the AI to generate your cover letter
5. The cover letter will automatically download as a PDF

### PDF Naming Convention

Generated PDFs are automatically named:
```
[YourFirstName]-[YourLastName]-[JobTitle]-CoverLetter.pdf
```

Example: `John-Doe-Software-Engineer-CoverLetter.pdf`

## Project Structure

```
TailorAI/
├── manifest.json                 # Extension configuration (Manifest V3)
├── popup/
│   ├── popup.html               # Extension popup UI
│   ├── popup.css                # Popup styling
│   └── popup.js                 # Popup logic and event handlers
├── background/
│   └── background.js            # Service worker (API calls, orchestration)
├── content/
│   └── content.js               # Content script (extracts job data from pages)
├── utils/
│   ├── pdfGenerator.js          # PDF creation and formatting
│   ├── cvExtractor.js           # CV text extraction (PDF/DOCX)
│   └── gemini.js                # Google Gemini API integration
├── assets/
│   └── icons/                   # Extension icons (16x16, 48x48, 128x128)
└── README.md                    # This file
```

## Development Stages

This project is being built incrementally in stages:

### Stage 1: Project Setup ✅ COMPLETE
- Chrome extension skeleton with Manifest V3
- Basic popup UI with settings panel
- Placeholder utility modules

### Stage 2: CV Upload & Storage (Next)
- File upload (PDF/DOCX support)
- Text extraction from CV files
- Local storage implementation
- CV management (upload, delete, re-upload)

### Stage 3: Job Posting Extraction
- Content extraction from job pages
- Support for LinkedIn, Indeed, Glassdoor
- Fallback for generic websites
- Message passing between components

### Stage 4: OpenAI Integration
- API key management
- Prompt engineering
- Cover letter generation
- Error handling and rate limiting

### Stage 5: PDF Generation
- jsPDF integration
- Professional PDF formatting
- Smart filename generation
- Auto-download functionality

### Stage 6: Polish & UX
- Enhanced error handling
- Loading states and feedback
- Input validation
- Documentation and help

### Stage 7: Future Enhancements
- Letter history
- Multiple CV profiles
- Template selection
- Manual editing
- Advanced customization

## Technical Details

### Technologies Used

- **Chrome Extension API** (Manifest V3)
- **Google Gemini API** (gemini-2.0-flash for letter generation)
- **Chrome Storage API** (Local storage)
- **jsPDF** (PDF generation)
- **pdf.js** (PDF text extraction)
- **mammoth.js** (DOCX text extraction)
- **Vanilla JavaScript** (No framework dependencies)

### Permissions Required

- `storage` - Store CV data and settings locally
- `activeTab` - Access current tab to extract job posting
- `scripting` - Inject content script for data extraction
- `downloads` - Auto-download generated PDF files
- `host_permissions` - Access job posting websites

### Data Storage

All data is stored locally using Chrome's storage API:

```javascript
{
  cvText: "Your CV text content...",
  cvMetadata: {
    fileName: "Resume.pdf",
    uploadDate: "2026-01-09T10:30:00Z",
    firstName: "John",
    lastName: "Doe"
  },
  openaiApiKey: "AIza...",
  settings: {
    letterTone: "professional",
    includeSignature: true
  }
}
```

### Privacy & Security

- **No External Servers**: All processing happens locally or via Gemini API only
- **No Data Sharing**: Your CV and cover letters are never shared with third parties
- **Local Storage**: All data stored in your browser's local storage
- **Secure API**: Gemini API key stored locally and never exposed
- **HTTPS Only**: All API calls use secure HTTPS connections

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (it starts with `AIza`)
5. Paste it into TailorAI settings

**Note**: Gemini API has a generous free tier. Check [Google AI Pricing](https://ai.google.dev/pricing) for current rates and limits.

## Supported Job Boards

TailorAI currently supports:

- **Handshake** (fully supported)

More job boards coming soon!

## Troubleshooting

### Extension won't load
- Make sure Developer Mode is enabled in `chrome://extensions/`
- Check that all required files are present
- Look for errors in the Chrome Extensions page

### Icons not showing
- Follow instructions in `assets/icons/ICONS_README.txt` to generate icons
- Or use the `generate_icons.html` tool

### Can't upload CV
- Ensure file is PDF or DOCX format
- Check file size is under 10MB
- Try a different file

### Cover letter not generating
- Verify Gemini API key is correct (starts with "AIza")
- Check you haven't exceeded your API quota
- Ensure you're on a Handshake job posting page

### PDF not downloading (Stage 5+)
- Check Chrome's download settings
- Ensure `downloads` permission is granted
- Look for errors in Chrome DevTools console

## Development

### Testing

To test the extension during development:

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the TailorAI extension
4. Test the changes

### Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Background Script**: Go to `chrome://extensions/` → Click "Inspect views: background page"
- **Content Script**: Open DevTools on any webpage (F12)

### Building for Production

Coming in Stage 6 - will include:
- Minification of JS/CSS
- Icon optimization
- Version bumping
- Chrome Web Store packaging

## Contributing

This is currently a personal project built in stages. Once Stage 6 is complete, contributions will be welcome!

## Roadmap

- [x] Stage 1: Project Setup
- [ ] Stage 2: CV Upload & Storage
- [ ] Stage 3: Job Posting Extraction
- [ ] Stage 4: OpenAI Integration
- [ ] Stage 5: PDF Generation
- [ ] Stage 6: Polish & UX
- [ ] Stage 7: Future Enhancements

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the code comments for implementation details
3. Check Chrome DevTools console for error messages

## Changelog

### Version 1.0.0 (Stage 1 - In Progress)
- Initial project structure
- Basic Chrome extension setup
- Popup UI with settings panel
- Placeholder utility modules
- Development documentation

---

**Built with ❤️ using Claude Code and OpenAI GPT-4**
