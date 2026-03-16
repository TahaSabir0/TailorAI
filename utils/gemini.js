// AI API integration utility for TailorAI
// Supports Google Gemini API for cover letter generation

/**
 * Generate cover letter using Gemini API
 */
async function generateCoverLetter(cvText, jobData, apiKey) {
  // Validate inputs
  if (!cvText) throw new Error("CV text is required");
  if (!jobData || !jobData.jobTitle) throw new Error("Job data is required");
  if (!apiKey) throw new Error("API key is required");

  // Build the prompt
  const prompt = buildCoverLetterPrompt(cvText, jobData);

  // Call Gemini API
  try {
    console.log("🤖 Calling Gemini API to generate cover letter...");
    const response = await callGeminiAPI(prompt, apiKey);
    console.log(
      "✅ Gemini API call successful. Generated",
      response.length,
      "characters",
    );
    return response;
  } catch (error) {
    console.error("❌ GEMINI ERROR: Failed to generate cover letter");
    console.error("Error details:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

/**
 * Build prompt for cover letter generation (OLD - commented out)
 */
// function buildCoverLetterPrompt_OLD(cvText, jobData) {
//   const prompt = `You are writing a cover letter that matches a specific, grounded style. Write based on the candidate's CV and job posting below.
//
// CANDIDATE'S CV:
// ${cvText}
//
// JOB POSTING:
// Title: ${jobData.jobTitle}
// ${jobData.company ? `Company: ${jobData.company}` : ''}
// ${jobData.location ? `Location: ${jobData.location}` : ''}
// Description:
// ${jobData.description}
//
// STYLE REQUIREMENTS:
//
// TONE & VOICE:
// - Professional, confident, and grounded. Never salesy or hype-driven.
// - Semi-formal tone appropriate for tech/research roles.
// - First-person active voice. Speak as someone already doing the work.
// - Short to medium sentences. One clear idea per sentence. Direct and assertive.
//
// OPENING PARAGRAPH:
// - DO NOT start with "I am writing to apply for..."
// - Lead with action, context, or alignment—not credentials.
// - Connect to the problem the company is solving or the work the role enables.
// - Example pattern: "I've been building X and this role lines up with that work."
//
// BODY PARAGRAPHS (2-3 paragraphs):
// - Each paragraph = one concrete experience.
// - Structure: Action → Tool → Outcome → Insight.
// - Use specific metrics when available (time saved, performance gains, accuracy improvements, adoption numbers).
// - Technical skills lead. Soft skills appear through action (teaching, training, collaborating, leading) — never explicitly stated.
// - Make relevance to the job implicit through the example itself. Don't spell it out line-by-line.
//
// COMPANY/ROLE CONNECTION:
// - Reference 1-2 meaningful details: product, mission, user group, or problem they solve.
// - Weave this naturally into your experience. Don't sound like you copied their About page.
//
// CLOSING PARAGRAPH:
// - Forward-looking. Focused on contribution, not opportunity.
// - One sentence on what you'd like to help build/improve.
// - One sentence expressing interest in continuing the conversation (soft call to action).
// - Example: "I'd love to talk more about..." rather than "I look forward to hearing from you."
//
// STRICTLY AVOID THESE CLICHÉS:
// - "passionate about," "excited," "thrilled," "delighted"
// - "fast-paced environment," "cutting-edge," "world-class"
// - "delve," "foster," "testament," "realm"
// - Empty enthusiasm or generic statements that could apply to any role
// - Overly corporate or HR-driven language
//
// LENGTH: 280-350 words total. No filler.
//
// FORMAT REQUIREMENTS:
// - Do NOT include a salutation (no "Dear Hiring Manager,") — it will be added separately
// - Do NOT include a closing (no "Sincerely,") — it will be added separately
// - Do NOT include: contact information, date, company address, or signature name — these will all be added separately
// - ONLY output the body paragraphs of the cover letter, nothing else
//
// WRITE AS: A capable builder already doing the work. Calm confidence. Builder mindset.
//
// Write the cover letter now:`;
//
//   return prompt;
// }

/**
 * Build prompt for cover letter generation
 * Based on the Career Fair "Killer Cover Letter" methodology:
 * A cover letter is a marketing tool. Structure it around proving fit through evidence.
 */
function buildCoverLetterPrompt(cvText, jobData) {
  const prompt = `You are a cover letter writer. A cover letter is a marketing tool, not an autobiography. Your job is to convince the reader that this candidate is genuinely interested in this specific role AND has the experience to back it up.

WORD LIMIT: 300-370 words. This is a hard constraint. The output renders into a fixed-size single-page PDF. Exceeding 370 words breaks the layout.

PUNCTUATION RULE: NEVER use em dashes or en dashes in the output. Use commas, periods, semicolons, or colons instead.

CANDIDATE'S CV:
${cvText}

JOB POSTING:
Title: ${jobData.jobTitle}
${jobData.company ? `Company: ${jobData.company}` : ""}
${jobData.location ? `Location: ${jobData.location}` : ""}
Description:
${jobData.description}

BEFORE WRITING - INTERNAL ANALYSIS (do not output this):

STEP 1: EXTRACT REQUIREMENTS
From the job description, create two lists:
A. HARD REQUIREMENTS (must-haves):
   - Specific technologies/tools (e.g., "RESTful APIs", "SQL", "Power BI", "Docker", "AWS")
   - Technical skills (e.g., "data modeling", "API integration", "system automation")
   - Domain knowledge (e.g., "MSP business logic", "SLA monitoring")
B. SOFT REQUIREMENTS (nice-to-haves):
   - Methodologies (e.g., "Agile", "CI/CD")
   - General skills (e.g., "problem-solving", "communication")

STEP 2: MATCH CV TO REQUIREMENTS
For each hard requirement, find candidate's experience using this priority:
1. EXACT MATCH: Candidate used the exact technology/tool
2. EQUIVALENT MATCH: Different technology, same category
3. TRANSFERABLE SKILL: Related work demonstrating capability
4. GAP: Candidate lacks this; position transferable skills to cover it

STEP 3: SELECT TOP 2 EXPERIENCES FOR BODY PARAGRAPHS
Pick the experiences (internship, job, OR project) that BEST match what the job is looking for.

SELECTION STRATEGY:
- If job emphasizes production systems, team collaboration, scale → PREFER professional experience
- If job emphasizes innovation, building from scratch → PREFER projects
- Include at least 1 professional experience when available
- The second experience should cover different key requirements than the first

STEP 4: IDENTIFY WHAT MAKES THIS ROLE/COMPANY INTERESTING
From the job description, identify:
- What the role actually involves (responsibilities, challenges, scope)
- What the company does or builds
- Why this specific role would be appealing to someone with the candidate's background
This will be used in paragraph 1 to express genuine interest.

INFERENCE AUTHORIZATION - MAKE IT SOUND HUMAN:
You may infer realistic context around CV facts to create natural flow.

SAFE TO INFER:
- Problem/frustration that prompted the work: "Deployments were slow," "Data was scattered"
- Curiosity/learning motivations: "I wanted to explore [technology]"
- Team/user impact: "This freed up the team," "Made releases faster"
- Thought process: "I realized," "The challenge was," "The hardest part was"

NOT SAFE TO INFER:
- Specific numbers not in CV
- Technologies not in CV
- Specific people/teams not mentioned
- Awards/recognition not mentioned
- Responsibilities beyond what CV states

WRITE EXACTLY 4 PARAGRAPHS:

PARAGRAPH 1 - INTEREST + VALUE PROPOSITION (~60-80 words):
This is the most important paragraph. A recruiter may only read this one. It must accomplish three things:

1. EXPRESS INTEREST IN THE ROLE: State what role you're applying for and what specifically interests you about it. Reference something concrete from the job description: a responsibility, a challenge, or the kind of work involved.

2. EXPRESS INTEREST IN THE COMPANY: Mention something specific about the company: their product, mission, industry, or what they're building. This shows you're not mass-applying.

3. QUICK VALUE PROPOSITION: In one sentence, summarize why you're a strong candidate. Reference your most relevant experience area and how it aligns with what the role needs.

PATTERN: "I am excited to apply for [role] at [Company]. [Something specific about the role or company that interests you]. With [summary of relevant experience], I bring [what you offer that matches what they need]."

Keep it direct, confident, and professional. Do not be generic. Tie your interest to specifics from the job posting.

PARAGRAPH 2 - STRONGEST EXPERIENCE MATCH (~70-85 words):
Your most relevant experience, the one that best proves you can do this job.

STRUCTURE: Context of what you did → specific actions and technologies used → concrete outcomes or impact.

- Lead with what you did and where (role/company or project name)
- Describe specific, concrete work, not vague summaries
- Use the job description's terminology where your experience matches
- Include metrics/numbers from the CV when available (portfolio size, team size, performance gains, etc.)
- Show scope and impact, not just tasks

EXAMPLE:
"In my current role at [Company], I [specific responsibility matching job requirements]. I [concrete action with specific technologies/methods], [resulting in specific outcome]. I also [second concrete action], which [impact/result]."

PARAGRAPH 3 - SECOND EXPERIENCE MATCH (~70-85 words):
Your second strongest experience, covering DIFFERENT requirements than paragraph 2.

- Must address different key requirements from the job description
- Same structure: context → actions → outcomes
- If paragraph 2 covered technical skills, this could emphasize leadership, scale, or a different technical domain
- Include metrics where available

Start differently from paragraph 2 to avoid repetitive structure. Options:
- "Previously, I [experience]..." (if chronologically earlier)
- "At [Company/Project], I [experience]..." (if different context)
- Lead with the challenge or goal, then your approach

PARAGRAPH 4 - CLOSING (~50-65 words):
Tie everything together and close professionally.

STRUCTURE:
1. Express confidence that your background aligns with the role's needs (1-2 sentences). Reference specific aspects of the role or company to reinforce genuine interest.
2. Welcome the opportunity to discuss further (1 sentence).
3. Thank them for their consideration (1 sentence).

PATTERN: "I would welcome the opportunity to bring my experience in [relevant areas] to [Company]. I am confident that my background in [specific skills/experience] aligns with [what the role requires]. Thank you for your consideration. I look forward to discussing how I can contribute to [Company/team]."

STYLE:
- Mirror the employer's terminology exactly:
  * If job says "RESTful APIs", write "RESTful APIs" (not "backend services")
  * If job says "data modeling", write "data modeling" (not "database design")
  * This is critical for ATS keyword matching
- Professional, confident, first-person active voice
- Direct and clear. Every sentence should carry information
- Show soft skills through actions described, never state them as traits
- Vary sentence length to sound natural. Mix short and longer sentences
- Do NOT use transition words to start paragraphs ("Furthermore," "Moreover," "Additionally")

FORBIDDEN WORDS/PHRASES - NEVER USE THESE:
VERBS: delve, foster, leverage, utilize (use "use"), underscore, cultivate, navigate, embrace, resonate, harness, spearhead.
NOUNS: realm, landscape, tapestry, testament, symphony, synergy, paradigm, journey, arsenal.
ADJECTIVES: vibrant, bustling, pivotal, transformative, unwavering, intricate, multifaceted, robust, dynamic, cutting-edge, world-class.
PHRASES: "passionate about," "fast-paced environment," "game-changer," "in today's world," "unlock the potential."

NOTE ON EXPRESSING INTEREST: Phrases like "I am excited to apply" or "I would welcome the opportunity" are ALLOWED and encouraged. These are normal professional expressions of interest, not cliches. The forbidden list targets AI-sounding filler, not genuine professional language.

FORMAT:
- No salutation, no sign-off, no contact info, no date, no name. All added separately
- Output ONLY the 4 body paragraphs
- No bullet points or lists. Paragraph form only

REMEMBER: 300-370 words maximum. Count carefully.

Write the cover letter now:`;

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
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 550,
    },
  };

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Handle rate limiting with retry
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const waitTime = Math.pow(2, attempt) * 2000; // Exponential backoff: 2s, 4s, 8s
        console.warn(
          `⚠️ GEMINI RATE LIMIT: Attempt ${attempt + 1}/${maxRetries}. Retrying in ${waitTime / 1000}s...`,
        );
        console.warn("Rate limit response:", errorData);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error?.message ||
          `API request failed with status ${response.status}`;
        console.error(`❌ GEMINI API ERROR: Status ${response.status}`);
        console.error("Error message:", errorMessage);
        console.error("Full error data:", JSON.stringify(errorData, null, 2));
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        console.error(
          "❌ GEMINI ERROR: Invalid response structure from Gemini API",
        );
        console.error("Response data:", JSON.stringify(data, null, 2));
        throw new Error(
          "Invalid response from Gemini API - no content generated",
        );
      }

      const generatedText = data.candidates[0].content.parts[0].text;

      if (!generatedText || generatedText.trim().length === 0) {
        console.error("❌ GEMINI ERROR: Gemini returned empty content");
        console.error("Full response:", JSON.stringify(data, null, 2));
        throw new Error("Gemini API returned empty content");
      }

      return generatedText;
    } catch (error) {
      lastError = error;
      console.error(
        `❌ GEMINI ERROR (attempt ${attempt + 1}/${maxRetries}):`,
        error.message,
      );

      // Check if it's a rate limit error in the message
      if (
        error.message.includes("RATE_LIMIT") ||
        error.message.includes("429") ||
        error.message.includes("Resource has been exhausted")
      ) {
        console.warn(
          `⚠️ Rate limit detected in error message. Attempt ${attempt + 1}/${maxRetries}`,
        );
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.warn(`Retrying in ${waitTime / 1000}s...`);
          await sleep(waitTime);
          continue;
        }
      }

      // For non-rate-limit errors, throw immediately
      if (
        error.message.includes("API_KEY_INVALID") ||
        error.message.includes("API key not valid")
      ) {
        console.error("❌ GEMINI ERROR: Invalid API key detected");
        throw new Error(
          "Invalid API key. Please check your Gemini API key in settings.",
        );
      } else if (
        error.message.includes("QUOTA") ||
        error.message.includes("quota")
      ) {
        console.error("❌ GEMINI ERROR: API quota exceeded");
        throw new Error(
          "API quota exceeded. Please check your Google Cloud billing.",
        );
      }
    }
  }

  // If we've exhausted retries
  console.error("❌ GEMINI ERROR: All retry attempts exhausted");
  console.error("Last error:", lastError?.message);
  throw new Error("Rate limit exceeded. Please wait a minute and try again.");
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test API key validity
 */
async function testAPIKey(apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);

    if (response.ok) {
      return { valid: true, message: "API key is valid" };
    } else {
      const error = await response.json();
      return {
        valid: false,
        message: error.error?.message || "Invalid API key",
      };
    }
  } catch (error) {
    console.error("Error testing API key:", error);
    return { valid: false, message: "Failed to validate API key" };
  }
}

/**
 * Validate API key format (Gemini keys start with AIza)
 */
function validateAPIKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return { valid: false, message: "API key is required" };
  }

  if (!apiKey.startsWith("AIza")) {
    return {
      valid: false,
      message: 'Gemini API keys should start with "AIza"',
    };
  }

  if (apiKey.length < 30) {
    return { valid: false, message: "API key appears to be too short" };
  }

  return { valid: true };
}

/**
 * Debug function to test API key and diagnose issues
 * Call this from the browser console: testGeminiAPIKey('YOUR_API_KEY')
 */
async function debugGeminiAPI(apiKey) {
  console.log(
    "%c=== Gemini API Diagnostic Test ===",
    "color: #4CAF50; font-size: 16px; font-weight: bold;",
  );

  // Step 1: Validate format
  console.log(
    "\n%c1. Checking API key format...",
    "color: #2196F3; font-weight: bold;",
  );
  const formatCheck = validateAPIKeyFormat(apiKey);
  if (!formatCheck.valid) {
    console.log("%c❌ Format invalid:", "color: red;", formatCheck.message);
    return;
  }
  console.log("%c✓ Format looks valid", "color: green;");
  console.log("  Key starts with:", apiKey.substring(0, 10) + "...");
  console.log("  Key length:", apiKey.length);

  // Step 2: Test list models endpoint (lightweight test)
  console.log(
    "\n%c2. Testing API key with list models endpoint...",
    "color: #2196F3; font-weight: bold;",
  );
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (listResponse.ok) {
      console.log("%c✓ API key is valid!", "color: green;");
      console.log(
        "  Available models:",
        listData.models
          ?.map((m) => m.name)
          .slice(0, 5)
          .join(", ") + "...",
      );
    } else {
      console.log("%c❌ API key test failed:", "color: red;");
      console.log("  Status:", listResponse.status);
      console.log("  Error:", listData.error?.message || listData);

      if (listData.error?.message?.includes("API_KEY_INVALID")) {
        console.log(
          "%c\n💡 FIX: Your API key is invalid. Generate a new one at:",
          "color: orange;",
        );
        console.log("   https://aistudio.google.com/app/apikey");
      }
      if (
        listData.error?.message?.includes("API has not been used") ||
        listData.error?.message?.includes("disabled")
      ) {
        console.log(
          "%c\n💡 FIX: Enable the Generative Language API at:",
          "color: orange;",
        );
        console.log(
          "   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com",
        );
      }
      return;
    }
  } catch (error) {
    console.log("%c❌ Network error:", "color: red;", error.message);
    return;
  }

  // Step 3: Test actual generation endpoint
  console.log(
    "\n%c3. Testing generation endpoint (simple request)...",
    "color: #2196F3; font-weight: bold;",
  );
  try {
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const genResponse = await fetch(genUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: 'Say "test successful" in exactly 2 words.' }] },
        ],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });

    const genData = await genResponse.json();

    console.log("  Status:", genResponse.status);

    if (genResponse.ok) {
      console.log("%c✓ Generation works!", "color: green;");
      console.log(
        "  Response:",
        genData.candidates?.[0]?.content?.parts?.[0]?.text,
      );
    } else {
      console.log("%c❌ Generation failed:", "color: red;");
      console.log("  Error:", genData.error?.message || genData);

      if (genResponse.status === 429) {
        console.log(
          "%c\n💡 This is a RATE LIMIT error. Possible causes:",
          "color: orange;",
        );
        console.log("   1. You've exceeded the free tier limits (15 RPM)");
        console.log("   2. Your quota is exhausted for today");
        console.log("   3. Try waiting 1-2 minutes and run this test again");
        console.log(
          "   4. Check your quota at: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas",
        );
      }
      if (
        genData.error?.message?.includes("QUOTA") ||
        genData.error?.message?.includes("quota")
      ) {
        console.log(
          "%c\n💡 QUOTA EXCEEDED. Your daily/monthly quota is used up.",
          "color: orange;",
        );
        console.log(
          "   Check billing: https://console.cloud.google.com/billing",
        );
      }
    }
  } catch (error) {
    console.log("%c❌ Network error:", "color: red;", error.message);
  }

  console.log(
    "\n%c=== End Diagnostic ===",
    "color: #4CAF50; font-size: 16px; font-weight: bold;",
  );
}

// Make debug function available globally for console testing
if (typeof window !== "undefined") {
  window.debugGeminiAPI = debugGeminiAPI;
}
