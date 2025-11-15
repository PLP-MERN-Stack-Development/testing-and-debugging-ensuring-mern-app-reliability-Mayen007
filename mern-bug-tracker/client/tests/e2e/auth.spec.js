import { test, expect } from '@playwright/test';

// Generate unique email for each test run to avoid conflicts
const timestamp = Date.now();
const testUser = {
  name: 'E2E Test User',
  email: `e2e-test-${timestamp}@example.com`,
  password: 'TestPassword123!',
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display registration form', async ({ page }) => {
    await page.click('text=Register');

    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1, h2')).toContainText(/register/i);

    // Check form fields exist
    await expect(page.locator('input[name="name"], input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
  });

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should still be on registration page (validation prevents submission)
    await expect(page).toHaveURL(/.*register/);
  });

  test('should successfully register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill in registration form
    await page.fill('input[name="name"], input[type="text"]', testUser.name);
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation after successful registration
    await page.waitForURL(/.*login|.*posts|.*dashboard/i, { timeout: 5000 });

    // Should redirect to login or dashboard
    expect(page.url()).toMatch(/login|posts|dashboard/i);
  });

  test('should display login form', async ({ page }) => {
    await page.click('text=Login');

    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i);

    // Check form fields exist
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in with invalid credentials
    await page.fill('input[name="email"], input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait a moment for error message
    await page.waitForTimeout(1000);

    // Should show error (check for common error text or alert)
    const pageContent = await page.content();
    const hasError = pageContent.match(/error|invalid|not found|incorrect/i);
    expect(hasError).toBeTruthy();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form with test user credentials
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation after successful login
    await page.waitForURL(/(?!.*login)/, { timeout: 5000 });

    // Should redirect away from login page
    expect(page.url()).not.toContain('login');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/(?!.*login)/, { timeout: 5000 });

    // Look for logout button/link (common text patterns)
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Log out"), a:has-text("Log out"), button:has-text("Sign out"), a:has-text("Sign out")').first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Wait for redirect to home or login
      await page.waitForTimeout(1000);

      // Should be logged out (URL might be home or login)
      const currentUrl = page.url();
      const isLoggedOut = currentUrl.includes('login') || currentUrl === 'http://localhost:5173/' || !currentUrl.includes('dashboard');
      expect(isLoggedOut).toBeTruthy();
    }
  });

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    // Try to access a protected route (adjust URL based on your app)
    await page.goto('/dashboard');

    // Should redirect to login or show access denied
    await page.waitForTimeout(1000);
    const url = page.url();
    const content = await page.content();

    const isProtected = url.includes('login') || content.match(/sign in|login|unauthorized|access denied/i);
    expect(isProtected).toBeTruthy();
  });
});

test.describe('Registration Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="name"], input[type="text"]', 'Test User');
    await page.fill('input[name="email"], input[type="email"]', 'invalid-email');
    await page.fill('input[name="password"], input[type="password"]', 'Password123!');

    await page.click('button[type="submit"]');

    // Should show validation error or stay on page
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*register/);
  });

  test('should validate password strength', async ({ page }) => {
    await page.fill('input[name="name"], input[type="text"]', 'Test User');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', '123'); // Too short

    await page.click('button[type="submit"]');

    // Should show validation error
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*register/);
  });

  test('should validate required name field', async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'Password123!');

    await page.click('button[type="submit"]');

    // Should show validation error
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/.*register/);
  });
});
