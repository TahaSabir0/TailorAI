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
  const employerLogo = document.querySelector(
    'a[aria-label^="Follow this employer"]'
  );
  if (employerLogo) {
    // The aria label says "Follow this employer: [Company Name]"
    company = employerLogo
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

  // 4. Get Metadata (Location/Salary) from "At a glance" section
  let location = "";
  const glanceHeaders = Array.from(document.querySelectorAll("h3")).find(
    (h) => h.innerText === "At a glance"
  );
  if (glanceHeaders) {
    const container = glanceHeaders.parentElement.parentElement;
    location = container.innerText.replace("At a glance", "").trim();
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
