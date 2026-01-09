// OpenAI API integration utility for TailorAI
// Handles API calls to OpenAI for cover letter generation

/**
 * Generate cover letter using OpenAI API
 * This will be fully implemented in Stage 4
 */
async function generateCoverLetter(cvText, jobData, apiKey) {
  console.log('generateCoverLetter will be implemented in Stage 4');

  // Validate inputs
  if (!cvText) throw new Error('CV text is required');
  if (!jobData || !jobData.jobTitle) throw new Error('Job data is required');
  if (!apiKey) throw new Error('API key is required');

  // Build the prompt
  const prompt = buildCoverLetterPrompt(cvText, jobData);

  // Call OpenAI API
  try {
    const response = await callOpenAIAPI(prompt, apiKey);
    return response;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Build prompt for OpenAI
 */
function buildCoverLetterPrompt(cvText, jobData) {
  const prompt = `
You are a professional cover letter writer. Write a compelling, personalized cover letter based on the candidate's CV and the job posting provided below.

CANDIDATE'S CV:
${cvText}

JOB POSTING:
Title: ${jobData.jobTitle}
${jobData.company ? `Company: ${jobData.company}` : ''}
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

Please write the cover letter now:
`;

  return prompt;
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAIAPI(prompt, apiKey, options = {}) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const defaultOptions = {
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000
  };

  const settings = { ...defaultOptions, ...options };

  const requestBody = {
    model: settings.model,
    messages: [
      {
        role: 'system',
        content: 'You are a professional cover letter writer with expertise in tailoring applications to specific job postings. You write compelling, personalized cover letters that highlight relevant experience and show genuine enthusiasm.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: settings.temperature,
    max_tokens: settings.max_tokens
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);

    // Provide more helpful error messages
    if (error.message.includes('401')) {
      throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
    } else if (error.message.includes('429')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.message.includes('insufficient_quota')) {
      throw new Error('Insufficient API quota. Please check your OpenAI account balance.');
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
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

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
 * Validate API key format
 */
function validateAPIKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, message: 'API key is required' };
  }

  if (!apiKey.startsWith('sk-')) {
    return { valid: false, message: 'OpenAI API keys should start with "sk-"' };
  }

  if (apiKey.length < 20) {
    return { valid: false, message: 'API key appears to be too short' };
  }

  return { valid: true };
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokenCount(text) {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Check if CV and job description will fit in context
 */
function checkTokenLimit(cvText, jobDescription) {
  const cvTokens = estimateTokenCount(cvText);
  const jobTokens = estimateTokenCount(jobDescription);
  const promptTokens = 500; // Overhead for system message and instructions
  const responseTokens = 1000; // Max tokens for response

  const totalTokens = cvTokens + jobTokens + promptTokens + responseTokens;
  const maxTokens = 8000; // Conservative limit for GPT-4

  if (totalTokens > maxTokens) {
    return {
      withinLimit: false,
      totalTokens,
      maxTokens,
      message: 'CV or job description is too long. Please use a shorter CV or try a different job posting.'
    };
  }

  return { withinLimit: true, totalTokens, maxTokens };
}
