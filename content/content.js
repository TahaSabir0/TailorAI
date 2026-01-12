// Content Script for TailorAI
// Extracts job posting information from web pages

console.log('TailorAI content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
  } else if (url.includes('handshake.com') || url.includes('joinhandshake.com')) {
    jobData = extractHandshakeJob();
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
  // LinkedIn job title selectors (updated for 2026)
  const jobTitle = document.querySelector('h1.t-24')?.textContent ||
                   document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent ||
                   document.querySelector('.jobs-unified-top-card__job-title')?.textContent ||
                   document.querySelector('h1.topcard__title')?.textContent ||
                   document.querySelector('[class*="job-title"]')?.textContent ||
                   document.querySelector('h1')?.textContent ||
                   '';

  // LinkedIn company name selectors
  const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent ||
                  document.querySelector('.jobs-unified-top-card__company-name')?.textContent ||
                  document.querySelector('.topcard__org-name-link')?.textContent ||
                  document.querySelector('.topcard__flavor--black')?.textContent ||
                  document.querySelector('[class*="company-name"]')?.textContent ||
                  document.querySelector('a[data-tracking-control-name*="company"]')?.textContent ||
                  '';

  // LinkedIn job description selectors
  const description = document.querySelector('.jobs-description__content')?.textContent ||
                     document.querySelector('.jobs-description-content__text')?.textContent ||
                     document.querySelector('.description__text')?.textContent ||
                     document.querySelector('[class*="job-description"]')?.textContent ||
                     document.querySelector('.description')?.textContent ||
                     document.querySelector('div[class*="jobs-description"]')?.textContent ||
                     '';

  // Additional data for LinkedIn
  const location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent ||
                   document.querySelector('.topcard__flavor--bullet')?.textContent ||
                   '';

  return {
    jobTitle,
    company,
    description,
    location,
    url: window.location.href,
    source: 'LinkedIn'
  };
}

// Extract job data from Handshake
function extractHandshakeJob() {
  // 1. Get Job Title - Handshake uses the only <h1> for the job title
  const jobTitle = document.querySelector('h1')?.innerText || '';

  // 2. Get Company Name - Use aria-label from employer follow button
  let company = '';
  const employerLogo = document.querySelector('a[aria-label^="Follow this employer"]');
  if (employerLogo) {
    // The aria label says "Follow this employer: [Company Name]"
    company = employerLogo.getAttribute('aria-label').replace('Follow this employer: ', '');
  } else {
    // Backup: Look for the text inside the header link
    const headerLink = document.querySelector('a[data-size="xlarge"][href^="/e/"]');
    if (headerLink) company = headerLink.innerText;
  }

  // 3. Get Job Description - Look for the break-word styled container
  const descriptionContainer = document.querySelector('div[style*="overflow-wrap: break-word"]');
  let description = '';
  if (descriptionContainer) {
    description = descriptionContainer.innerText;
  } else {
    // Fallback: Look for "About the Role" section
    const allTextContainers = document.querySelectorAll('div');
    for (const div of allTextContainers) {
      if (div.innerText.includes('About the Role')) {
        description = div.innerText;
        break;
      }
    }
  }

  // 4. Get Metadata (Location/Salary) from "At a glance" section
  let location = '';
  const glanceHeaders = Array.from(document.querySelectorAll('h3')).find(
    (h) => h.innerText === 'At a glance'
  );
  if (glanceHeaders) {
    const container = glanceHeaders.parentElement.parentElement;
    location = container.innerText.replace('At a glance', '').trim();
  }

  return {
    jobTitle,
    company,
    description,
    location,
    url: window.location.href,
    source: 'Handshake'
  };
}

// Generic job data extraction for other websites
function extractGenericJob() {
  // Try to find job title (usually in h1 or title)
  const jobTitle = document.querySelector('h1')?.textContent ||
                   document.querySelector('[class*="job-title" i]')?.textContent ||
                   document.querySelector('[class*="position" i]')?.textContent ||
                   document.querySelector('[class*="role" i]')?.textContent ||
                   document.querySelector('[id*="job-title" i]')?.textContent ||
                   document.title ||
                   '';

  // Try to find company name
  const company = document.querySelector('[class*="company" i]')?.textContent ||
                  document.querySelector('[class*="employer" i]')?.textContent ||
                  document.querySelector('[class*="organization" i]')?.textContent ||
                  '';

  // Try to find job description
  // Look for common class names and large text blocks
  const description = document.querySelector('[class*="description" i]')?.textContent ||
                     document.querySelector('[class*="job-detail" i]')?.textContent ||
                     document.querySelector('[id*="description" i]')?.textContent ||
                     document.querySelector('[class*="content" i]')?.textContent ||
                     document.querySelector('main')?.textContent ||
                     document.querySelector('article')?.textContent ||
                     getMainContent();

  // Try to find location
  const location = document.querySelector('[class*="location" i]')?.textContent ||
                   document.querySelector('[class*="place" i]')?.textContent ||
                   '';

  return {
    jobTitle,
    company,
    description,
    location,
    url: window.location.href,
    source: 'Generic'
  };
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
