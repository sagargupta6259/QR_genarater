import QRCode from 'qrcode';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';

// State management
const state = {
  currentUrl: 'https://google.com',
  qrColor: '#0f172a',
  bgColor: '#ffffff',
  ecLevel: 'H', // High error correction
  resolution: 1024,
  isGenerated: false
};

// DOM Elements
const urlInput = document.getElementById('urlInput');
const inputWrapper = document.getElementById('inputWrapper');
const inputClearBtn = document.getElementById('inputClearBtn');
const pasteBtn = document.getElementById('pasteBtn');
const urlValidationMsg = document.getElementById('urlValidationMsg');
const validationText = document.getElementById('validationText');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const previewCard = document.getElementById('previewCard');
const emptyStateCard = document.getElementById('emptyStateCard');
const qrCanvas = document.getElementById('qrCanvas');
const qrLoading = document.getElementById('qrLoading');
const targetUrlLink = document.getElementById('targetUrlLink');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const copyImgBtn = document.getElementById('copyImgBtn');
const verifyScanBtn = document.getElementById('verifyScanBtn');
const payloadVerificationBox = document.getElementById('payloadVerificationBox');
const decodedPayloadText = document.getElementById('decodedPayloadText');
const customizerToggle = document.getElementById('customizerToggle');
const customizerBody = document.getElementById('customizerBody');
const customizerCard = document.querySelector('.customizer-card');
const ecLevelSelect = document.getElementById('ecLevelSelect');
const resolutionSelect = document.getElementById('resolutionSelect');
const qrColorInput = document.getElementById('qrColorInput');
const colorSwatches = document.querySelectorAll('.swatch');
const presetChips = document.querySelectorAll('.chip-btn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastContainer = document.getElementById('toastContainer');

// ==========================================
// 1. Validation Logic
// ==========================================

/**
 * Validates whether the given string is a valid web URL.
 * Requires http:// or https:// protocol, valid domain structure.
 */
function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (trimmed.length === 0) return false;

  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    // Protocol check
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Hostname check: must have at least one dot or be localhost
    const host = parsed.hostname;
    if (!host) return false;
    if (host !== 'localhost' && !host.includes('.')) {
      return false;
    }
    // Must not end with a trailing dot
    if (host.endsWith('.')) return false;
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Shows inline validation error
 */
function showError(message = 'Please enter a valid URL.') {
  validationText.textContent = message;
  urlValidationMsg.classList.remove('hidden');
  inputWrapper.classList.add('input-error');
  urlInput.setAttribute('aria-invalid', 'true');
}

/**
 * Clears inline validation error
 */
function clearError() {
  urlValidationMsg.classList.add('hidden');
  inputWrapper.classList.remove('input-error');
  urlInput.removeAttribute('aria-invalid');
}

// ==========================================
// 2. QR Code Generation
// ==========================================

/**
 * Generates the QR code onto the canvas element
 */
async function generateQRCode(rawUrl, triggerConfetti = false) {
  const trimmedUrl = (rawUrl || '').trim();

  // Validate Step
  if (!isValidUrl(trimmedUrl)) {
    showError('Please enter a valid URL.');
    return false;
  }

  clearError();
  state.currentUrl = trimmedUrl;
  state.isGenerated = true;

  // Show loading indicator
  if (qrLoading) qrLoading.classList.remove('hidden');

  try {
    // Render to display Canvas (optimized for crisp screen display)
    await QRCode.toCanvas(qrCanvas, trimmedUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: state.qrColor,
        light: state.bgColor
      },
      errorCorrectionLevel: state.ecLevel
    });

    // Update target URL display
    targetUrlLink.textContent = trimmedUrl;
    targetUrlLink.href = trimmedUrl;

    // Ensure preview card is visible
    previewCard.classList.remove('hidden');
    emptyStateCard.classList.add('hidden');

    // Auto update payload verification box if already opened
    if (!payloadVerificationBox.classList.contains('hidden')) {
      verifyCanvasPayload();
    }

    // Optional confetti celebration on manual generate click
    if (triggerConfetti) {
      triggerSparkles();
    }

    return true;
  } catch (error) {
    console.error('QR Generation failed:', error);
    showToast('Failed to generate QR Code. Please check URL.', 'error');
    return false;
  } finally {
    if (qrLoading) qrLoading.classList.add('hidden');
  }
}

/**
 * Visual sparkle/confetti effect
 */
function triggerSparkles() {
  try {
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981']
    });
  } catch (e) {
    // Confetti is purely decorative
  }
}

// ==========================================
// 3. Download & Export Features
// ==========================================

/**
 * Downloads the QR Code as high resolution PNG named "qr-code.png"
 */
async function downloadPNG() {
  if (!state.isGenerated || !state.currentUrl) {
    showToast('Please generate a QR code first.', 'error');
    return;
  }

  try {
    // Generate high resolution canvas in memory for maximum print/scan quality
    const exportSize = parseInt(state.resolution, 10) || 1024;
    const offscreenCanvas = document.createElement('canvas');

    await QRCode.toCanvas(offscreenCanvas, state.currentUrl, {
      width: exportSize,
      margin: 2,
      color: {
        dark: state.qrColor,
        light: state.bgColor
      },
      errorCorrectionLevel: state.ecLevel
    });

    // Trigger download as qr-code.png
    const dataUrl = offscreenCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = 'qr-code.png';
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showToast('Downloaded qr-code.png successfully!', 'success');
  } catch (error) {
    console.error('PNG Download failed:', error);
    showToast('Download failed. Please try again.', 'error');
  }
}

/**
 * Downloads the QR Code as Scalable Vector Graphic (SVG)
 */
async function downloadSVG() {
  if (!state.isGenerated || !state.currentUrl) {
    showToast('Please generate a QR code first.', 'error');
    return;
  }

  try {
    const svgString = await QRCode.toString(state.currentUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: state.qrColor,
        light: state.bgColor
      },
      errorCorrectionLevel: state.ecLevel
    });

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.download = 'qr-code.svg';
    downloadLink.href = url;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    showToast('Downloaded qr-code.svg (Vector format)!', 'success');
  } catch (error) {
    console.error('SVG Download failed:', error);
    showToast('Failed to export SVG.', 'error');
  }
}

/**
 * Copies the QR code canvas image directly to the system clipboard
 */
async function copyQRImage() {
  if (!state.isGenerated || !state.currentUrl) {
    showToast('Please generate a QR code first.', 'error');
    return;
  }

  try {
    // Generate high resolution image for clipboard
    const offscreenCanvas = document.createElement('canvas');
    await QRCode.toCanvas(offscreenCanvas, state.currentUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: state.qrColor,
        light: state.bgColor
      },
      errorCorrectionLevel: state.ecLevel
    });

    offscreenCanvas.toBlob(async (blob) => {
      if (!blob) {
        showToast('Unable to copy image.', 'error');
        return;
      }

      if (navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('QR Code Image copied to clipboard!', 'success');
          return;
        } catch (clipErr) {
          console.warn('ClipboardItem write failed, fallback to copy URL', clipErr);
        }
      }
      showToast('Clipboard image write not supported in this browser.', 'error');
    }, 'image/png');
  } catch (error) {
    console.error('Copy QR Image failed:', error);
    showToast('Failed to copy QR image.', 'error');
  }
}

/**
 * Copies the active URL string to clipboard
 */
async function copyTargetUrl() {
  if (!state.currentUrl) return;

  try {
    await navigator.clipboard.writeText(state.currentUrl);
    showToast('URL copied to clipboard!', 'success');

    // Visual button bounce
    const copyLabel = copyUrlBtn.querySelector('.copy-label');
    if (copyLabel) {
      const originalText = copyLabel.textContent;
      copyLabel.textContent = 'Copied!';
      setTimeout(() => {
        copyLabel.textContent = originalText;
      }, 1800);
    }
  } catch (err) {
    // Fallback using temporary textarea
    const textArea = document.createElement('textarea');
    textArea.value = state.currentUrl;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('URL copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy URL.', 'error');
    }
    document.body.removeChild(textArea);
  }
}

// ==========================================
// 4. In-Browser Verification Tool (jsQR)
// ==========================================

/**
 * Reads the canvas pixels and uses jsQR to decode the QR payload directly on-device.
 * Proves that the QR contains 100% exact direct URL with no intermediary.
 */
function verifyCanvasPayload() {
  try {
    const ctx = qrCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data) {
      decodedPayloadText.textContent = code.data;
      payloadVerificationBox.classList.remove('hidden');
      
      const isMatch = code.data === state.currentUrl;
      if (isMatch) {
        showToast('✓ Verified: QR code directly encodes your exact URL!', 'success');
      }
    } else {
      showToast('Unable to read QR code from canvas.', 'error');
    }
  } catch (e) {
    console.error('Verification error:', e);
    showToast('Verification error.', 'error');
  }
}

// ==========================================
// 5. Toast Notification System
// ==========================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconSvg = type === 'success' 
    ? `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M20 6L9 17l-5-5"></path></svg>`
    : `<svg class="toast-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 250ms forwards';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3200);
}

// ==========================================
// 6. Theme Toggle & Persistence
// ==========================================

function initTheme() {
  const savedTheme = localStorage.getItem('qr_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('qr_theme', nextTheme);
}

// ==========================================
// 7. Event Handlers & Initialization
// ==========================================

function setupEventListeners() {
  // Input real-time clearing button visibility
  urlInput.addEventListener('input', () => {
    if (urlInput.value.length > 0) {
      inputClearBtn.classList.remove('hidden');
    } else {
      inputClearBtn.classList.add('hidden');
    }
    // Clear validation error on type if previously errored
    if (!urlValidationMsg.classList.contains('hidden')) {
      clearError();
    }
  });

  // Enter key press inside input triggers generate
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateQRCode(urlInput.value, true);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  });

  // Clear icon inside input
  inputClearBtn.addEventListener('click', () => {
    urlInput.value = '';
    inputClearBtn.classList.add('hidden');
    clearError();
    urlInput.focus();
  });

  // Paste button
  pasteBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          urlInput.value = clipText.trim();
          inputClearBtn.classList.remove('hidden');
          clearError();
          generateQRCode(urlInput.value, true);
          showToast('Pasted and generated QR Code!', 'success');
          return;
        }
      }
      showToast('Clipboard access not granted or empty.', 'error');
    } catch (err) {
      urlInput.focus();
      showToast('Please press Ctrl+V / Cmd+V to paste.', 'error');
    }
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    generateQRCode(urlInput.value, true);
  });

  // Clear Button Click (Resets everything cleanly)
  clearBtn.addEventListener('click', handleClear);

  function handleClear() {
    urlInput.value = '';
    inputClearBtn.classList.add('hidden');
    clearError();
    payloadVerificationBox.classList.add('hidden');
    urlInput.focus();
    showToast('Cleared input field', 'success');
  }

  // Preset Chips
  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const presetUrl = chip.getAttribute('data-url');
      if (presetUrl) {
        urlInput.value = presetUrl;
        inputClearBtn.classList.remove('hidden');
        clearError();
        generateQRCode(presetUrl, true);
      }
    });
  });

  // Download PNG Button
  downloadPngBtn.addEventListener('click', downloadPNG);

  // Download SVG Button
  downloadSvgBtn.addEventListener('click', downloadSVG);

  // Copy Image Button
  copyImgBtn.addEventListener('click', copyQRImage);

  // Copy URL Button
  copyUrlBtn.addEventListener('click', copyTargetUrl);

  // Verify Scan Payload Button
  verifyScanBtn.addEventListener('click', () => {
    if (payloadVerificationBox.classList.contains('hidden')) {
      verifyCanvasPayload();
    } else {
      payloadVerificationBox.classList.add('hidden');
    }
  });

  // Theme Toggle Button
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Customizer Accordion Toggle
  customizerToggle.addEventListener('click', () => {
    const isExpanded = customizerToggle.getAttribute('aria-expanded') === 'true';
    customizerToggle.setAttribute('aria-expanded', !isExpanded);
    customizerCard.classList.toggle('open', !isExpanded);
    customizerBody.classList.toggle('hidden', isExpanded);
  });

  // Swatch Color Selection
  colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
      const chosenColor = swatch.getAttribute('data-color');
      state.qrColor = chosenColor;
      qrColorInput.value = chosenColor;
      if (state.currentUrl) generateQRCode(state.currentUrl, false);
    });
  });

  // Custom Color Picker
  qrColorInput.addEventListener('input', (e) => {
    state.qrColor = e.target.value;
    colorSwatches.forEach((s) => s.classList.remove('active'));
    if (state.currentUrl) generateQRCode(state.currentUrl, false);
  });

  // Error Correction Select
  ecLevelSelect.addEventListener('change', (e) => {
    state.ecLevel = e.target.value;
    if (state.currentUrl) generateQRCode(state.currentUrl, false);
  });

  // Resolution Select
  resolutionSelect.addEventListener('change', (e) => {
    state.resolution = parseInt(e.target.value, 10);
  });
}

// ==========================================
// 8. Bootstrap Initial State
// ==========================================

function initApp() {
  initTheme();
  setupEventListeners();

  // Set default initial URL: https://google.com
  urlInput.value = 'https://google.com';
  inputClearBtn.classList.remove('hidden');

  // Generate initial QR code
  generateQRCode('https://google.com', false);
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
