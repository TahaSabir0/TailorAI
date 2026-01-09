// CV Text Extraction utility for TailorAI
// Extracts text from PDF and DOCX files

/**
 * Extract text from uploaded CV file
 * This will be fully implemented in Stage 2 when libraries are added
 */
async function extractTextFromCV(file) {
  console.log('Extracting text from CV:', file.name, file.type);

  const fileType = file.type;

  try {
    if (fileType === 'application/pdf') {
      return await extractFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractFromDOCX(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }
  } catch (error) {
    console.error('Error extracting text from CV:', error);
    throw error;
  }
}

/**
 * Extract text from PDF file using PDF.js
 */
async function extractFromPDF(file) {
  console.log('Extracting text from PDF:', file.name);

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);

    // Import PDF.js dynamically
    const pdfjsLib = await import(chrome.runtime.getURL('libs/pdf.min.mjs'));

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.mjs');

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    console.log('PDF loaded. Number of pages:', pdf.numPages);

    // Extract text from all pages
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    console.log('PDF text extracted. Length:', fullText.length);
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

/**
 * Extract text from DOCX file using Mammoth.js
 */
async function extractFromDOCX(file) {
  console.log('Extracting text from DOCX:', file.name);

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);

    // Extract text using Mammoth.js
    // Note: mammoth is loaded globally from the script tag in popup.html
    if (typeof mammoth === 'undefined') {
      throw new Error('Mammoth.js library not loaded');
    }

    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    const text = result.value;

    console.log('DOCX text extracted. Length:', text.length);

    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth.js warnings:', result.messages);
    }

    return text.trim();
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX: ' + error.message);
  }
}

/**
 * Read file as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as text
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
}

/**
 * Extract user name from CV text
 */
function extractNameFromCV(cvText) {
  // Try to extract first and last name from CV
  // Usually the name is in the first few lines

  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Look for a line that looks like a name (2-3 words, capitalized)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const words = line.split(/\s+/);

    // Check if this looks like a name
    if (words.length >= 2 && words.length <= 4) {
      // Check if words start with capital letters
      const allCapitalized = words.every(word =>
        word.length > 0 && /^[A-Z]/.test(word) && /^[A-Za-z-']+$/.test(word)
      );

      if (allCapitalized && line.length < 50) {
        return {
          firstName: words[0],
          lastName: words[words.length - 1],
          fullName: line
        };
      }
    }
  }

  // Fallback: return generic name
  return {
    firstName: 'User',
    lastName: 'Name',
    fullName: 'User Name'
  };
}

/**
 * Validate CV text
 */
function validateCVText(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: 'Invalid CV text' };
  }

  if (text.trim().length < 100) {
    return { valid: false, message: 'CV text is too short. Please ensure the file was uploaded correctly.' };
  }

  if (text.length > 50000) {
    return { valid: false, message: 'CV text is too long. Please use a shorter CV (max ~10 pages).' };
  }

  return { valid: true };
}

/**
 * Create CV metadata object
 */
function createCVMetadata(fileName, cvText) {
  const nameInfo = extractNameFromCV(cvText);

  return {
    fileName: fileName,
    uploadDate: new Date().toISOString(),
    firstName: nameInfo.firstName,
    lastName: nameInfo.lastName,
    fullName: nameInfo.fullName,
    textLength: cvText.length,
    wordCount: cvText.split(/\s+/).length
  };
}
