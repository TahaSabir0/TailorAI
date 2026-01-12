// PDF Generator utility for TailorAI
// Uses jsPDF to generate professional cover letter PDFs

/**
 * Generate and download a PDF cover letter
 */
function generateCoverLetterPDF(coverLetter, jobData, cvMetadata) {
  const { jsPDF } = window.jspdf;

  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const primaryColor = [102, 126, 234]; // #667eea
  const textColor = [51, 51, 51]; // #333333
  const lightGray = [136, 136, 136]; // #888888

  let yPosition = margin;

  // Add header with applicant name
  const applicantName = cvMetadata?.firstName && cvMetadata?.lastName
    ? `${cvMetadata.firstName} ${cvMetadata.lastName}`
    : 'Cover Letter';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text(applicantName, margin, yPosition);
  yPosition += 12;

  // Add date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.text(dateStr, margin, yPosition);
  yPosition += 15;

  // Add job info
  if (jobData?.jobTitle || jobData?.company) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(...lightGray);

    let jobInfo = 'Application for: ';
    if (jobData.jobTitle) jobInfo += jobData.jobTitle;
    if (jobData.company) jobInfo += ` at ${jobData.company}`;

    doc.text(jobInfo, margin, yPosition);
    yPosition += 10;
  }

  // Add separator line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Add cover letter content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...textColor);

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(coverLetter, contentWidth);

  // Calculate line height
  const lineHeight = 6;

  // Add lines with page breaks if needed
  for (let i = 0; i < lines.length; i++) {
    // Check if we need a new page
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }

    doc.text(lines[i], margin, yPosition);
    yPosition += lineHeight;
  }

  // Add signature space
  yPosition += 10;
  if (yPosition > pageHeight - margin - 30) {
    doc.addPage();
    yPosition = margin;
  }

  // Add signature name
  if (cvMetadata?.firstName && cvMetadata?.lastName) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${cvMetadata.firstName} ${cvMetadata.lastName}`, margin, yPosition);
  }

  // Generate filename
  const companyName = jobData?.company?.replace(/[^a-zA-Z0-9]/g, '_') || 'Company';
  const jobTitle = jobData?.jobTitle?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) || 'Position';
  const filename = `Cover_Letter_${companyName}_${jobTitle}.pdf`;

  // Download the PDF
  doc.save(filename);

  return filename;
}
