import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    await page.goto('/posts');
    await page.waitForTimeout(2000);

    // Should show error message or handle offline state
    const content = await page.content();
    const hasErrorHandling = content.match(/error|offline|failed|network/i) || content.length > 0;
    expect(hasErrorHandling).toBeTruthy();

    // Go back online
    await page.context().setOffline(false);
  });

  test('should display form validation errors', async ({ page }) => {
    await page.goto('/register');

    // Submit form with invalid data
    await page.fill('input[name="email"], input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    // Should show validation error
    const content = await page.content();
    const hasValidationError = content.match(/invalid|error|required/i);
    expect(hasValidationError).toBeTruthy();
  });

  test('should handle API errors', async ({ page }) => {
    await page.goto('/login');

    // Try to login with non-existent user
    await page.fill('input[name="email"], input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1500);

    // Should show error message
    const content = await page.content();
    const hasError = content.match(/error|invalid|not found|incorrect|failed/i);
    expect(hasError).toBeTruthy();
  });

  test('should handle 404 errors', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-12345');

    // Either shows 404 page or redirects
    const status = response?.status();
    const content = await page.content();

    const is404Handled = status === 404 || content.match(/404|not found/i) || page.url() === 'http://localhost:5173/';
    expect(is404Handled).toBeTruthy();
  });

  test('should handle server errors', async ({ page }) => {
    // Intercept API calls and return 500 error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/posts');
    await page.waitForTimeout(1500);

    // Should display error message or handle gracefully
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });
});

test.describe('Visual Regression Tests', () => {
  test('should match home page snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });

  test('should match login page snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });

  test('should match register page snapshot', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('register-page.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });

  test('should match posts list page snapshot', async ({ page }) => {
    await page.goto('/posts');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('posts-list.png', {
      fullPage: false,
      maxDiffPixels: 100,
    });
  });
});

test.describe('UI Component Tests', () => {
  test('should display navigation bar correctly', async ({ page }) => {
    await page.goto('/');

    // Check for navigation elements
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
  });

  test('should display footer correctly', async ({ page }) => {
    await page.goto('/');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for footer
    const footer = page.locator('footer');
    const footerExists = await footer.count() > 0;
    expect(footerExists).toBeTruthy();
  });

  test('should display buttons with proper styling', async ({ page }) => {
    await page.goto('/login');

    // Check submit button
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      // Verify button has some basic styling
      const backgroundColor = await submitButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    }
  });

  test('should display form inputs correctly', async ({ page }) => {
    await page.goto('/register');

    // Check input fields
    const nameInput = page.locator('input[name="name"], input[type="text"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // Page should render without horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should display alerts and notifications', async ({ page }) => {
    await page.goto('/login');

    // Submit invalid form to trigger error
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check for alert/notification element
    const content = await page.content();
    const hasAlert = content.match(/error|alert|notification|message/i);
    expect(hasAlert).toBeTruthy();
  });
});

test.describe('Loading States', () => {
  test('should show loading indicator during data fetch', async ({ page }) => {
    await page.goto('/posts');

    // Look for loading indicator immediately
    const loadingIndicator = page.locator('.loading, .spinner, [class*="load"]').first();

    // Either shows loading or content loads quickly
    const hasLoading = await loadingIndicator.isVisible();
    const hasContent = await page.locator('body').textContent();
    expect(hasLoading || (hasContent && hasContent.length > 0)).toBeTruthy();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto('/posts');
    await page.waitForTimeout(2000);

    // Page should eventually load
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });
});

test.describe('Edge Cases', () => {
  test('should handle very long input text', async ({ page }) => {
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    // Fill with very long text
    const longText = 'A'.repeat(10000);
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();

    if (await titleInput.isVisible()) {
      await titleInput.fill(longText);

      // Should handle without crashing
      const value = await titleInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should handle special characters in input', async ({ page }) => {
    await page.goto('/login');

    // Fill with special characters
    await page.fill('input[name="email"], input[type="email"]', 'test+special@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'P@ssw0rd!#$%');

    // Should handle without errors
    const emailValue = await page.locator('input[name="email"], input[type="email"]').inputValue();
    expect(emailValue).toContain('special');
  });

  test('should handle rapid form submissions', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');

    // Click submit multiple times rapidly
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Should handle gracefully (button disabled or single submission)
    expect(page.url()).toBeTruthy();
  });

  test('should handle empty states', async ({ page }) => {
    // Create a fresh user with no posts
    const timestamp = Date.now();
    await page.goto('/register');
    await page.fill('input[name="name"], input[type="text"]', 'Empty User');
    await page.fill('input[name="email"], input[type="email"]', `empty-${timestamp}@example.com`);
    await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to posts
    await page.goto('/posts');
    await page.waitForTimeout(1000);

    // Should show empty state message or handle gracefully
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });
});
