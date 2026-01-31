// PDF Generator utility for TailorAI
// Uses HTML template + html2canvas + jsPDF to generate professional cover letter PDFs

/**
 * Generate and download a PDF cover letter from HTML template
 * @param {string} coverLetter - The cover letter text body
 * @param {object} jobData - Job posting data (company, jobTitle, etc.)
 * @param {object} cvMetadata - CV metadata (name, email, etc.)
 * @returns {Promise<string>} - The generated filename
 */
async function generateCoverLetterPDF(coverLetter, jobData, cvMetadata) {
    try {
        // Generate the complete HTML from template
        const completeHtml = await generateCoverLetterHtml(jobData, coverLetter);

        // Create a hidden container to render the HTML
        // 8.5in at 96dpi = 816px
        const container = document.createElement('div');
        container.id = 'pdf-render-container';
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 816px;
            background: white;
            font-family: Georgia, 'Times New Roman', Times, serif;
        `;

        // Parse and inject the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(completeHtml, 'text/html');

        // Get styles and content
        const styles = doc.querySelector('style');
        const content = doc.getElementById('coverLetterContent');

        if (!content) {
            throw new Error('Could not find cover letter content in template');
        }

        // Create style element for the container
        const styleElement = document.createElement('style');
        styleElement.textContent = (styles ? styles.textContent : '') +
            '\n.contact-line a { color: #2563EB !important; }';
        container.appendChild(styleElement);

        // Clone the content
        const contentClone = content.cloneNode(true);
        container.appendChild(contentClone);

        // Add to document
        document.body.appendChild(container);

        // Wait for fonts and styles to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Extract link positions before rendering to canvas (canvas loses interactivity)
        const linkElements = contentClone.querySelectorAll('a[href]');
        const containerRect = contentClone.getBoundingClientRect();
        const linkData = [];
        for (const link of linkElements) {
            const rect = link.getBoundingClientRect();
            // Use getAttribute to get the raw href value, not the browser-resolved .href
            const rawHref = link.getAttribute('href');
            linkData.push({
                url: rawHref,
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height
            });
        }

        // Use html2canvas to render the container
        const canvas = await html2canvas(contentClone, {
            scale: 2, // Higher resolution for crisp text
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 816, // 8.5in at 96dpi
            windowWidth: 816,
            onclone: (clonedDoc) => {
                // Ensure fonts are applied in cloned document
                const clonedContent = clonedDoc.getElementById('coverLetterContent');
                if (clonedContent) {
                    clonedContent.style.width = '100%';
                    clonedContent.style.maxWidth = '816px';
                    clonedContent.style.margin = '0 auto';
                }
            }
        });

        // Calculate PDF dimensions (Letter size: 8.5 x 11 inches)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });

        const pageWidth = 8.5;
        const pageHeight = 11;

        // No additional margins - the HTML template already has 1in padding built in
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add the canvas as an image to the PDF
        const imgData = canvas.toDataURL('image/png', 1.0);

        // Handle multi-page if content is too long
        if (imgHeight <= pageHeight) {
            // Single page - render at full page width
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
            // Multi-page: split the canvas
            const totalPages = Math.ceil(imgHeight / pageHeight);
            const sourceHeight = canvas.height / totalPages;

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }

                // Create a temporary canvas for this page segment
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sourceHeight;
                const ctx = pageCanvas.getContext('2d');

                // Draw the relevant portion
                ctx.drawImage(
                    canvas,
                    0, page * sourceHeight, // Source position
                    canvas.width, sourceHeight, // Source dimensions
                    0, 0, // Destination position
                    canvas.width, sourceHeight // Destination dimensions
                );

                const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, pageHeight);
            }
        }

        // Add clickable link annotations to the PDF on page 1 (contact links are in the header)
        pdf.setPage(1);
        const containerWidth = contentClone.offsetWidth || 816;
        const pxToInch = pageWidth / containerWidth;
        for (const link of linkData) {
            const pdfX = link.x * pxToInch;
            const pdfY = link.y * pxToInch;
            const pdfW = link.width * pxToInch;
            const pdfH = link.height * pxToInch;
            if (link.url && pdfW > 0 && pdfH > 0) {
                pdf.link(pdfX, pdfY, pdfW, pdfH, { url: link.url });
            }
        }

        // Clean up
        document.body.removeChild(container);

        // Generate filename
        const companyName = (jobData?.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
        const jobTitle = (jobData?.jobTitle || 'Position').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = `Cover_Letter_${companyName}_${jobTitle}.pdf`;

        // Download the PDF
        pdf.save(filename);

        return filename;
    } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to simple text-based PDF if html2canvas fails
        return generateFallbackPDF(coverLetter, jobData, cvMetadata);
    }
}

/**
 * Fallback PDF generation using simple jsPDF text rendering
 * Used if html2canvas is not available or fails
 */
function generateFallbackPDF(coverLetter, jobData, cvMetadata) {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const headerColor = [80, 80, 80];
    const bodyColor = [60, 60, 60];
    const subtitleColor = [120, 120, 120];

    let yPosition = margin;

    // Header name
    const fullName = cvMetadata?.fullName ||
        (cvMetadata?.firstName && cvMetadata?.lastName
            ? `${cvMetadata.firstName} ${cvMetadata.lastName}`
            : 'Cover Letter');

    doc.setFont('times', 'normal');
    doc.setFontSize(24);
    doc.setTextColor(...headerColor);
    doc.text(fullName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Contact line with clickable links
    const linkColor = [37, 99, 235]; // #2563EB
    const contactItems = [];
    if (cvMetadata?.email) {
        contactItems.push({ text: cvMetadata.email, url: `mailto:${cvMetadata.email}` });
    }
    if (cvMetadata?.phoneNumber) {
        contactItems.push({ text: cvMetadata.phoneNumber, url: null });
    }
    if (cvMetadata?.linkedin) {
        const display = cvMetadata.linkedin.replace(/^https?:\/\//, '');
        const url = cvMetadata.linkedin.startsWith('http') ? cvMetadata.linkedin : `https://${cvMetadata.linkedin}`;
        contactItems.push({ text: display, url: url });
    }
    if (cvMetadata?.github) {
        const display = cvMetadata.github.replace(/^https?:\/\//, '');
        const url = cvMetadata.github.startsWith('http') ? cvMetadata.github : `https://${cvMetadata.github}`;
        contactItems.push({ text: display, url: url });
    }
    if (cvMetadata?.portfolio) {
        const display = cvMetadata.portfolio.replace(/^https?:\/\//, '');
        const url = cvMetadata.portfolio.startsWith('http') ? cvMetadata.portfolio : `https://${cvMetadata.portfolio}`;
        contactItems.push({ text: display, url: url });
    }

    if (contactItems.length > 0) {
        doc.setFontSize(9);
        const separator = ' | ';
        // Calculate total width for centering
        let totalWidth = 0;
        for (let i = 0; i < contactItems.length; i++) {
            totalWidth += doc.getTextWidth(contactItems[i].text);
            if (i < contactItems.length - 1) {
                totalWidth += doc.getTextWidth(separator);
            }
        }

        let xPos = (pageWidth - totalWidth) / 2;

        for (let i = 0; i < contactItems.length; i++) {
            const item = contactItems[i];
            if (item.url) {
                doc.setTextColor(...linkColor);
                doc.textWithLink(item.text, xPos, yPosition, { url: item.url });
            } else {
                doc.setTextColor(...subtitleColor);
                doc.text(item.text, xPos, yPosition);
            }
            xPos += doc.getTextWidth(item.text);

            if (i < contactItems.length - 1) {
                doc.setTextColor(...subtitleColor);
                doc.text(separator, xPos, yPosition);
                xPos += doc.getTextWidth(separator);
            }
        }
    }
    yPosition += 5;

    // Separator line
    doc.setDrawColor(...headerColor);
    doc.setLineWidth(0.2);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Date
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setFontSize(11);
    doc.setTextColor(...bodyColor);
    doc.text(date, margin, yPosition);
    yPosition += 12;

    // Company
    doc.text(jobData?.company || 'Hiring Team', margin, yPosition);
    yPosition += 12;

    // Salutation
    doc.text('Dear Hiring Manager,', margin, yPosition);
    yPosition += 10;

    // Body
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(coverLetter, contentWidth);
    const lineHeight = 5.5;

    for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - margin - 20) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
    }

    // Closing
    yPosition += 8;
    if (yPosition > pageHeight - margin - 25) {
        doc.addPage();
        yPosition = margin;
    }
    doc.text('Sincerely,', margin, yPosition);
    yPosition += 15;

    // Signature
    doc.text(fullName, margin, yPosition);

    // Generate filename and save
    const companyName = (jobData?.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const jobTitle = (jobData?.jobTitle || 'Position').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `Cover_Letter_${companyName}_${jobTitle}.pdf`;

    doc.save(filename);
    return filename;
}
