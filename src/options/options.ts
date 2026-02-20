import { DEFAULT_BUTTON_TEXT, STORAGE_KEYS } from '../types';

const buttonTextInput = document.getElementById('buttonText') as HTMLInputElement;
const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
const resetButton = document.getElementById('resetButton') as HTMLButtonElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

function showStatus(message: string, type: 'success' | 'error'): void {
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';

  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

async function loadSettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.BUTTON_TEXT], (result) => {
      buttonTextInput.value = result[STORAGE_KEYS.BUTTON_TEXT] || DEFAULT_BUTTON_TEXT;
      resolve();
    });
  });
}

async function saveSettings(): Promise<void> {
  const buttonText = buttonTextInput.value.trim() || DEFAULT_BUTTON_TEXT;

  return new Promise((resolve) => {
    chrome.storage.sync.set(
      { [STORAGE_KEYS.BUTTON_TEXT]: buttonText },
      () => {
        if (chrome.runtime.lastError) {
          showStatus('Failed to save settings', 'error');
        } else {
          showStatus('Settings saved successfully!', 'success');
        }
        resolve();
      }
    );
  });
}

async function resetSettings(): Promise<void> {
  buttonTextInput.value = DEFAULT_BUTTON_TEXT;

  return new Promise((resolve) => {
    chrome.storage.sync.set(
      { [STORAGE_KEYS.BUTTON_TEXT]: DEFAULT_BUTTON_TEXT },
      () => {
        if (chrome.runtime.lastError) {
          showStatus('Failed to reset settings', 'error');
        } else {
          showStatus('Settings reset to default!', 'success');
        }
        resolve();
      }
    );
  });
}

// Event listeners
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

// Save on Enter key
buttonTextInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    saveSettings();
  }
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
