// Background Service Worker for TailorAI
// Handles extension lifecycle events

console.log('TailorAI background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TailorAI extension installed - Welcome to TailorAI!');
  } else if (details.reason === 'update') {
    console.log('TailorAI extension updated');
  }
});

