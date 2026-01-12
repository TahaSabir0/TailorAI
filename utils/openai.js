// AI API integration utility for TailorAI
// Supports Google Gemini API for cover letter generation

/**
 * Generate cover letter using Gemini API
 */
async function generateCoverLetter(cvText, jobData, apiKey) {
  console.log('Generating cover letter with Gemini...');

  // Validate inputs
  if (!cvText) throw new Error('CV text is required');
  if (!jobData || !jobData.jobTitle) throw new Error('Job data is required');
  if (!apiKey) throw new Error('API key is required');

  // Build the prompt
  const prompt = buildCoverLetterPrompt(cvText, jobData);

  // Call Gemini API
  try {
    const response = await callGeminiAPI(prompt, apiKey);
    return response;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Build prompt for cover letter generation
 */
function buildCoverLetterPrompt(cvText, jobData) {
  const prompt = `You are a professional cover letter writer. Write a compelling, personalized cover letter based on the candidate's CV and the job posting provided below.

CANDIDATE'S CV:
${cvText}

JOB POSTING:
Title: ${jobData.jobTitle}
${jobData.company ? `Company: ${jobData.company}` : ''}
${jobData.location ? `Location: ${jobData.location}` : ''}
Description:
${jobData.description}

INSTRUCTIONS:
1. Write a professional cover letter tailored specifically to this job posting
2. Highlight the most relevant experience and skills from the CV that match the job requirements
3. Show genuine enthusiasm for the role and company
4. Use a professional yet warm and personable tone
5. Keep it concise - aim for 3-4 paragraphs (about 250-350 words)
6. Do NOT include:
   - Your contact information (will be added separately)
   - The date (will be added separately)
   - The company's address (will be added separately)
7. Start with "Dear Hiring Manager," (or use the hiring manager's name if mentioned in the job posting)
8. End with "Sincerely," (signature will be added separately)
9. Focus on specific achievements and how they relate to the job requirements
10. Avoid generic statements - make it specific to this role and company

Please write the cover letter now:`;

  return prompt;
}

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(prompt, apiKey) {
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
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);

    // Provide more helpful error messages
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key in settings.');
    } else if (error.message.includes('RATE_LIMIT') || error.message.includes('429')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.message.includes('QUOTA') || error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please check your Google Cloud billing.');
    } else {
      throw error;
    }
  }
}

/**
 * Test API key validity
 */
async function testAPIKey(apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);

    if (response.ok) {
      return { valid: true, message: 'API key is valid' };
    } else {
      const error = await response.json();
      return { valid: false, message: error.error?.message || 'Invalid API key' };
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return { valid: false, message: 'Failed to validate API key' };
  }
}

/**
 * Validate API key format (Gemini keys start with AIza)
 */
function validateAPIKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, message: 'API key is required' };
  }

  if (!apiKey.startsWith('AIza')) {
    return { valid: false, message: 'Gemini API keys should start with "AIza"' };
  }

  if (apiKey.length < 30) {
    return { valid: false, message: 'API key appears to be too short' };
  }

  return { valid: true };
}
