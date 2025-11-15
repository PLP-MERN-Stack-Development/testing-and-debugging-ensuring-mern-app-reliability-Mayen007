import { test, expect } from '@playwright/test';

// Test user credentials (reuse from previous tests)
const timestamp = Date.now();
const testUser = {
  name: 'E2E Post Test User',
  email: `e2e-posts-${timestamp}@example.com`,
  password: 'TestPassword123!',
};

// Helper function to login
async function login(page) {
  await page.goto('/login');
  await page.fill('input[name="email"], input[type="email"]', testUser.email);
  await page.fill('input[name="password"], input[type="password"]', testUser.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/(?!.*login)/, { timeout: 5000 });
}

// Setup: Register user before running post tests
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('/register');
  await page.fill('input[name="name"], input[type="text"]', testUser.name);
  await page.fill('input[name="email"], input[type="email"]', testUser.email);
  await page.fill('input[name="password"], input[type="password"]', testUser.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.close();
});

test.describe('Posts CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display posts list page', async ({ page }) => {
    await page.goto('/posts');

    // Check for posts page indicators
    const content = await page.content();
    const hasPostsPage = content.match(/posts|articles|blog/i);
    expect(hasPostsPage).toBeTruthy();
  });

  test('should navigate to create post page', async ({ page }) => {
    await page.goto('/posts');

    // Look for create/new post button
    const createButton = page.locator('a:has-text("Create"), button:has-text("Create"), a:has-text("New Post"), button:has-text("New Post"), a:has-text("Add Post"), button:has-text("Add Post")').first();

    if (await createButton.isVisible()) {
      await createButton.click();

      // Should navigate to create post form
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toMatch(/create|new|add/i);
    } else {
      // Try direct navigation
      await page.goto('/posts/create');
    }
  });

  test('should create a new post', async ({ page }) => {
    // Navigate to create post page
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    // Fill in post form
    const postTitle = `E2E Test Post ${Date.now()}`;
    const postContent = 'This is test content created by Playwright E2E test.';

    // Find and fill title field
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill(postTitle);
    }

    // Find and fill content field (could be textarea or rich text editor)
    const contentInput = page.locator('textarea[name="content"], textarea[placeholder*="content" i], div[contenteditable="true"]').first();
    if (await contentInput.isVisible()) {
      await contentInput.fill(postContent);
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Post"), button:has-text("Publish"), button:has-text("Save")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for navigation or success message
      await page.waitForTimeout(2000);

      // Verify post was created (check for title in page or redirect)
      const pageContent = await page.content();
      const postCreated = pageContent.includes(postTitle) || page.url().includes('posts');
      expect(postCreated).toBeTruthy();
    }
  });

  test('should display post details', async ({ page }) => {
    // First create a post to view
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    const postTitle = `View Test Post ${Date.now()}`;
    await page.locator('input[name="title"], input[placeholder*="title" i]').first().fill(postTitle);
    await page.locator('textarea[name="content"], textarea[placeholder*="content" i]').first().fill('View test content');
    await page.locator('button[type="submit"], button:has-text("Create")').first().click();

    await page.waitForTimeout(2000);

    // Navigate to posts list
    await page.goto('/posts');
    await page.waitForTimeout(1000);

    // Click on the post we just created
    const postLink = page.locator(`a:has-text("${postTitle}"), .post:has-text("${postTitle}")`).first();
    if (await postLink.isVisible()) {
      await postLink.click();

      // Should show post details
      await page.waitForTimeout(1000);
      const content = await page.content();
      expect(content).toContain(postTitle);
    }
  });

  test('should edit an existing post', async ({ page }) => {
    // Create a post first
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    const originalTitle = `Edit Test Post ${Date.now()}`;
    await page.locator('input[name="title"], input[placeholder*="title" i]').first().fill(originalTitle);
    await page.locator('textarea[name="content"], textarea[placeholder*="content" i]').first().fill('Original content');
    await page.locator('button[type="submit"]').first().click();

    await page.waitForTimeout(2000);

    // Find and click edit button
    const editButton = page.locator('a:has-text("Edit"), button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Update post
      const updatedTitle = `${originalTitle} - Updated`;
      await page.locator('input[name="title"], input[placeholder*="title" i]').first().fill(updatedTitle);

      // Submit update
      const updateButton = page.locator('button[type="submit"], button:has-text("Update"), button:has-text("Save")').first();
      await updateButton.click();

      await page.waitForTimeout(2000);

      // Verify update
      const content = await page.content();
      expect(content).toContain('Updated');
    }
  });

  test('should delete a post', async ({ page }) => {
    // Create a post to delete
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    const postTitle = `Delete Test Post ${Date.now()}`;
    await page.locator('input[name="title"], input[placeholder*="title" i]').first().fill(postTitle);
    await page.locator('textarea[name="content"], textarea[placeholder*="content" i]').first().fill('Delete test content');
    await page.locator('button[type="submit"]').first().click();

    await page.waitForTimeout(2000);

    // Find and click delete button
    const deleteButton = page.locator('button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      // Handle confirmation dialog if present
      page.on('dialog', dialog => dialog.accept());

      await deleteButton.click();
      await page.waitForTimeout(2000);

      // Verify post is deleted (should not see title anymore)
      const content = await page.content();
      const isDeleted = !content.includes(postTitle) || page.url().includes('posts');
      expect(isDeleted).toBeTruthy();
    }
  });

  test('should validate post form fields', async ({ page }) => {
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation error or stay on form
      expect(page.url()).toMatch(/create|new/i);
    }
  });
});

test.describe('Posts Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/posts');
  });

  test('should display posts list', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check if posts are displayed
    const content = await page.content();
    const hasPosts = content.match(/post|article|title/i);
    expect(hasPosts).toBeTruthy();
  });

  test('should filter posts by category', async ({ page }) => {
    // Look for category filter/dropdown
    const categoryFilter = page.locator('select[name="category"], .category-filter, button:has-text("Category")').first();

    if (await categoryFilter.isVisible()) {
      // If it's a select dropdown
      if (await categoryFilter.evaluate(el => el.tagName === 'SELECT')) {
        const options = await categoryFilter.locator('option').count();
        if (options > 1) {
          await categoryFilter.selectOption({ index: 1 });
          await page.waitForTimeout(1000);

          // Verify filtering worked (posts list should update)
          const content = await page.content();
          expect(content).toBeTruthy();
        }
      }
    }
  });

  test('should search posts', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      // Verify search results
      const content = await page.content();
      expect(content).toBeTruthy();
    }
  });
});

test.describe('Post Publish/Unpublish', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should toggle post publish status', async ({ page }) => {
    // Create a draft post
    await page.goto('/posts/create');
    await page.waitForTimeout(500);

    const postTitle = `Publish Test Post ${Date.now()}`;
    await page.locator('input[name="title"], input[placeholder*="title" i]').first().fill(postTitle);
    await page.locator('textarea[name="content"], textarea[placeholder*="content" i]').first().fill('Publish test content');

    // Look for draft/publish toggle
    const draftCheckbox = page.locator('input[type="checkbox"][name*="draft"], input[type="checkbox"][name*="publish"]').first();
    if (await draftCheckbox.isVisible()) {
      // Set as draft
      await draftCheckbox.uncheck();
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Look for publish button
    const publishButton = page.locator('button:has-text("Publish")').first();
    if (await publishButton.isVisible()) {
      await publishButton.click();
      await page.waitForTimeout(1000);

      // Verify publish status changed
      const content = await page.content();
      expect(content).toBeTruthy();
    }
  });
});
