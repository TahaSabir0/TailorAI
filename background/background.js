// Background Service Worker for TailorAI
// Handles API calls, message passing, and background tasks

console.log('TailorAI background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TailorAI extension installed');
    // Show welcome message or open onboarding page
    showWelcomeNotification();
  } else if (details.reason === 'update') {
    console.log('TailorAI extension updated');
  }
});

// Show welcome notification
function showWelcomeNotification() {
  // This can be enhanced in Stage 6
  console.log('Welcome to TailorAI!');
}

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);

  switch (request.action) {
    case 'generateCoverLetter':
      handleGenerateCoverLetter(request.data)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep the message channel open for async response

    case 'testApiKey':
      handleTestApiKey(request.apiKey)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle cover letter generation
async function handleGenerateCoverLetter(data) {
  console.log('Generating cover letter with data:', data);

  try {
    // This will be fully implemented in Stage 4
    // For now, return a placeholder response

    const { cvText, jobData, apiKey } = data;

    if (!cvText || !jobData || !apiKey) {
      throw new Error('Missing required data for cover letter generation');
    }

    // TODO: Implement OpenAI API call in Stage 4
    // const response = await callOpenAI(cvText, jobData, apiKey);

    return {
      success: true,
      message: 'Cover letter generation will be implemented in Stage 4',
      letterContent: 'Sample cover letter content will appear here...'
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

// Handle API key testing
async function handleTestApiKey(apiKey) {
  console.log('Testing API key...');

  try {
    // Basic validation
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format');
    }

    // TODO: Make a test call to OpenAI API in Stage 4
    // For now, just validate format
    return {
      success: true,
      message: 'API key format is valid'
    };
  } catch (error) {
    console.error('Error testing API key:', error);
    throw error;
  }
}

// Call OpenAI API (to be implemented in Stage 4)
async function callOpenAI(cvText, jobData, apiKey) {
  // This will be implemented in Stage 4
  console.log('callOpenAI will be implemented in Stage 4');

  const prompt = buildPrompt(cvText, jobData);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional cover letter writer. Write compelling, personalized cover letters based on the candidate\'s CV and the job posting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Build prompt for OpenAI
function buildPrompt(cvText, jobData) {
  return `
Based on the following CV and job posting, write a professional cover letter.

CV:
${cvText}

Job Posting:
Title: ${jobData.jobTitle}
Company: ${jobData.company || 'Not specified'}
Description:
${jobData.description}

Instructions:
- Write a professional cover letter tailored to this specific job
- Highlight relevant experience from the CV
- Show enthusiasm for the role and company
- Keep it concise (3-4 paragraphs)
- Use a professional but warm tone
- Do not include the address section or date (will be added during PDF generation)
- Start with "Dear Hiring Manager,"
- End with "Sincerely,"
`;
}

// Helper function to extract user name from CV (to be implemented in Stage 5)
function extractUserName(cvText) {
  // Simple extraction - can be improved
  // Try to find name in first few lines
  const lines = cvText.split('\n').slice(0, 5);
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for a line with 2-3 words, likely a name
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 3 && /^[A-Z]/.test(trimmed)) {
      return {
        firstName: words[0],
        lastName: words[words.length - 1]
      };
    }
  }
  return { firstName: 'User', lastName: 'Name' };
}
