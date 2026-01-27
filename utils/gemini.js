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
 * Call Google Gemini API with retry logic for rate limits
 */
async function callGeminiAPI(prompt, apiKey, maxRetries = 3) {
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

  let lastError;

  console.log('%c=== Gemini API Debug Info ===', 'color: #FF5722; font-weight: bold;');
  console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('API Key length:', apiKey.length);
  console.log('Request URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries}...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle rate limiting with retry
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        console.log('%cRate limit response body:', 'color: orange;', errorData);
        const waitTime = Math.pow(2, attempt) * 2000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Rate limited. Retrying in ${waitTime / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log('%cAPI Error Response:', 'color: red;', errorData);
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      lastError = error;
      console.error(`Gemini API error (attempt ${attempt + 1}):`, error);

      // Check if it's a rate limit error in the message
      if (error.message.includes('RATE_LIMIT') || error.message.includes('429') || error.message.includes('Resource has been exhausted')) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Rate limited. Retrying in ${waitTime / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(waitTime);
          continue;
        }
      }

      // For non-rate-limit errors, throw immediately
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
        throw new Error('Invalid API key. Please check your Gemini API key in settings.');
      } else if (error.message.includes('QUOTA') || error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Google Cloud billing.');
      }
    }
  }

  // If we've exhausted retries
  throw new Error('Rate limit exceeded. Please wait a minute and try again.');
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

/**
 * Debug function to test API key and diagnose issues
 * Call this from the browser console: testGeminiAPIKey('YOUR_API_KEY')
 */
async function debugGeminiAPI(apiKey) {
  console.log('%c=== Gemini API Diagnostic Test ===', 'color: #4CAF50; font-size: 16px; font-weight: bold;');

  // Step 1: Validate format
  console.log('\n%c1. Checking API key format...', 'color: #2196F3; font-weight: bold;');
  const formatCheck = validateAPIKeyFormat(apiKey);
  if (!formatCheck.valid) {
    console.log('%c❌ Format invalid:', 'color: red;', formatCheck.message);
    return;
  }
  console.log('%c✓ Format looks valid', 'color: green;');
  console.log('  Key starts with:', apiKey.substring(0, 10) + '...');
  console.log('  Key length:', apiKey.length);

  // Step 2: Test list models endpoint (lightweight test)
  console.log('\n%c2. Testing API key with list models endpoint...', 'color: #2196F3; font-weight: bold;');
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (listResponse.ok) {
      console.log('%c✓ API key is valid!', 'color: green;');
      console.log('  Available models:', listData.models?.map(m => m.name).slice(0, 5).join(', ') + '...');
    } else {
      console.log('%c❌ API key test failed:', 'color: red;');
      console.log('  Status:', listResponse.status);
      console.log('  Error:', listData.error?.message || listData);

      if (listData.error?.message?.includes('API_KEY_INVALID')) {
        console.log('%c\n💡 FIX: Your API key is invalid. Generate a new one at:', 'color: orange;');
        console.log('   https://aistudio.google.com/app/apikey');
      }
      if (listData.error?.message?.includes('API has not been used') || listData.error?.message?.includes('disabled')) {
        console.log('%c\n💡 FIX: Enable the Generative Language API at:', 'color: orange;');
        console.log('   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      }
      return;
    }
  } catch (error) {
    console.log('%c❌ Network error:', 'color: red;', error.message);
    return;
  }

  // Step 3: Test actual generation endpoint
  console.log('\n%c3. Testing generation endpoint (simple request)...', 'color: #2196F3; font-weight: bold;');
  try {
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const genResponse = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "test successful" in exactly 2 words.' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    const genData = await genResponse.json();

    console.log('  Status:', genResponse.status);

    if (genResponse.ok) {
      console.log('%c✓ Generation works!', 'color: green;');
      console.log('  Response:', genData.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log('%c❌ Generation failed:', 'color: red;');
      console.log('  Error:', genData.error?.message || genData);

      if (genResponse.status === 429) {
        console.log('%c\n💡 This is a RATE LIMIT error. Possible causes:', 'color: orange;');
        console.log('   1. You\'ve exceeded the free tier limits (15 RPM)');
        console.log('   2. Your quota is exhausted for today');
        console.log('   3. Try waiting 1-2 minutes and run this test again');
        console.log('   4. Check your quota at: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas');
      }
      if (genData.error?.message?.includes('QUOTA') || genData.error?.message?.includes('quota')) {
        console.log('%c\n💡 QUOTA EXCEEDED. Your daily/monthly quota is used up.', 'color: orange;');
        console.log('   Check billing: https://console.cloud.google.com/billing');
      }
    }
  } catch (error) {
    console.log('%c❌ Network error:', 'color: red;', error.message);
  }

  console.log('\n%c=== End Diagnostic ===', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
}

// Make debug function available globally for console testing
if (typeof window !== 'undefined') {
  window.debugGeminiAPI = debugGeminiAPI;
}
