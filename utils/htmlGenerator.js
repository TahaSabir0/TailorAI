// HTML Template Generator for TailorAI
// Manages cover letter template population and storage

/**
 * Load the base HTML template from file
 */
async function loadHtmlTemplate() {
    try {
        const templateUrl = chrome.runtime.getURL('cover_letter_template.html');
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error('Failed to load HTML template');
        }
        const templateContent = await response.text();
        return templateContent;
    } catch (error) {
        console.error('Error loading HTML template:', error);
        throw error;
    }
}

/**
 * Escape HTML special characters to prevent XSS and rendering issues
 */
function escapeHtml(text) {
    if (!text) return '';

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Build contact line HTML from CV metadata
 * Format: email | phone | linkedin | github | portfolio
 * Only includes available fields
 */
function buildContactLineHtml(cvMetadata) {
    const contactParts = [];

    // Email is required
    if (cvMetadata.email) {
        contactParts.push(`<a href="mailto:${escapeHtml(cvMetadata.email)}">${escapeHtml(cvMetadata.email)}</a>`);
    }

    // Add phone if available
    if (cvMetadata.phoneNumber) {
        contactParts.push(escapeHtml(cvMetadata.phoneNumber));
    }

    // Add LinkedIn if available
    if (cvMetadata.linkedin) {
        const linkedinClean = cvMetadata.linkedin.replace(/^https?:\/\//, '');
        const linkedinUrl = cvMetadata.linkedin.startsWith('http') ? cvMetadata.linkedin : `https://${cvMetadata.linkedin}`;
        contactParts.push(`<a href="${escapeHtml(linkedinUrl)}">${escapeHtml(linkedinClean)}</a>`);
    }

    // Add GitHub if available
    if (cvMetadata.github) {
        const githubClean = cvMetadata.github.replace(/^https?:\/\//, '');
        const githubUrl = cvMetadata.github.startsWith('http') ? cvMetadata.github : `https://${cvMetadata.github}`;
        contactParts.push(`<a href="${escapeHtml(githubUrl)}">${escapeHtml(githubClean)}</a>`);
    }

    // Add portfolio if available
    if (cvMetadata.portfolio) {
        const portfolioClean = cvMetadata.portfolio.replace(/^https?:\/\//, '');
        const portfolioUrl = cvMetadata.portfolio.startsWith('http') ? cvMetadata.portfolio : `https://${cvMetadata.portfolio}`;
        contactParts.push(`<a href="${escapeHtml(portfolioUrl)}">${escapeHtml(portfolioClean)}</a>`);
    }

    // Join with separator spans
    return contactParts.join('<span class="contact-separator">|</span>');
}

/**
 * Populate CV metadata into HTML template (Phase 1)
 * This happens once during CV upload
 */
async function populateCVMetadataHtml(cvMetadata) {
    try {
        // Load base template
        const template = await loadHtmlTemplate();

        // Build contact line HTML
        const contactLine = buildContactLineHtml(cvMetadata);

        // Replace CV metadata placeholders
        let populatedTemplate = template
            .replace(/\{\{FULL_NAME\}\}/g, escapeHtml(cvMetadata.fullName))
            .replace(/\{\{CONTACT_LINE\}\}/g, contactLine);

        return populatedTemplate;
    } catch (error) {
        console.error('Error populating CV metadata into HTML:', error);
        throw error;
    }
}

/**
 * Store partially-populated HTML template in chrome.storage
 */
async function storePartialHtmlTemplate(partialTemplate) {
    try {
        await chrome.storage.local.set({
            htmlTemplate: partialTemplate
        });
        return { success: true };
    } catch (error) {
        console.error('Error storing partial HTML template:', error);
        throw error;
    }
}

/**
 * Retrieve stored partial HTML template
 */
async function getStoredHtmlTemplate() {
    try {
        const result = await chrome.storage.local.get(['htmlTemplate']);
        if (!result.htmlTemplate) {
            throw new Error('No HTML template found in storage. Please re-upload your CV.');
        }
        return result.htmlTemplate;
    } catch (error) {
        console.error('Error retrieving stored HTML template:', error);
        throw error;
    }
}

/**
 * Clean letter body by removing duplicate salutation and closing
 * that Gemini might include in its output
 */
function cleanLetterBody(letterBody) {
    if (!letterBody) return '';

    let cleaned = letterBody.trim();

    // Remove salutation variations at the beginning
    const salutationPatterns = [
        /^Dear\s+Hiring\s+Manager,?\s*/i,
        /^Dear\s+Hiring\s+Team,?\s*/i,
        /^Dear\s+Recruiter,?\s*/i,
        /^Dear\s+Sir\s*\/?\s*Madam,?\s*/i,
        /^To\s+Whom\s+It\s+May\s+Concern,?\s*/i,
        /^Hello,?\s*/i,
        /^Hi,?\s*/i,
    ];

    for (const pattern of salutationPatterns) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Remove closing variations at the end (including when on separate lines)
    const closingPatterns = [
        /[\n\s]*Sincerely,?[\n\s]*$/i,
        /[\n\s]*Best\s+regards,?[\n\s]*$/i,
        /[\n\s]*Kind\s+regards,?[\n\s]*$/i,
        /[\n\s]*Regards,?[\n\s]*$/i,
        /[\n\s]*Thank\s+you,?[\n\s]*$/i,
        /[\n\s]*Yours\s+truly,?[\n\s]*$/i,
        /[\n\s]*Yours\s+sincerely,?[\n\s]*$/i,
        /[\n\s]*Best,?[\n\s]*$/i,
        /[\n\s]*Warm\s+regards,?[\n\s]*$/i,
    ];

    for (const pattern of closingPatterns) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Also remove any signature name that might appear at the very end
    // (usually after closing, on its own line)
    cleaned = cleaned.replace(/[\n\s]*[A-Z][a-z]+\s+[A-Z][a-z]+[\n\s]*$/, '');

    return cleaned.trim();
}

/**
 * Convert plain text letter body to HTML paragraphs
 */
function formatLetterBodyHtml(letterBody) {
    if (!letterBody) return '';

    // First clean the letter body of duplicate salutation/closing
    const cleanedBody = cleanLetterBody(letterBody);

    // Split by double newlines (paragraph breaks) or single newlines
    const paragraphs = cleanedBody
        .split(/\n\n+/)
        .map(para => para.trim())
        .filter(para => para.length > 0);

    // Wrap each paragraph in <p> tags
    return paragraphs
        .map(para => `<p>${escapeHtml(para).replace(/\n/g, ' ')}</p>`)
        .join('\n        ');
}

/**
 * Complete HTML template with job-specific data (Phase 2)
 * This happens when generating a cover letter for a job
 */
function completeHtmlTemplateWithJobData(partialTemplate, jobData, letterBody) {
    try {
        // Format current date
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format letter body as HTML paragraphs
        const formattedBody = formatLetterBodyHtml(letterBody);

        // Complete the template with job-specific data
        const completedTemplate = partialTemplate
            .replace(/\{\{DATE\}\}/g, escapeHtml(date))
            .replace(/\{\{COMPANY_NAME\}\}/g, escapeHtml(jobData.company || 'Hiring Team'))
            .replace(/\{\{LETTER_BODY\}\}/g, formattedBody);

        return completedTemplate;
    } catch (error) {
        console.error('Error completing HTML template with job data:', error);
        throw error;
    }
}

/**
 * Generate complete HTML document for a specific job
 * This is the main function called when generating a cover letter
 */
async function generateCoverLetterHtml(jobData, letterBody) {
    try {
        // Get the stored partial template (already has CV metadata)
        const partialTemplate = await getStoredHtmlTemplate();

        // Complete with job-specific data
        const completedHtml = completeHtmlTemplateWithJobData(partialTemplate, jobData, letterBody);

        return completedHtml;
    } catch (error) {
        console.error('Error generating cover letter HTML:', error);
        throw error;
    }
}

/**
 * Extract just the cover letter content div from a complete HTML document
 * Useful for rendering in an iframe or container
 */
function extractCoverLetterContent(completeHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(completeHtml, 'text/html');
    const content = doc.getElementById('coverLetterContent');
    return content ? content.outerHTML : completeHtml;
}

/**
 * Get inline styles from the HTML template
 * Extracts the <style> content for use with html2canvas/jsPDF
 */
function extractTemplateStyles(completeHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(completeHtml, 'text/html');
    const styleTag = doc.querySelector('style');
    return styleTag ? styleTag.textContent : '';
}
