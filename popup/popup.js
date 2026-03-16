// State
let settingsOpen = false;
let lastResult = null; // { coverLetter, jobData, filename }

// DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsIcon = document.getElementById('settingsIcon');
const closeIcon = document.getElementById('closeIcon');

const setupCards = document.getElementById('setupCards');
const apiKeyCard = document.getElementById('apiKeyCard');
const cvCard = document.getElementById('cvCard');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const cvCardHint = document.getElementById('cvCardHint');
const uploadCvBtn = document.getElementById('uploadCvBtn');
const cvUploadInput = document.getElementById('cvUpload');

const settingsPanel = document.getElementById('settingsPanel');
const cvFileName = document.getElementById('cvFileName');
const cvUserName = document.getElementById('cvUserName');
const replaceCvBtn = document.getElementById('replaceCvBtn');
const deleteCvBtn = document.getElementById('deleteCvBtn');
const cvUploadSettings = document.getElementById('cvUploadSettings');
const apiKeyMasked = document.getElementById('apiKeyMasked');
const apiKeyDisplay = document.getElementById('apiKeyDisplay');
const apiKeyUpdateRow = document.getElementById('apiKeyUpdateRow');
const apiKeyUpdateInput = document.getElementById('apiKeyUpdateInput');
const updateApiKeyBtn = document.getElementById('updateApiKeyBtn');
const showApiKeyUpdateBtn = document.getElementById('showApiKeyUpdateBtn');

const resultCard = document.getElementById('resultCard');
const resultJobTitle = document.getElementById('resultJobTitle');
const resultCompany = document.getElementById('resultCompany');
const resultFilename = document.getElementById('resultFilename');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

const tailorBtn = document.getElementById('tailorBtn');
const btnText = tailorBtn.querySelector('.btn-text');
const loader = tailorBtn.querySelector('.loader');
const hintText = document.getElementById('hintText');

const messageSection = document.getElementById('messageSection');
const messageText = document.getElementById('messageText');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupEventListeners();
  await refreshUI();
}

function setupEventListeners() {
  settingsBtn.addEventListener('click', toggleSettings);

  // Setup card listeners
  saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  uploadCvBtn.addEventListener('click', () => cvUploadInput.click());
  cvUploadInput.addEventListener('change', handleCVUpload);

  // Settings panel listeners
  replaceCvBtn.addEventListener('click', () => cvUploadSettings.click());
  cvUploadSettings.addEventListener('change', handleCVUpload);
  deleteCvBtn.addEventListener('click', handleDeleteCV);
  showApiKeyUpdateBtn.addEventListener('click', () => {
    apiKeyDisplay.style.display = 'none';
    showApiKeyUpdateBtn.style.display = 'none';
    apiKeyUpdateRow.style.display = 'flex';
    apiKeyUpdateInput.focus();
  });
  updateApiKeyBtn.addEventListener('click', handleUpdateApiKey);

  // Result card listeners
  copyBtn.addEventListener('click', handleCopy);
  downloadBtn.addEventListener('click', handleDownload);

  // Tailor button
  tailorBtn.addEventListener('click', handleTailorClick);
}

// ===== STATE MANAGEMENT =====

async function refreshUI() {
  const result = await chrome.storage.local.get(['cvMetadata', 'openaiApiKey']);
  const hasCV = !!result.cvMetadata;
  const hasApiKey = !!result.openaiApiKey;
  const setupComplete = hasCV && hasApiKey;

  // Setup cards: show only when setup incomplete
  if (!setupComplete) {
    apiKeyCard.style.display = hasApiKey ? 'none' : 'block';

    if (!hasApiKey) {
      cvCard.style.display = 'block';
      cvCardHint.textContent = 'Save your API key first';
      uploadCvBtn.disabled = true;
    } else if (!hasCV) {
      cvCard.style.display = 'block';
      cvCardHint.textContent = 'PDF or DOCX';
      uploadCvBtn.disabled = false;
    } else {
      cvCard.style.display = 'none';
    }
  } else {
    apiKeyCard.style.display = 'none';
    cvCard.style.display = 'none';
  }

  // Gear icon: show only when setup complete
  settingsBtn.style.display = setupComplete ? 'flex' : 'none';

  // Settings panel: close if setup not complete
  if (!setupComplete && settingsOpen) {
    settingsOpen = false;
    settingsPanel.style.display = 'none';
    settingsIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }

  // Update settings panel content if open
  if (settingsOpen && setupComplete) {
    updateSettingsContent(result.cvMetadata, result.openaiApiKey);
  }

  // Tailor button + hint
  if (!setupComplete) {
    tailorBtn.disabled = true;
    if (!hasApiKey) {
      hintText.textContent = 'Add your API key to get started';
    } else {
      hintText.textContent = 'Upload your CV to get started';
    }
  } else {
    tailorBtn.disabled = false;
    hintText.textContent = lastResult
      ? 'Generate another cover letter'
      : 'Generate a cover letter for this job posting';
  }

  // Result card persists if present
  if (lastResult) {
    showResultCard(lastResult.jobData, lastResult.filename);
  }
}

function updateSettingsContent(cvMetadata, apiKey) {
  if (cvMetadata) {
    const date = new Date(cvMetadata.uploadDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
    cvFileName.textContent = `${cvMetadata.fileName} · ${date}`;
    cvUserName.textContent = cvMetadata.fullName || `${cvMetadata.firstName} ${cvMetadata.lastName}`;
  }
  if (apiKey) {
    apiKeyMasked.textContent = apiKey.substring(0, 6) + '····';
  }
}

// ===== SETTINGS TOGGLE =====

function toggleSettings() {
  settingsOpen = !settingsOpen;
  if (settingsOpen) {
    settingsPanel.style.display = 'block';
    settingsIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    // Reset update row state
    apiKeyDisplay.style.display = 'flex';
    showApiKeyUpdateBtn.style.display = 'inline-block';
    apiKeyUpdateRow.style.display = 'none';
    apiKeyUpdateInput.value = '';
    refreshUI();
  } else {
    settingsPanel.style.display = 'none';
    settingsIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }
}

// ===== SETUP: SAVE API KEY =====

async function handleSaveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showMessage('Please enter an API key', 'error');
    return;
  }
  if (!apiKey.startsWith('AIza')) {
    showMessage('Invalid API key format. Gemini keys start with "AIza"', 'error');
    return;
  }
  try {
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    showMessage('API key saved', 'success');
    apiKeyInput.value = '';
    await refreshUI();
  } catch (error) {
    console.error('Error saving API key:', error);
    showMessage('Error saving API key', 'error');
  }
}

// ===== SETTINGS: UPDATE API KEY =====

async function handleUpdateApiKey() {
  const apiKey = apiKeyUpdateInput.value.trim();
  if (!apiKey) {
    showMessage('Please enter an API key', 'error');
    return;
  }
  if (!apiKey.startsWith('AIza')) {
    showMessage('Invalid API key format. Gemini keys start with "AIza"', 'error');
    return;
  }
  try {
    await chrome.storage.local.set({ openaiApiKey: apiKey });
    showMessage('API key updated', 'success');
    apiKeyUpdateInput.value = '';
    apiKeyDisplay.style.display = 'flex';
    showApiKeyUpdateBtn.style.display = 'inline-block';
    apiKeyUpdateRow.style.display = 'none';
    await refreshUI();
  } catch (error) {
    console.error('Error saving API key:', error);
    showMessage('Error saving API key', 'error');
  }
}

// ===== CV UPLOAD =====

async function handleCVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    showMessage('Please upload a PDF or DOCX file', 'error');
    return;
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showMessage('File size must be less than 10MB', 'error');
    return;
  }

  showMessage('Processing CV...', 'info');

  try {
    const storage = await chrome.storage.local.get(['openaiApiKey']);
    if (!storage.openaiApiKey) {
      showMessage('Please save your API key first', 'info');
      cvUploadInput.value = '';
      cvUploadSettings.value = '';
      return;
    }

    const cvText = await extractTextFromCV(file);

    const validation = validateCVText(cvText);
    if (!validation.valid) {
      showMessage(validation.message, 'error');
      return;
    }

    showMessage('Extracting contact information...', 'info');
    const metadata = await createCVMetadata(file.name, cvText, storage.openaiApiKey);

    await chrome.storage.local.set({
      cvText: metadata.fullText,
      cvMetadata: metadata
    });

    showMessage('Preparing cover letter template...', 'info');
    const partialTemplate = await populateCVMetadataHtml(metadata);
    await storePartialHtmlTemplate(partialTemplate);

    showMessage('CV uploaded successfully!', 'success');

    cvUploadInput.value = '';
    cvUploadSettings.value = '';
    await refreshUI();
  } catch (error) {
    console.error('Error uploading CV:', error);
    showMessage('Error uploading CV: ' + error.message, 'error');
    cvUploadInput.value = '';
    cvUploadSettings.value = '';
  }
}

// ===== CV DELETE =====

async function handleDeleteCV() {
  if (!confirm('Are you sure you want to delete your CV?')) return;

  try {
    await chrome.storage.local.remove(['cvText', 'cvMetadata', 'htmlTemplate']);
    settingsOpen = false;
    settingsPanel.style.display = 'none';
    settingsIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    showMessage('CV deleted', 'success');
    await refreshUI();
  } catch (error) {
    console.error('Error deleting CV:', error);
    showMessage('Error deleting CV', 'error');
  }
}

// ===== RESULT CARD =====

function showResultCard(jobData, filename) {
  resultJobTitle.textContent = jobData.jobTitle || 'Cover Letter';
  resultCompany.textContent = jobData.company ? `at ${jobData.company}` : '';
  resultFilename.textContent = filename || '';
  resultCard.style.display = 'block';
}

function hideResultCard() {
  resultCard.style.display = 'none';
}

// ===== RESULT ACTIONS =====

async function handleCopy() {
  if (!lastResult) return;
  try {
    await navigator.clipboard.writeText(lastResult.coverLetter);
    showMessage('Copied to clipboard', 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showMessage('Failed to copy', 'error');
  }
}

async function handleDownload() {
  if (!lastResult) return;
  try {
    const cvData = await chrome.storage.local.get(['cvMetadata']);
    await generateCoverLetterPDF(lastResult.coverLetter, lastResult.jobData, cvData.cvMetadata);
    showMessage('PDF downloaded', 'success');
  } catch (err) {
    console.error('Failed to download PDF:', err);
    showMessage('Failed to download PDF', 'error');
  }
}

// ===== TAILOR =====

async function handleTailorClick() {
  const result = await chrome.storage.local.get(['openaiApiKey', 'cvText']);

  if (!result.openaiApiKey) {
    showMessage('Please add your Gemini API key', 'error');
    return;
  }

  if (!result.cvText) {
    showMessage('Please upload your CV first', 'error');
    return;
  }

  // Hide previous result
  hideResultCard();
  lastResult = null;

  setLoadingState(true);
  hintText.textContent = 'Extracting job posting...';

  try {
    const jobData = await extractJobPostingFromActiveTab();

    if (!jobData || !jobData.jobTitle || !jobData.description) {
      showMessage('Could not extract job posting. Make sure you are on a job posting page.', 'error');
      setLoadingState(false);
      hintText.textContent = 'Generate a cover letter for this job posting';
      return;
    }

    if (jobData.source === 'Unsupported') {
      showMessage(jobData.error || 'This site is not supported. Please use Handshake.', 'error');
      setLoadingState(false);
      hintText.textContent = 'Generate a cover letter for this job posting';
      return;
    }

    await chrome.storage.local.set({ currentJobData: jobData });

    hintText.textContent = `Generating cover letter for ${jobData.jobTitle}...`;

    const coverLetter = await generateCoverLetter(result.cvText, jobData, result.openaiApiKey);
    await chrome.storage.local.set({ currentCoverLetter: coverLetter });

    const cvData = await chrome.storage.local.get(['cvMetadata']);

    hintText.textContent = 'Generating PDF...';
    const filename = await generateCoverLetterPDF(coverLetter, jobData, cvData.cvMetadata);

    // Store result and show card
    lastResult = { coverLetter, jobData, filename };
    showResultCard(jobData, filename);
    showMessage('Cover letter generated and PDF downloaded!', 'success');
  } catch (error) {
    console.error('Error generating cover letter:', error);
    showMessage('Error: ' + error.message, 'error');
  } finally {
    setLoadingState(false);
    await refreshUI();
  }
}

// ===== UTILITIES =====

async function extractJobPostingFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error('No active tab found');

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
    if (error.message.includes('Could not establish connection')) {
      throw new Error('Please refresh the job posting page and try again');
    }
    throw error;
  }
}

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

function showMessage(text, type) {
  messageText.textContent = text;
  messageText.className = type;
  messageSection.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      messageSection.style.display = 'none';
    }, 3000);
  }
}
