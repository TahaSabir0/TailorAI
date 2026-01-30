// Content Script for TailorAI
// Extracts job posting information from web pages

console.log("TailorAI content script loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "extractJobPosting") {
    console.log("Extracting job posting data...");

    try {
      const jobData = extractJobData();
      sendResponse({ success: true, data: jobData });
    } catch (error) {
      console.error("Error extracting job data:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  return true; // Keep message channel open
});

// Extract job posting data from the current page
function extractJobData() {
  const url = window.location.href;
  let jobData = {
    jobTitle: "",
    company: "",
    description: "",
    url: url,
  };

  // Only support Handshake for now
  if (url.includes("handshake.com") || url.includes("joinhandshake.com")) {
    jobData = extractHandshakeJob();
  } else {
    // Not a supported site
    return {
      jobTitle: "",
      company: "",
      description: "",
      location: "",
      url: url,
      source: "Unsupported",
      error: "This site is not supported. Please use Handshake."
    };
  }

  // Clean up the extracted data
  jobData.jobTitle = cleanText(jobData.jobTitle);
  jobData.company = cleanText(jobData.company);
  jobData.description = cleanText(jobData.description);

  console.log("Extracted job data:", jobData);
  return jobData;
}

// Extract job data from Handshake
function extractHandshakeJob() {
  // 1. Get Job Title - Handshake uses the only <h1> for the job title
  const jobTitle = document.querySelector("h1")?.innerText || "";

  // 2. Get Company Name - Use aria-label from employer follow button
  let company = "";
  const employerButton = document.querySelector(
    'button[aria-label^="Follow this employer"]'
  );
  if (employerButton) {
    // The aria label says "Follow this employer: [Company Name]"
    company = employerButton
      .getAttribute("aria-label")
      .replace("Follow this employer: ", "");
  } else {
    // Backup: Look for the text inside the header link
    const headerLink = document.querySelector(
      'a[data-size="xlarge"][href^="/e/"]'
    );
    if (headerLink) company = headerLink.innerText;
  }

  // 3. Get Job Description - Look for the break-word styled container
  const descriptionContainer = document.querySelector(
    'div[style*="overflow-wrap: break-word"]'
  );
  let description = "";
  if (descriptionContainer) {
    description = descriptionContainer.innerText;
  } else {
    // Fallback: Look for "About the Role" section
    const allTextContainers = document.querySelectorAll("div");
    for (const div of allTextContainers) {
      if (div.innerText.includes("About the Role")) {
        description = div.innerText;
        break;
      }
    }
  }

  // 4. Get Location from "At a glance" section
  let location = "";
  const glanceHeaders = Array.from(document.querySelectorAll("h3")).find(
    (h) => h.innerText === "At a glance"
  );
  if (glanceHeaders) {
    const container = glanceHeaders.parentElement.parentElement;
    // Get all text content and split by lines
    const allLines = container.innerText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Filter to find location-specific lines
    const locationLines = allLines.filter((line) => {
      const lowerLine = line.toLowerCase();
      // Include lines that look like locations
      const hasLocationKeywords =
        lowerLine.includes("remote") ||
        lowerLine.includes("work from home") ||
        /[A-Z][a-z]+,\s*[A-Z]{2}/.test(line) || // City, ST format
        lowerLine.includes("based in") ||
        lowerLine.includes("hybrid");

      // Exclude non-location lines
      const isNotLocation =
        line.includes("$") || // Salary
        /\d{1,2}\/\d{1,2}\/\d{4}/.test(line) || // Dates
        lowerLine.includes("work authorization") ||
        lowerLine.includes("opt") ||
        lowerLine.includes("cpt") ||
        lowerLine === "at a glance" ||
        lowerLine === "internship" ||
        lowerLine === "full-time" ||
        lowerLine === "part-time" ||
        /from .+ to .+\d{4}/.test(lowerLine); // Duration format

      return hasLocationKeywords && !isNotLocation;
    });

    location = locationLines.join(" • ");
  }

  return {
    jobTitle,
    company,
    description,
    location,
    url: window.location.href,
    source: "Handshake",
  };
}

// Clean up extracted text
function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
    .trim();
}

// Helper function to validate extracted data
function validateJobData(jobData) {
  const hasTitle = jobData.jobTitle && jobData.jobTitle.length > 3;
  const hasDescription =
    jobData.description && jobData.description.length > 100;

  return hasTitle && hasDescription;
}
