// PDF Generator utility for TailorAI
// Creates formatted PDF cover letters using jsPDF

/**
 * Generate PDF from cover letter content
 * This will be fully implemented in Stage 5 when jsPDF is added
 */
async function generateCoverLetterPDF(letterContent, metadata, jobTitle) {
  console.log('generateCoverLetterPDF called - will be implemented in Stage 5');

  // TODO: Install jsPDF library
  // TODO: Format letter content
  // TODO: Add professional styling
  // TODO: Generate PDF blob
  // TODO: Return PDF for download

  return {
    success: false,
    message: 'PDF generation will be implemented in Stage 5'
  };
}

/**
 * Format filename for PDF download
 * Format: [FirstName]-[LastName]-[JobTitle]-CoverLetter.pdf
 */
function formatPDFFilename(firstName, lastName, jobTitle) {
  // Clean and format names
  const cleanFirstName = cleanForFilename(firstName);
  const cleanLastName = cleanForFilename(lastName);
  const cleanJobTitle = cleanForFilename(jobTitle);

  // Build filename
  const filename = `${cleanFirstName}-${cleanLastName}-${cleanJobTitle}-CoverLetter.pdf`;

  return filename;
}

/**
 * Clean text for use in filename
 */
function cleanForFilename(text) {
  if (!text) return 'Unknown';

  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 50); // Limit length
}

/**
 * Create PDF document with professional formatting
 * This is a placeholder for Stage 5 implementation
 */
function createFormattedPDF(letterContent, userInfo) {
  // This will use jsPDF in Stage 5
  console.log('PDF formatting will be implemented in Stage 5');

  // Structure:
  // 1. Header with user's contact info
  // 2. Date
  // 3. Recipient address (if available)
  // 4. Letter body
  // 5. Signature section

  return null;
}

/**
 * Download PDF file
 */
async function downloadPDF(pdfBlob, filename) {
  try {
    // Convert blob to data URL for Chrome downloads API
    const url = URL.createObjectURL(pdfBlob);

    // Use Chrome downloads API
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false // Auto-download without prompt
    });

    console.log('PDF download initiated:', filename);

    // Clean up the object URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return { success: true, filename: filename };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Extract contact information from CV text
 * Used for PDF header
 */
function extractContactInfo(cvText) {
  // This is a simple extraction - can be improved
  const lines = cvText.split('\n').filter(line => line.trim());

  const contactInfo = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  // Look for email
  const emailMatch = cvText.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) contactInfo.email = emailMatch[0];

  // Look for phone
  const phoneMatch = cvText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) contactInfo.phone = phoneMatch[0];

  // Name is usually in first few lines
  if (lines.length > 0) {
    contactInfo.name = lines[0].trim();
  }

  return contactInfo;
}
