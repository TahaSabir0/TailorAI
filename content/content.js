// Content Script for TailorAI
// Extracts job posting information from web pages

console.log('TailorAI content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobPosting') {
    console.log('Extracting job posting data...');

    try {
      const jobData = extractJobData();
      sendResponse({ success: true, data: jobData });
    } catch (error) {
      console.error('Error extracting job data:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  return true; // Keep message channel open
});

// Extract job posting data from the current page
function extractJobData() {
  const url = window.location.href;
  let jobData = {
    jobTitle: '',
    company: '',
    description: '',
    url: url
  };

  // Detect job board and use specific extractors
  if (url.includes('linkedin.com')) {
    jobData = extractLinkedInJob();
  } else if (url.includes('indeed.com')) {
    jobData = extractIndeedJob();
  } else if (url.includes('glassdoor.com')) {
    jobData = extractGlassdoorJob();
  } else {
    // Generic extraction for other sites
    jobData = extractGenericJob();
  }

  // Clean up the extracted data
  jobData.jobTitle = cleanText(jobData.jobTitle);
  jobData.company = cleanText(jobData.company);
  jobData.description = cleanText(jobData.description);

  console.log('Extracted job data:', jobData);
  return jobData;
}

// Extract job data from LinkedIn
function extractLinkedInJob() {
  const jobTitle = document.querySelector('h1.t-24')?.textContent ||
                   document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent ||
                   document.querySelector('[class*="job-title"]')?.textContent ||
                   '';

  const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent ||
                  document.querySelector('[class*="company-name"]')?.textContent ||
                  '';

  const description = document.querySelector('.jobs-description__content')?.textContent ||
                     document.querySelector('[class*="job-description"]')?.textContent ||
                     document.querySelector('.description')?.textContent ||
                     '';

  return { jobTitle, company, description, url: window.location.href };
}

// Extract job data from Indeed
function extractIndeedJob() {
  const jobTitle = document.querySelector('[class*="jobsearch-JobInfoHeader-title"]')?.textContent ||
                   document.querySelector('h1')?.textContent ||
                   '';

  const company = document.querySelector('[data-company-name="true"]')?.textContent ||
                  document.querySelector('[class*="company"]')?.textContent ||
                  '';

  const description = document.querySelector('#jobDescriptionText')?.textContent ||
                     document.querySelector('[class*="job-description"]')?.textContent ||
                     '';

  return { jobTitle, company, description, url: window.location.href };
}

// Extract job data from Glassdoor
function extractGlassdoorJob() {
  const jobTitle = document.querySelector('[data-test="job-title"]')?.textContent ||
                   document.querySelector('h1')?.textContent ||
                   '';

  const company = document.querySelector('[data-test="employer-name"]')?.textContent ||
                  document.querySelector('[class*="employer"]')?.textContent ||
                  '';

  const description = document.querySelector('[class*="JobDetails_jobDescription"]')?.textContent ||
                     document.querySelector('.desc')?.textContent ||
                     '';

  return { jobTitle, company, description, url: window.location.href };
}

// Generic job data extraction for other websites
function extractGenericJob() {
  // Try to find job title (usually in h1 or title)
  const jobTitle = document.querySelector('h1')?.textContent ||
                   document.querySelector('[class*="job-title" i]')?.textContent ||
                   document.querySelector('[class*="position" i]')?.textContent ||
                   document.querySelector('[class*="role" i]')?.textContent ||
                   document.title ||
                   '';

  // Try to find company name
  const company = document.querySelector('[class*="company" i]')?.textContent ||
                  document.querySelector('[class*="employer" i]')?.textContent ||
                  '';

  // Try to find job description
  // Look for common class names and large text blocks
  const description = document.querySelector('[class*="description" i]')?.textContent ||
                     document.querySelector('[class*="job-detail" i]')?.textContent ||
                     document.querySelector('[class*="content" i]')?.textContent ||
                     document.querySelector('main')?.textContent ||
                     document.querySelector('article')?.textContent ||
                     getMainContent();

  return { jobTitle, company, description, url: window.location.href };
}

// Get main content of the page as fallback
function getMainContent() {
  // Get all text from body, but filter out navigation and footer
  const body = document.body.cloneNode(true);

  // Remove common non-content elements
  const selectorsToRemove = [
    'nav', 'header', 'footer', 'aside',
    '[class*="navigation"]', '[class*="menu"]',
    '[class*="sidebar"]', '[class*="footer"]',
    'script', 'style', 'noscript'
  ];

  selectorsToRemove.forEach(selector => {
    body.querySelectorAll(selector).forEach(el => el.remove());
  });

  return body.textContent || '';
}

// Clean up extracted text
function cleanText(text) {
  if (!text) return '';

  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

// Helper function to validate extracted data
function validateJobData(jobData) {
  const hasTitle = jobData.jobTitle && jobData.jobTitle.length > 3;
  const hasDescription = jobData.description && jobData.description.length > 100;

  return hasTitle && hasDescription;
}
