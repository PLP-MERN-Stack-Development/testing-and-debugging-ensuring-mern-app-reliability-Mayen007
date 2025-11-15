/**
 * E2E Test Helpers and Utilities
 * Common functions used across Playwright test files
 */

/**
 * Generate unique test user credentials
 * @returns {Object} User object with name, email, password
 */
export function generateTestUser(prefix = 'e2e-test') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    name: `${prefix} User ${random}`,
    email: `${prefix}-${timestamp}-${random}@example.com`,
    password: 'TestPassword123!',
  };
}

/**
 * Login helper function
 * @param {Page} page - Playwright page object
 * @param {Object} credentials - User credentials {email, password}
 */
export async function login(page, credentials) {
  await page.goto('/login');
  await page.fill('input[name="email"], input[type="email"]', credentials.email);
  await page.fill('input[name="password"], input[type="password"]', credentials.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/(?!.*login)/, { timeout: 5000 });
}

/**
 * Register helper function
 * @param {Page} page - Playwright page object
 * @param {Object} userData - User data {name, email, password}
 */
export async function register(page, userData) {
  await page.goto('/register');
  await page.fill('input[name="name"], input[type="text"]', userData.name);
  await page.fill('input[name="email"], input[type="email"]', userData.email);
  await page.fill('input[name="password"], input[type="password"]', userData.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

/**
 * Logout helper function
 * @param {Page} page - Playwright page object
 */
export async function logout(page) {
  const logoutButton = page.locator(
    'button:has-text("Logout"), a:has-text("Logout"), ' +
    'button:has-text("Log out"), a:has-text("Log out"), ' +
    'button:has-text("Sign out"), a:has-text("Sign out")'
  ).first();

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Create a test post
 * @param {Page} page - Playwright page object
 * @param {Object} postData - Post data {title, content, excerpt}
 * @returns {Object} Created post data
 */
export async function createTestPost(page, postData = {}) {
  const defaultPost = {
    title: `E2E Test Post ${Date.now()}`,
    content: 'This is test content created by E2E test',
    excerpt: 'Test excerpt',
    ...postData,
  };

  await page.goto('/posts/create');
  await page.waitForTimeout(500);

  // Fill title
  const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill(defaultPost.title);
  }

  // Fill content
  const contentInput = page.locator('textarea[name="content"], textarea[placeholder*="content" i], div[contenteditable="true"]').first();
  if (await contentInput.isVisible()) {
    await contentInput.fill(defaultPost.content);
  }

  // Fill excerpt if field exists
  const excerptInput = page.locator('input[name="excerpt"], textarea[name="excerpt"]').first();
  if (await excerptInput.isVisible()) {
    await excerptInput.fill(defaultPost.excerpt);
  }

  // Submit
  const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Post")').first();
  if (await submitButton.isVisible()) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }

  return defaultPost;
}

/**
 * Wait for API response
 * @param {Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to match
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForAPIResponse(page, urlPattern, timeout = 5000) {
  return page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

/**
 * Check if element exists
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {boolean} True if element exists
 */
export async function elementExists(page, selector) {
  return (await page.locator(selector).count()) > 0;
}

/**
 * Wait for element to be visible
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForElement(page, selector, timeout = 5000) {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout });
}

/**
 * Scroll to element
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 */
export async function scrollToElement(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
}

/**
 * Take screenshot with timestamp
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 */
export async function takeScreenshot(page, name) {
  const timestamp = Date.now();
  await page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
}

/**
 * Clear local storage
 * @param {Page} page - Playwright page object
 */
export async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set local storage item
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @param {any} value - Storage value
 */
export async function setStorageItem(page, key, value) {
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key, value }
  );
}

/**
 * Get local storage item
 * @param {Page} page - Playwright page object
 * @param {string} key - Storage key
 * @returns {any} Storage value
 */
export async function getStorageItem(page, key) {
  return page.evaluate(
    key => JSON.parse(localStorage.getItem(key)),
    key
  );
}

/**
 * Mock API response
 * @param {Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to match
 * @param {Object} responseData - Mock response data
 * @param {number} status - HTTP status code
 */
export async function mockAPIResponse(page, urlPattern, responseData, status = 200) {
  await page.route(`**/${urlPattern}**`, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Wait for network idle
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Fill form with data
 * @param {Page} page - Playwright page object
 * @param {Object} formData - Form data object {fieldName: value}
 */
export async function fillForm(page, formData) {
  for (const [fieldName, value] of Object.entries(formData)) {
    const input = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`).first();
    if (await input.isVisible()) {
      await input.fill(value.toString());
    }
  }
}

/**
 * Accept browser dialog
 * @param {Page} page - Playwright page object
 */
export function acceptDialog(page) {
  page.on('dialog', dialog => dialog.accept());
}

/**
 * Dismiss browser dialog
 * @param {Page} page - Playwright page object
 */
export function dismissDialog(page) {
  page.on('dialog', dialog => dialog.dismiss());
}
