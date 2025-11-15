# End-to-End (E2E) Testing with Playwright

## Overview

This directory contains E2E tests for the MERN Bug Tracker application using Playwright. These tests simulate real user interactions and validate the complete user journey through the application.

## Test Structure

```
tests/e2e/
├── auth.spec.js              # Authentication flow tests (register, login, logout)
├── posts.spec.js             # Posts CRUD operations tests
├── navigation.spec.js        # Navigation and routing tests
├── error-handling.spec.js    # Error handling and visual regression tests
└── helpers.js                # Shared test utilities and helper functions
```

## Test Coverage

### Authentication Tests (`auth.spec.js`)

- ✅ Display registration form
- ✅ Validate registration form fields
- ✅ Successfully register new user
- ✅ Display login form
- ✅ Show error for invalid credentials
- ✅ Successfully login with valid credentials
- ✅ Logout successfully
- ✅ Prevent access to protected routes when not authenticated
- ✅ Validate email format
- ✅ Validate password strength
- ✅ Validate required name field

**Total: 11 tests**

### Posts CRUD Tests (`posts.spec.js`)

- ✅ Display posts list page
- ✅ Navigate to create post page
- ✅ Create a new post
- ✅ Display post details
- ✅ Edit an existing post
- ✅ Delete a post
- ✅ Validate post form fields
- ✅ Display posts list
- ✅ Filter posts by category
- ✅ Search posts
- ✅ Toggle post publish status

**Total: 11 tests**

### Navigation Tests (`navigation.spec.js`)

- ✅ Navigate to home page
- ✅ Working navigation menu
- ✅ Navigate to login page
- ✅ Navigate to register page
- ✅ Navigate to posts page
- ✅ Handle browser back button
- ✅ Handle browser forward button
- ✅ Navigate using browser history
- ✅ Handle 404 not found page
- ✅ Handle invalid post ID
- ✅ Redirect from auth pages when logged in
- ✅ Redirect to login for protected routes
- ✅ Allow access to protected routes when authenticated
- ✅ Handle direct URL navigation
- ✅ Handle URL with query parameters
- ✅ Handle page refresh
- ✅ Load pages quickly
- ✅ Handle rapid navigation
- ✅ Support keyboard navigation
- ✅ Support Enter key for navigation

**Total: 20 tests**

### Error Handling & Visual Tests (`error-handling.spec.js`)

- ✅ Handle network errors gracefully
- ✅ Display form validation errors
- ✅ Handle API errors
- ✅ Handle 404 errors
- ✅ Handle server errors
- ✅ Match home page snapshot
- ✅ Match login page snapshot
- ✅ Match register page snapshot
- ✅ Match posts list page snapshot
- ✅ Display navigation bar correctly
- ✅ Display footer correctly
- ✅ Display buttons with proper styling
- ✅ Display form inputs correctly
- ✅ Handle responsive design
- ✅ Display alerts and notifications
- ✅ Show loading indicator during data fetch
- ✅ Handle slow network conditions
- ✅ Handle very long input text
- ✅ Handle special characters in input
- ✅ Handle rapid form submissions
- ✅ Handle empty states

**Total: 21 tests**

## Prerequisites

Before running E2E tests, ensure:

1. **Backend server is running**:

   ```bash
   cd mern-bug-tracker/server
   npm run dev
   ```

   Server should be running on `http://localhost:5000`

2. **Frontend dev server is running**:

   ```bash
   cd mern-bug-tracker/client
   npm run dev
   ```

   Client should be running on `http://localhost:5173`

3. **Database is accessible**:
   - MongoDB should be running
   - Test database should be accessible

## Running E2E Tests

### Run all E2E tests

```bash
cd mern-bug-tracker/client
npm run test:e2e
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Run tests in debug mode

```bash
npm run test:e2e:debug
```

### Run tests with UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run tests in specific browser

```bash
# Chromium only
npm run test:e2e:chromium

# Firefox only
npm run test:e2e:firefox

# WebKit only
npm run test:e2e:webkit
```

### Run specific test file

```bash
npx playwright test tests/e2e/auth.spec.js
```

### Run specific test

```bash
npx playwright test -g "should successfully login"
```

### Generate test report

```bash
npx playwright show-report
```

## Test Helpers

The `helpers.js` file provides reusable utility functions:

### Authentication Helpers

- `generateTestUser(prefix)` - Generate unique test user credentials
- `login(page, credentials)` - Login helper
- `register(page, userData)` - Register helper
- `logout(page)` - Logout helper

### Post Helpers

- `createTestPost(page, postData)` - Create test post helper

### API Helpers

- `waitForAPIResponse(page, urlPattern, timeout)` - Wait for API response
- `mockAPIResponse(page, urlPattern, responseData, status)` - Mock API response

### DOM Helpers

- `elementExists(page, selector)` - Check if element exists
- `waitForElement(page, selector, timeout)` - Wait for element
- `scrollToElement(page, selector)` - Scroll to element
- `fillForm(page, formData)` - Fill form with data

### Storage Helpers

- `clearStorage(page)` - Clear local/session storage
- `setStorageItem(page, key, value)` - Set storage item
- `getStorageItem(page, key)` - Get storage item

### Utility Helpers

- `takeScreenshot(page, name)` - Take screenshot with timestamp
- `waitForNetworkIdle(page, timeout)` - Wait for network idle
- `acceptDialog(page)` - Accept browser dialog
- `dismissDialog(page)` - Dismiss browser dialog

## Configuration

### Playwright Configuration (`playwright.config.js`)

Key settings:

- **Test Directory**: `./tests/e2e`
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel Execution**: Enabled
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retain on failure
- **Traces**: On first retry

### Browser Projects

The configuration includes three browser projects:

1. **Chromium** - Google Chrome/Edge
2. **Firefox** - Mozilla Firefox
3. **WebKit** - Safari

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `test.beforeEach()` for setup
- Clean up after tests with `test.afterEach()`

### 2. Unique Test Data

- Generate unique emails/usernames using timestamps
- Use helper functions like `generateTestUser()`

### 3. Waiting Strategies

- Use `page.waitForURL()` for navigation
- Use `page.waitForLoadState()` for page loads
- Use `page.waitForSelector()` for elements
- Avoid fixed `waitForTimeout()` when possible

### 4. Selectors

- Prefer user-facing attributes: `text`, `role`, `label`
- Use data-testid for dynamic content
- Avoid brittle CSS selectors

### 5. Assertions

- Use Playwright's auto-waiting assertions
- Chain assertions logically
- Provide meaningful error messages

## Debugging

### View test execution

```bash
npm run test:e2e:headed
```

### Debug specific test

```bash
npx playwright test --debug -g "test name"
```

### View test report

```bash
npx playwright show-report
```

### Inspect selectors

```bash
npx playwright codegen http://localhost:5173
```

### View traces

After a test failure, traces are automatically captured. View with:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd mern-bug-tracker/server && npm ci
          cd ../client && npm ci

      - name: Install Playwright Browsers
        run: cd mern-bug-tracker/client && npx playwright install --with-deps

      - name: Start servers
        run: |
          cd mern-bug-tracker/server && npm run dev &
          cd mern-bug-tracker/client && npm run dev &
          sleep 10

      - name: Run E2E tests
        run: cd mern-bug-tracker/client && npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: mern-bug-tracker/client/playwright-report/
```

## Troubleshooting

### Tests fail with "page.goto: net::ERR_CONNECTION_REFUSED"

- Ensure dev server is running on `http://localhost:5173`
- Check if port 5173 is available
- Verify `baseURL` in `playwright.config.js`

### Tests are flaky

- Increase timeout values
- Use better waiting strategies (avoid `waitForTimeout`)
- Check for race conditions
- Ensure test isolation

### Browser not found

- Run `npx playwright install` to download browsers
- Check Playwright version compatibility

### Tests hang indefinitely

- Check for open handles (async operations not cleaned up)
- Verify network requests complete
- Use `--timeout` flag to set max test duration

## Coverage Reports

E2E tests complement unit and integration tests to provide full coverage:

- **Unit Tests**: Individual components and functions
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user flows and UI interactions

Combined coverage should exceed 80% for critical application paths.

## Maintenance

### Updating Tests

- Keep selectors up to date with UI changes
- Update helper functions when API changes
- Review and update visual regression snapshots
- Maintain test data generators

### Adding New Tests

1. Identify critical user flows
2. Write test spec in appropriate file
3. Use helper functions for common operations
4. Add meaningful test descriptions
5. Ensure tests are isolated and repeatable

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

**Total E2E Tests**: 63 tests across 4 test files
**Browsers Tested**: Chromium, Firefox, WebKit
**Framework**: Playwright v1.x
**Last Updated**: November 15, 2025
