// DOM Elements
const tailorBtn = document.getElementById('tailorBtn');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const statusText = document.getElementById('statusText');
const statusIcon = document.querySelector('.status-icon');
const uploadCvBtn = document.getElementById('uploadCvBtn');
const cvUploadInput = document.getElementById('cvUpload');
const cvStatus = document.getElementById('cvStatus');
const deleteCvBtn = document.getElementById('deleteCvBtn');
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const messageSection = document.getElementById('messageSection');
const messageText = document.getElementById('messageText');
const btnText = tailorBtn.querySelector('.btn-text');
const loader = tailorBtn.querySelector('.loader');

// Initialize popup
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await checkCVStatus();
  await loadApiKey();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  settingsBtn.addEventListener('click', openSettings);
  closeSettingsBtn.addEventListener('click', closeSettings);
  uploadCvBtn.addEventListener('click', () => cvUploadInput.click());
  cvUploadInput.addEventListener('change', handleCVUpload);
  deleteCvBtn.addEventListener('click', handleDeleteCV);
  saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  tailorBtn.addEventListener('click', handleTailorClick);
}

// Check if CV is uploaded
async function checkCVStatus() {
  try {
    const result = await chrome.storage.local.get(['cvMetadata', 'cvText']);

    if (result.cvMetadata && result.cvText) {
      // CV exists
      updateCVStatusDisplay(result.cvMetadata);
      enableTailorButton();
      updateStatusMessage('✅', 'Ready to generate cover letters!', 'success');
    } else {
      // No CV
      disableTailorButton();
      updateStatusMessage('ℹ️', 'Upload your CV to get started', 'info');
    }
  } catch (error) {
    console.error('Error checking CV status:', error);
    showMessage('Error checking CV status', 'error');
  }
}

// Update CV status display
function updateCVStatusDisplay(metadata) {
  cvStatus.innerHTML = `
    <div class="cv-info">
      <p><strong>File:</strong> ${metadata.fileName}</p>
      <p><strong>Uploaded:</strong> ${new Date(metadata.uploadDate).toLocaleDateString()}</p>
      <p><strong>Name:</strong> ${metadata.firstName} ${metadata.lastName}</p>
    </div>
  `;
  deleteCvBtn.style.display = 'block';
}

// Update status message
function updateStatusMessage(icon, text, type) {
  statusIcon.textContent = icon;
  statusText.textContent = text;
  statusText.className = type;
}

// Enable/disable Tailor button
function enableTailorButton() {
  tailorBtn.disabled = false;
}

function disableTailorButton() {
  tailorBtn.disabled = true;
}

// Open settings panel
function openSettings() {
  settingsPanel.style.display = 'block';
}

// Close settings panel
function closeSettings() {
  settingsPanel.style.display = 'none';
}

// Handle CV upload
async function handleCVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    showMessage('Please upload a PDF or DOCX file', 'error');
    return;
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showMessage('File size must be less than 10MB', 'error');
    return;
  }

  showMessage('Processing CV...', 'info');

  try {
    // Extract text from PDF/DOCX using cvExtractor utility
    const cvText = await extractTextFromCV(file);

    // Validate extracted text
    const validation = validateCVText(cvText);
    if (!validation.valid) {
      showMessage(validation.message, 'error');
      return;
    }

    // Create metadata
    const metadata = createCVMetadata(file.name, cvText);

    // Store CV text and metadata in chrome.storage.local
    await chrome.storage.local.set({
      cvText: cvText,
      cvMetadata: metadata
    });

    console.log('CV uploaded successfully:', metadata);

    // Update UI
    updateCVStatusDisplay(metadata);
    enableTailorButton();
    updateStatusMessage('✅', 'Ready to generate cover letters!', 'success');
    showMessage('CV uploaded successfully!', 'success');

    // Clear the file input for future uploads
    cvUploadInput.value = '';
  } catch (error) {
    console.error('Error uploading CV:', error);
    showMessage('Error uploading CV: ' + error.message, 'error');
    cvUploadInput.value = '';
  }
}

// Handle delete CV
async function handleDeleteCV() {
  if (!confirm('Are you sure you want to delete your CV? This cannot be undone.')) {
    return;
  }

  try {
    await chrome.storage.local.remove(['cvText', 'cvMetadata']);
    cvStatus.innerHTML = '<p class="no-cv-text">No CV uploaded yet</p>';
    deleteCvBtn.style.display = 'none';
    disableTailorButton();
    updateStatusMessage('ℹ️', 'Upload your CV to get started', 'info');
    showMessage('CV deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting CV:', error);
    showMessage('Error deleting CV', 'error');
  }
}

// Load API key
async function loadApiKey() {
  try {
    const result = await chrome.storage.local.get(['openaiApiKey']);
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

// Handle save API key
async function handleSaveApiKey() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showMessage('Please enter an API key', 'error');
    return;
  }

  // Basic validation for OpenAI API key format
  if (!apiKey.startsWith('sk-')) {
    showMessage('Invalid API key format. OpenAI keys start with "sk-"', 'error');
    return;
  }

  try {
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    showMessage('API key saved successfully', 'success');
  } catch (error) {
    console.error('Error saving API key:', error);
    showMessage('Error saving API key', 'error');
  }
}

// Handle Tailor button click
async function handleTailorClick() {
  // Check if API key exists
  const result = await chrome.storage.local.get(['openaiApiKey', 'cvText']);

  if (!result.openaiApiKey) {
    showMessage('Please add your OpenAI API key in settings', 'error');
    openSettings();
    return;
  }

  if (!result.cvText) {
    showMessage('Please upload your CV first', 'error');
    openSettings();
    return;
  }

  // Show loading state
  setLoadingState(true);
  showMessage('Extracting job posting...', 'info');

  try {
    // Stage 3: Extract job posting content from active tab
    const jobData = await extractJobPostingFromActiveTab();

    if (!jobData || !jobData.jobTitle || !jobData.description) {
      showMessage('Could not extract job posting. Make sure you are on a job posting page.', 'error');
      setLoadingState(false);
      return;
    }

    console.log('Job data extracted:', jobData);

    // Store job data for later use
    await chrome.storage.local.set({ currentJobData: jobData });

    // Update status to show job was found
    updateStatusMessage('✅', `Found: ${jobData.jobTitle} at ${jobData.company || 'Unknown Company'}`, 'success');
    showMessage(`Job posting extracted: ${jobData.jobTitle}`, 'success');

    // Show that cover letter generation will be implemented in Stage 4-5
    setTimeout(() => {
      showMessage('Cover letter generation will be implemented in Stage 4-5', 'info');
    }, 2000);

    // TODO: Call OpenAI API (Stage 4)
    // TODO: Generate PDF (Stage 5)
  } catch (error) {
    console.error('Error generating cover letter:', error);
    showMessage('Error: ' + error.message, 'error');
  } finally {
    setLoadingState(false);
  }
}

// Extract job posting from active tab
async function extractJobPostingFromActiveTab() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }

    // Send message to content script to extract job data
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'extractJobPosting'
    });

    if (response && response.success) {
      return response.data;
    } else {
      throw new Error(response?.error || 'Failed to extract job posting');
    }
  } catch (error) {
    console.error('Error extracting job posting:', error);

    // Provide helpful error message
    if (error.message.includes('Could not establish connection')) {
      throw new Error('Please refresh the job posting page and try again');
    }

    throw error;
  }
}

// Set loading state
function setLoadingState(isLoading) {
  if (isLoading) {
    btnText.style.display = 'none';
    loader.style.display = 'inline-block';
    tailorBtn.disabled = true;
  } else {
    btnText.style.display = 'inline-block';
    loader.style.display = 'none';
    tailorBtn.disabled = false;
  }
}

// Show message
function showMessage(text, type) {
  messageText.textContent = text;
  messageText.className = type;
  messageSection.style.display = 'block';

  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      messageSection.style.display = 'none';
    }, 3000);
  }
}
