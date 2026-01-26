// LaTeX Template Generator for TailorAI
// Manages cover letter template population and storage

/**
 * Load the base LaTeX template from file
 */
async function loadLatexTemplate() {
    try {
        const templateUrl = chrome.runtime.getURL('cover_letter_template.tex');
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error('Failed to load LaTeX template');
        }
        const templateContent = await response.text();
        return templateContent;
    } catch (error) {
        console.error('Error loading LaTeX template:', error);
        throw error;
    }
}

/**
 * Build contact line from CV metadata
 * Format: email | phone | linkedin | github | portfolio
 * Only includes available fields
 */
function buildContactLine(cvMetadata) {
    const contactParts = [];

    // Email is required
    if (cvMetadata.email) {
        contactParts.push(cvMetadata.email);
    }

    // Add phone if available
    if (cvMetadata.phoneNumber) {
        contactParts.push(cvMetadata.phoneNumber);
    }

    // Add LinkedIn if available
    if (cvMetadata.linkedin) {
        // Clean up URL - remove https:// for cleaner display
        const linkedinClean = cvMetadata.linkedin.replace(/^https?:\/\//, '');
        contactParts.push(linkedinClean);
    }

    // Add GitHub if available
    if (cvMetadata.github) {
        const githubClean = cvMetadata.github.replace(/^https?:\/\//, '');
        contactParts.push(githubClean);
    }

    // Add portfolio if available
    if (cvMetadata.portfolio) {
        const portfolioClean = cvMetadata.portfolio.replace(/^https?:\/\//, '');
        contactParts.push(portfolioClean);
    }

    // Join with LaTeX-safe separator
    return contactParts.join(' \\hspace{0.5em}|\\hspace{0.5em} ');
}

/**
 * Populate CV metadata into template (Step 2)
 * This happens once during CV upload
 */
async function populateCVMetadata(cvMetadata) {
    try {
        // Load base template
        const template = await loadLatexTemplate();

        // Build contact line
        const contactLine = buildContactLine(cvMetadata);

        // Replace CV metadata placeholders
        let populatedTemplate = template
            .replace(/\{\{FULL_NAME\}\}/g, escapeLaTeX(cvMetadata.fullName))
            .replace(/\{\{CONTACT_LINE\}\}/g, contactLine);

        console.log('CV metadata populated into template');
        return populatedTemplate;
    } catch (error) {
        console.error('Error populating CV metadata:', error);
        throw error;
    }
}

/**
 * Complete template with job-specific data (Step 4)
 * This happens when generating a cover letter for a job
 */
function completeTemplateWithJobData(partialTemplate, jobData, letterBody) {
    try {
        // Format current date
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Complete the template with job-specific data
        const completedTemplate = partialTemplate
            .replace(/\{\{DATE\}\}/g, date)
            .replace(/\{\{COMPANY_NAME\}\}/g, escapeLaTeX(jobData.company || 'Hiring Team'))
            .replace(/\{\{LETTER_BODY\}\}/g, escapeLaTeX(letterBody));

        console.log('Template completed with job data');
        return completedTemplate;
    } catch (error) {
        console.error('Error completing template with job data:', error);
        throw error;
    }
}

/**
 * Store partially-populated template in chrome.storage (Step 3)
 */
async function storePartialTemplate(partialTemplate) {
    try {
        await chrome.storage.local.set({
            latexTemplate: partialTemplate
        });
        console.log('Partial LaTeX template stored successfully');
        return { success: true };
    } catch (error) {
        console.error('Error storing partial template:', error);
        throw error;
    }
}

/**
 * Retrieve stored partial template
 */
async function getStoredTemplate() {
    try {
        const result = await chrome.storage.local.get(['latexTemplate']);
        if (!result.latexTemplate) {
            throw new Error('No template found in storage. Please re-upload your CV.');
        }
        return result.latexTemplate;
    } catch (error) {
        console.error('Error retrieving stored template:', error);
        throw error;
    }
}

/**
 * Escape special LaTeX characters
 */
function escapeLaTeX(text) {
    if (!text) return '';

    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Generate complete LaTeX document for a specific job
 * This is the main function called when generating a cover letter
 */
async function generateCoverLetterLatex(jobData, letterBody) {
    try {
        // Get the stored partial template (already has CV metadata)
        const partialTemplate = await getStoredTemplate();

        // Complete with job-specific data
        const completedLatex = completeTemplateWithJobData(partialTemplate, jobData, letterBody);

        console.log('Complete LaTeX document generated');
        return completedLatex;
    } catch (error) {
        console.error('Error generating cover letter LaTeX:', error);
        throw error;
    }
}
