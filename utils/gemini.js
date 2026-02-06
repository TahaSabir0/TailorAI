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
 * A cover letter is a marketing tool — structure it around proving fit through evidence.
 */
function buildCoverLetterPrompt(cvText, jobData) {
  const prompt = `You are a cover letter strategist. A cover letter is a marketing tool, not an autobiography. Prove the candidate fits this role by matching their experience to the job's requirements using the employer's own language.

WORD LIMIT: 270-320 words. This is a hard constraint — the output renders into a fixed-size single-page PDF. Exceeding 320 words breaks the layout.

CANDIDATE'S CV:
${cvText}

JOB POSTING:
Title: ${jobData.jobTitle}
${jobData.company ? `Company: ${jobData.company}` : ""}
${jobData.location ? `Location: ${jobData.location}` : ""}
Description:
${jobData.description}

BEFORE WRITING — INTERNAL ANALYSIS (do not output this):

STEP 1: EXTRACT TECHNICAL REQUIREMENTS (for technical roles)
From the job description, create two lists:
A. HARD REQUIREMENTS (must-haves):
   - Specific technologies/tools (e.g., "RESTful APIs", "SQL", "Power BI", "Docker", "AWS")
   - Technical skills (e.g., "data modeling", "API integration", "system automation")
   - Domain knowledge (e.g., "MSP business logic", "SLA monitoring")
B. SOFT REQUIREMENTS (nice-to-haves):
   - Methodologies (e.g., "Agile", "CI/CD")
   - General skills (e.g., "problem-solving", "communication")

STEP 2: MATCH CV TO REQUIREMENTS USING TECHNICAL MATCHING HIERARCHY
For each hard requirement, find candidate's experience using this priority:
1. EXACT MATCH: Candidate used the exact technology/tool (highest priority)
   - If job says "RESTful APIs" and CV shows REST API work → perfect match
2. EQUIVALENT MATCH: Different technology, same category
   - If job says "Power BI" and CV shows "Tableau" → strong match
3. TRANSFERABLE SKILL: Related technical work demonstrating capability
   - If job says "RPA development" and CV shows "automation scripts" → good match
4. GAP: Candidate lacks this requirement
   - Note it; we'll address positioning in paragraph 4

STEP 3: SELECT TOP 2 EXPERIENCES FOR BODY PARAGRAPHS
CRITICAL: Choose intelligently based on job requirements. Pick the experiences (internship OR project) that BEST match what the job is looking for.

SELECTION STRATEGY:
1. **Analyze job posting signals**:
   - If job emphasizes: production systems, team collaboration, scale, industry experience → PREFER internships
   - If job emphasizes: innovation, automation, passion projects, building from scratch → PREFER projects
   - If job emphasizes: specific technologies you used in both → pick the better story

2. **General guideline**: Include at least 1 professional experience (internship) to show you can work in a real environment. The second experience should be whatever best demonstrates the other key job requirements.

3. **Possible combinations** (pick what fits the job):
   - 1 internship + 1 project (most common - shows both professionalism and passion)
   - 2 internships (if job is very industry/production-focused and projects don't match as well)
   - 1 internship + 1 academic project (if academic work is highly relevant)

For each experience chosen:
- Must match job requirements (use exact terminology from job description)
- Focus on WHY you did it (curiosity, problem-solving, learning) > what metrics you achieved
- Show technical understanding through problem-solving narrative, not jargon density
- Tell a story that reveals how you think, not just what you accomplished

STAT DENSITY RULE:
- Use stats sparingly (1-2 per paragraph max)
- Prioritize: WHY you did it, WHAT problem you solved, HOW you approached it
- Then mention outcome/metrics briefly
- Goal: 60% narrative/problem-solving, 40% stats

STEP 4: IDENTIFY TECHNICAL COMPANY CONNECTION
For paragraph 4, extract:
- Specific technical challenges mentioned in the job description (e.g., "heterogeneous system data integration", "real-time data governance", "webhook monitoring")
- Technical systems/products the company builds
Then find CV experiences demonstrating understanding of these challenges.

INFERENCE AUTHORIZATION - MAKE IT SOUND HUMAN:
You have authorization to INFER realistic context around CV facts to create narrative flow. The goal: avoid "CV in paragraph form" by adding connective tissue.

SAFE TO INFER (interview-safe, adds humanity):
✅ Problem/frustration that prompted the work: "Deployments were slow," "Data was scattered," "I was spending hours doing [X] manually"
✅ Curiosity/learning motivations: "I wanted to explore [technology]," "I wondered if I could build," "I was curious about [concept]"
✅ Personal frustrations (for projects): "I was frustrated with [common problem]," "I kept running into [issue]," "I couldn't find a tool that..."
✅ Team/user impact: "This freed up the team," "Made releases faster," "Now [users] can..."
✅ Emotional framing: "frustrating," "time-consuming," "exciting challenge," "ambitious," "harder than I expected"
✅ Thought process: "I realized," "I decided to," "The challenge was," "The hardest part was," "I experimented with"
✅ Technical challenges: "getting [system] to work with [system]," "handling edge cases," "making it fast enough," "dealing with [technical constraint]"

NOT SAFE TO INFER (creates interview risk):
❌ Specific numbers not in CV: Don't say "saved 100 hours" if CV doesn't mention it
❌ Technologies not in CV: Don't add "Redis" or "Kafka" if CV doesn't list them
❌ Specific people/teams: Don't say "worked with CTO" or "led a team of 5" if CV doesn't say that
❌ Awards/recognition: Don't invent "employee of the month" or "promoted early"
❌ Specific companies/clients: Don't name clients or partners not mentioned in CV
❌ Responsibilities beyond CV scope: Don't claim "managed infrastructure" if CV says "deployed services"

NARRATIVE BALANCE RULE (CRITICAL):
- Target: ~60% narrative/story/why, ~40% technical details/stats
- REVERSE the typical approach - focus on WHY and HOW YOU THINK, not what you accomplished
- Structure: WHY you built it (motivation/curiosity) → HOW you approached it (technical decisions/challenges) → Brief outcome (optional)
- Max 1-2 stats per paragraph - use them sparingly for impact, not to fill space
- Show technical understanding through problem-solving narrative, not technology name-dropping
- Vary sentence length and paragraph opening structure to avoid robotic rhythm
- Goal: Recruiter learns about your curiosity, problem-solving approach, and passion - NOT a summary of your resume

WRITE EXACTLY 4 PARAGRAPHS:

PARAGRAPH 1 — INTRO & TRANSITION (~60-75 words):
CRITICAL: Do NOT open with "I am writing to apply..." or "I am writing to express my interest..." or "I am excited to apply..."

STRUCTURE: Hook (1-2 sentences) → Best relevant project/experience with context (2-3 sentences) → Optional transition (1 short sentence)

OPENING HOOK OPTIONS (pick the strongest based on job signals):
1. **Lead with relevant project/work**: "Last semester, I built [project] because [frustration/curiosity]. When I saw [Company]'s focus on [job requirement], [connection]..."
2. **Lead with relevant professional experience**: "At [Company], I [relevant work]. When I saw [Company]'s [job title] role focusing on [requirement], [connection]..."
3. **Lead with curiosity + relevant work**: "I've always been fascinated by [technical concept]. At [Company/Project], I [explored this]..."
4. **Specific company knowledge + relevant experience**: "I've been following [Company]'s work on [specific product/tech]. At [Your Company/Project], I [relevant work], so when I saw this role, [alignment]..."

Pick the hook based on what's most relevant to the job. Don't default to projects if professional experience is more aligned.

AFTER THE HOOK: Describe your most relevant experience (internship or project) with WHY context.
- Choose the experience that BEST matches the job's core requirements
- Focus on: Why you did it, what problem you solved, or what you wanted to learn/build
- Technical details: Mention 1-2 key technologies that align with job, but don't overload
- Keep to 2-3 sentences max
- Make it personal and story-driven, not a resume bullet point in paragraph form

OPTIONAL: End with a short, casual transition OR flow directly into paragraph 2.

PARAGRAPH 2 — FIRST SKILL MATCH (~60-75 words):
The strongest requirement-to-experience match (internship OR project - pick what fits best).

FOR TECHNICAL ROLES:
Structure: WHY you built it (1-2 sentences) → WHAT/HOW you built it with key technical decisions (2-3 sentences) → Brief outcome (1 sentence, optional).

Use this flow:
1. **LEAD WITH CURIOSITY/MOTIVATION**: Why did you build this? What problem were you trying to solve? What frustrated you? What did you want to learn?
   - "I was frustrated with [problem], so I built..."
   - "I wanted to explore [technology/concept], so I..."
   - "I noticed [pain point] and wondered if..."

2. **DESCRIBE TECHNICAL APPROACH**: Focus on interesting technical decisions or challenges. Show how you think, not just what tools you used.
   - Don't: "I used React, TypeScript, and Tailwind"
   - Do: "I needed real-time updates across multiple components, so I built a pub/sub system using React context"
   - Use job description terminology where relevant, but prioritize clear explanation

3. **BRIEF OUTCOME** (optional): If there's a compelling metric or result, mention it briefly. Otherwise skip it.

EXAMPLE (for a data/automation role):
Bad (stat-heavy, redundant with resume): "At Brainlyne.ai, I built GraphQL APIs and deployed microservices on AWS using Docker and GitHub Actions, reducing deployment time by 15%."

Good (project-focused, shows thinking): "I was frustrated watching founders at DeepSpace manually filter hundreds of tech articles daily. I built an AI analyzer using LangChain that could automatically surface relevant trends. The challenge was defining 'relevance' - I experimented with different embeddings and prompt strategies until I hit 92% accuracy. Now it processes 500+ articles daily and the team uses it every morning."

FOR NON-TECHNICAL ROLES: Follow same WHY → HOW → outcome structure.

PARAGRAPH 3 — SECOND SKILL MATCH (~60-75 words):
The second strongest requirement-to-experience match (internship OR project - pick what fits best).
CRITICAL: This paragraph must cover DIFFERENT technical requirements than paragraph 2. If paragraph 2 covered data processing, paragraph 3 should cover automation/system design/another key requirement.

VARY THE NARRATIVE APPROACH - Don't start with the same structure as paragraph 2. Options:

1. **Lead with the technical challenge**: "The hardest part of [project] was [technical problem]. I [how you solved it]..."
2. **Lead with learning goal**: "I wanted to understand [concept/technology] better, so I built [project]..."
3. **Lead with the 'aha' moment**: "I realized [insight], so I [what you built]..."
4. **Lead with scale/ambition**: "I challenged myself to build [ambitious thing]..."

TONE SHIFT: Make this paragraph feel different from paragraph 2.
- If paragraph 2 was about solving frustration → paragraph 3 could be about curiosity/learning
- If paragraph 2 was technical problem-solving → paragraph 3 could be about building something ambitious
- Goal: Show different facets of your personality/interests

KEEP IT LIGHT ON STATS: Focus on the interesting technical problem or what you learned. Metrics are optional here.

PARAGRAPH 4 — WHY THIS COMPANY & CLOSE (~60-75 words):
FOR TECHNICAL ROLES: Reference a specific technical challenge or system mentioned in the job description (e.g., "MSPBots' focus on heterogeneous system integration and real-time data governance aligns with my experience building [specific relevant system]"). Optionally address any gaps from Step 2 by positioning transferable skills (e.g., "While new to the MSP ecosystem, my experience with cross-platform API integration and data pipeline optimization directly translates to [specific job requirement]"). Close with confidence statement and call to action.
FOR NON-TECHNICAL ROLES: Reference company values/mission and link to candidate's interests. Close with interest in continuing conversation.

STYLE:
- Mirror the employer's terminology exactly — ESPECIALLY for technical roles:
  * If job says "RESTful APIs", write "RESTful APIs" (not "backend services" or "web services")
  * If job says "data modeling", write "data modeling" (not "database design")
  * If job says "RPA", write "RPA" (not "automation")
  * This is critical for ATS (Applicant Tracking Systems) keyword matching
- Numbers > adjectives, examples > claims
- Professional, confident, first-person active voice
- Show soft skills through action, never state them as traits
- For technical roles: Lead with technical capabilities, not personal narratives

SENTENCE VARIANCE (CRITICAL FOR HUMAN TONE):
- You MUST vary sentence length. Do not write 3 sentences of the same length in a row.
- Mix short, punchy sentences (under 10 words) with longer, detailed ones.
- Use fragments occasionally for emphasis: "The result? 28% increase in completion rates."
- Avoid starting consecutive sentences with the same structure (e.g., "I built... I developed... I created...").
- Do NOT use transition words to start paragraphs ("Furthermore," "Moreover," "Additionally").

FORBIDDEN WORDS/PHRASES — NEVER USE THESE (AI-generated red flags):
VERBS: delve, foster, leverage, utilize (use "use" or "used"), underscore, cultivate, navigate, embrace, resonate, harness, unlock, drive (when not literal), spearhead.
NOUNS: realm, landscape, tapestry, testament, symphony, intersection, synergy, paradigm, nuance, journey, arsenal, ecosystem (unless company uses it).
ADJECTIVES: vibrant, bustling, pivotal, transformative, unwavering, intricate, multifaceted, robust, dynamic, cutting-edge, world-class, innovative (overused).
PHRASES: "passionate about," "thrilled," "excited to apply," "I am writing to express my interest," "fast-paced environment," "it is important to note," "game-changer," "in today's world," "unlock the potential," "take this opportunity," "I believe," "I feel."

SHOW, DON'T TELL:
- Never say you are "passionate," "hardworking," "detail-oriented," or "a team player."
- Instead, describe a specific action or result that proves it.
- Bad: "I am passionate about data engineering."
- Good: "I spent three months optimizing our ETL pipeline, cutting processing time by 40%."

NO FLUFF RULE:
- Every sentence must contain either: (1) a specific fact, (2) a concrete action, or (3) a quantified result.
- If a sentence can be removed without losing information, remove it.
- Bad: "I believe my background makes me well-suited for this position."
- Good: [Delete this sentence — it says nothing.]

TONE EXAMPLE:
Bad (AI style): "I am writing to apply for the Software Engineer role. I have always been passionate about coding and I believe my skills would be a great asset to your team."
Good (human style): "I've been following [Company]'s work on autonomous delivery drones since the Series B raise last year. As a developer who just spent six months optimizing pathfinding algorithms for a similar rover project, I saw your open role and knew I had to apply."

FORMAT:
- No salutation, no sign-off, no contact info, no date, no name — all added separately
- Output ONLY the 4 body paragraphs
- No bullet points or lists — paragraph form only
- Avoid the standard 5-paragraph essay structure — do not start paragraphs with transition words like "Furthermore," "Moreover," "Additionally," "In addition"
- If you need to connect ideas, use action or context, not transition filler

REMEMBER: 270-320 words maximum. Count carefully.

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
