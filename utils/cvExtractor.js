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
 * Create CV metadata object using Gemini API for structured extraction
 */
async function createCVMetadata(fileName, cvText, apiKey) {
  // Extract structured data from CV using Gemini
  const structuredData = await extractStructuredCVData(cvText, apiKey);

  return {
    // Personal Information
    firstName: structuredData.firstName,
    lastName: structuredData.lastName,
    fullName: structuredData.fullName,
    email: structuredData.email,
    phoneNumber: structuredData.phoneNumber,

    // Professional Links
    github: structuredData.github,
    linkedin: structuredData.linkedin,
    portfolio: structuredData.portfolio,

    // Resume Content
    fullText: cvText,
    resumeBody: structuredData.resumeBody,

    // File Metadata
    fileName: fileName,
    uploadDate: new Date().toISOString(),
    textLength: cvText.length,
    wordCount: cvText.split(/\s+/).length
  };
}

/**
 * Extract structured data from CV using Gemini API
 */
async function extractStructuredCVData(cvText, apiKey) {
  const prompt = `You are a resume parser. Extract the following information from this resume and return it as a valid JSON object.

RESUME TEXT:
${cvText}

Extract the following fields:
1. firstName (string) - First name only
2. lastName (string) - Last name only
3. fullName (string) - Full name as it appears
4. email (string) - Email address
5. phoneNumber (string or null) - Phone number if present, otherwise null
6. github (string or null) - GitHub profile URL if present, otherwise null
7. linkedin (string or null) - LinkedIn profile URL if present, otherwise null
8. portfolio (string or null) - Personal website/portfolio URL if present, otherwise null
9. resumeBody (string) - The entire resume text EXCEPT the header section (exclude name, contact info, and links from the top)

IMPORTANT RULES:
- Return ONLY valid JSON, no markdown formatting, no explanations
- Use null for missing optional fields, not empty strings
- For resumeBody, remove the header/contact section but keep everything else (experience, education, skills, etc.)
- Ensure all URLs are complete (include https://)
- If you can't find a required field (firstName, lastName, fullName, email), use a placeholder like "Unknown"

Return the JSON now:`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent extraction
        maxOutputTokens: 2000
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    let responseText = data.candidates[0].content.parts[0].text.trim();

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const extractedData = JSON.parse(responseText);

    // Validate required fields
    if (!extractedData.firstName || !extractedData.lastName || !extractedData.email) {
      console.warn('Some required fields are missing from Gemini extraction');
    }

    return extractedData;
  } catch (error) {
    console.error('Error extracting structured CV data:', error);

    // Fallback to basic extraction if Gemini fails
    console.log('Falling back to basic extraction...');
    const nameInfo = extractNameFromCV(cvText);

    return {
      firstName: nameInfo.firstName,
      lastName: nameInfo.lastName,
      fullName: nameInfo.fullName,
      email: extractEmailFromCV(cvText),
      phoneNumber: extractPhoneFromCV(cvText),
      github: null,
      linkedin: null,
      portfolio: null,
      resumeBody: cvText // Use full text as fallback
    };
  }
}

/**
 * Fallback: Extract email from CV text using regex
 */
function extractEmailFromCV(cvText) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = cvText.match(emailRegex);
  return match ? match[0] : 'no-email@example.com';
}

/**
 * Fallback: Extract phone number from CV text using regex
 */
function extractPhoneFromCV(cvText) {
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = cvText.match(phoneRegex);
  return match ? match[0] : null;
}
