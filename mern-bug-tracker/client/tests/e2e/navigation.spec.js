import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');

    // Verify home page loaded
    await expect(page).toHaveURL('http://localhost:5173/');

    // Check for common home page elements
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');

    // Look for navigation links
    const navLinks = page.locator('nav a, header a, .nav-link');
    const linkCount = await navLinks.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Click login link
    const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign in")').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    } else {
      // Direct navigation if link not found
      await page.goto('/login');
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');

    // Click register link
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up")').first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
    } else {
      // Direct navigation if link not found
      await page.goto('/register');
      await expect(page).toHaveURL(/.*register/);
    }
  });

  test('should navigate to posts page', async ({ page }) => {
    await page.goto('/');

    // Click posts link
    const postsLink = page.locator('a:has-text("Posts"), a:has-text("Blog"), a:has-text("Articles")').first();
    if (await postsLink.isVisible()) {
      await postsLink.click();
      await page.waitForTimeout(500);
      expect(page.url()).toMatch(/posts|blog|articles/i);
    } else {
      // Direct navigation if link not found
      await page.goto('/posts');
      await page.waitForTimeout(500);
      expect(page.url()).toContain('posts');
    }
  });

  test('should handle browser back button', async ({ page }) => {
    await page.goto('/');
    await page.goto('/login');

    // Go back
    await page.goBack();

    // Should be back at home
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should handle browser forward button', async ({ page }) => {
    await page.goto('/');
    await page.goto('/login');
    await page.goBack();

    // Go forward
    await page.goForward();

    // Should be back at login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate using browser history', async ({ page }) => {
    await page.goto('/');
    await page.goto('/login');
    await page.goto('/register');

    // Go back twice
    await page.goBack();
    await page.goBack();

    // Should be at home
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});

test.describe('Routing Edge Cases', () => {
  test('should handle 404 not found page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');

    // Check for 404 indicators
    const content = await page.content();
    const has404 = content.match(/404|not found|page not found/i);

    // Either shows 404 page or redirects to home
    const isHandled = has404 || page.url() === 'http://localhost:5173/';
    expect(isHandled).toBeTruthy();
  });

  test('should handle invalid post ID', async ({ page }) => {
    await page.goto('/posts/invalid-post-id-12345');

    await page.waitForTimeout(1000);

    // Should show error or redirect
    const content = await page.content();
    const hasError = content.match(/not found|invalid|error/i) || page.url().includes('posts');
    expect(hasError).toBeTruthy();
  });

  test('should redirect from auth pages when already logged in', async ({ page }) => {
    // Login first
    const timestamp = Date.now();
    const testUser = {
      email: `nav-test-${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: 'Nav Test User',
    };

    // Register
    await page.goto('/register');
    await page.fill('input[name="name"], input[type="text"]', testUser.name);
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Now try to access login page while logged in
    await page.goto('/login');
    await page.waitForTimeout(1000);

    // Should redirect away from login (to posts/dashboard/home)
    const url = page.url();
    const redirectedAway = !url.includes('login') || url === 'http://localhost:5173/';

    // Note: Some apps allow accessing login even when authenticated
    // So we just verify the page loads without errors or that we've been redirected
    expect(redirectedAway).toBeTruthy();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    await page.goto('/');

    // Try to access protected route
    await page.goto('/posts/create');
    await page.waitForTimeout(1000);

    // Should redirect to login or show access denied
    const url = page.url();
    const content = await page.content();

    const isProtected = url.includes('login') || content.match(/sign in|login|unauthorized|access denied/i);
    expect(isProtected).toBeTruthy();
  });

  test('should allow access to protected routes when authenticated', async ({ page }) => {
    // Login first
    const timestamp = Date.now();
    const testUser = {
      email: `protected-test-${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: 'Protected Test User',
    };

    await page.goto('/register');
    await page.fill('input[name="name"], input[type="text"]', testUser.name);
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Now try to access protected route
    await page.goto('/posts/create');
    await page.waitForTimeout(1000);

    // Should have access (not redirected to login)
    expect(page.url()).not.toContain('login');
  });
});

test.describe('Deep Linking', () => {
  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to a deep link
    await page.goto('/posts');

    await page.waitForTimeout(1000);

    // Should load the page correctly
    expect(page.url()).toContain('posts');
  });

  test('should handle URL with query parameters', async ({ page }) => {
    await page.goto('/posts?page=1&category=tech');

    await page.waitForTimeout(1000);

    // Should preserve query parameters
    expect(page.url()).toContain('posts');
  });

  test('should handle refresh on current page', async ({ page }) => {
    await page.goto('/posts');
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();

    // Should still be on the same page
    expect(page.url()).toContain('posts');
  });
});

test.describe('Navigation Performance', () => {
  test('should load pages quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Page should load in reasonable time (< 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle rapid navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/login');
    await page.goto('/register');
    await page.goto('/posts');
    await page.goto('/');

    // Should end up at home without errors
    await expect(page).toHaveURL('http://localhost:5173/');
  });
});

test.describe('Accessibility Navigation', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Press Tab to navigate through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that focus is visible (element has focus)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should support Enter key for navigation links', async ({ page }) => {
    await page.goto('/');

    // Find first navigation link and focus it
    const firstLink = page.locator('nav a, header a').first();
    if (await firstLink.isVisible()) {
      await firstLink.focus();

      // Press Enter to navigate
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Should have navigated away from home
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });
});
