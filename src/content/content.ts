import { DEFAULT_BUTTON_TEXT, STORAGE_KEYS } from '../types';

const LGTM_BUTTON_ID = 'gh-enhance-lgtm-button';

async function getButtonText(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.BUTTON_TEXT], (result) => {
      resolve(result[STORAGE_KEYS.BUTTON_TEXT] || DEFAULT_BUTTON_TEXT);
    });
  });
}

function createLgtmButton(buttonText: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = LGTM_BUTTON_ID;
  button.textContent = buttonText;
  button.type = 'button';

  // GitHub-like button styling (match Submit review button height)
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: #ffffff;
    background-color: #238636;
    border: 1px solid rgba(240, 246, 252, 0.1);
    border-radius: 6px;
    cursor: pointer;
    margin-right: 8px;
    transition: background-color 0.2s ease;
    box-sizing: border-box;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#2ea043';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#238636';
  });

  button.addEventListener('click', handleLgtmClick);

  return button;
}

function getPrInfo(): { owner: string; repo: string; pullNumber: string } | null {
  const match = window.location.pathname.match(/\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], pullNumber: match[3] };
}

function getHeadSha(): string | null {
  const html = document.documentElement.innerHTML;

  // Find all 40-char hex strings that look like SHAs
  const allShas = html.match(/[a-f0-9]{40}/g) || [];
  console.log('GH Enhance: Found SHAs:', [...new Set(allShas)]);

  // Look for patterns near "head" keyword
  const headPatterns = html.match(/.{0,30}head.{0,50}[a-f0-9]{40}.{0,10}/gi) || [];
  console.log('GH Enhance: Head patterns:', headPatterns.slice(0, 5));

  // Method 1: Look for specific JSON patterns
  const patterns = [
    /"headRefOid":"([a-f0-9]{40})"/,
    /"headOid":"([a-f0-9]{40})"/,
    /"head_sha":"([a-f0-9]{40})"/,
    /"headSha":"([a-f0-9]{40})"/,
    /"oid":"([a-f0-9]{40})"/,
    /head.*?([a-f0-9]{40})/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      console.log('GH Enhance: Found SHA with pattern:', pattern, match[1]);
      return match[1];
    }
  }

  // Method 2: Look for commit links
  const commitLinks = document.querySelectorAll('a[href*="/commit/"]');
  console.log('GH Enhance: Commit links found:', commitLinks.length);
  for (const link of commitLinks) {
    const href = link.getAttribute('href') || '';
    const match = href.match(/\/commit\/([a-f0-9]{7,40})/);
    if (match) {
      console.log('GH Enhance: Found SHA from commit link:', match[1]);
      return match[1];
    }
  }

  return null;
}

async function handleLgtmClick(event: Event): Promise<void> {
  event.preventDefault();
  event.stopPropagation();

  const button = event.target as HTMLButtonElement;
  const originalText = button.textContent;
  button.textContent = 'Sending...';
  button.disabled = true;

  try {
    const prInfo = getPrInfo();
    if (!prInfo) {
      throw new Error('Could not parse PR info from URL');
    }

    const headSha = getHeadSha();
    if (!headSha) {
      throw new Error('Could not find head SHA');
    }

    const commentText = await getButtonText();

    // Use GitHub's new React API endpoint
    const response = await fetch(
      `/${prInfo.owner}/${prInfo.repo}/pull/${prInfo.pullNumber}/page_data/submit_review`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'github-verified-fetch': 'true',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          body: commentText,
          event: 'approve',
          headSha: headSha,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Request failed: ${response.status} ${errorText}`);
    }

    button.textContent = 'Done!';
    button.style.backgroundColor = '#238636';

    setTimeout(() => {
      // Redirect to PR main page (not /changes or /files)
      const prInfo = getPrInfo();
      if (prInfo) {
        window.location.href = `/${prInfo.owner}/${prInfo.repo}/pull/${prInfo.pullNumber}`;
      } else {
        window.location.reload();
      }
    }, 500);
  } catch (error) {
    console.error('GH Enhance Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    button.textContent = 'Error!';
    button.title = message;
    button.style.backgroundColor = '#da3633';
    setTimeout(() => {
      button.textContent = originalText;
      button.title = '';
      button.disabled = false;
      button.style.backgroundColor = '#238636';
    }, 3000);
  }
}

async function insertLgtmButton(): Promise<void> {
  // Check if button already exists
  if (document.getElementById(LGTM_BUTTON_ID)) {
    return;
  }

  // Find "Submit review" button in the top toolbar
  let submitReviewButton: Element | null = null;

  // Look for the Submit review button by text content
  const allButtons = document.querySelectorAll('button');
  for (const btn of allButtons) {
    const text = btn.textContent?.trim();
    if (text?.includes('Submit review') || text?.includes('Review changes')) {
      submitReviewButton = btn;
      break;
    }
  }

  // Alternative: find by common GitHub selectors
  if (!submitReviewButton) {
    const selectors = [
      '[data-target="reviews-comment-composer.reviewsButton"]',
      '.js-reviews-toggle',
      '[aria-label="Submit review"]',
    ];
    for (const selector of selectors) {
      submitReviewButton = document.querySelector(selector);
      if (submitReviewButton) break;
    }
  }

  if (submitReviewButton) {
    const buttonText = await getButtonText();
    const lgtmButton = createLgtmButton(buttonText);

    // Insert before the Submit review button
    const parent = submitReviewButton.parentElement;
    if (parent) {
      parent.insertBefore(lgtmButton, submitReviewButton);
    }
  }
}

// Listen for storage changes to update button text
chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEYS.BUTTON_TEXT]) {
    const button = document.getElementById(LGTM_BUTTON_ID);
    if (button) {
      button.textContent = changes[STORAGE_KEYS.BUTTON_TEXT].newValue || DEFAULT_BUTTON_TEXT;
    }
  }
});

// Check if current page should show the button
function isTargetPage(): boolean {
  const path = window.location.pathname;
  return path.includes('/pull/') && (path.includes('/files') || path.includes('/changes'));
}

// Track URL changes for SPA navigation
let lastUrl = location.href;

// Poll for URL changes
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (isTargetPage()) {
      insertLgtmButton();
    }
  }
}, 200);

// Initial check
if (isTargetPage()) {
  insertLgtmButton();
}

// Re-check on DOM changes
const observer = new MutationObserver(() => {
  if (isTargetPage()) {
    insertLgtmButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
