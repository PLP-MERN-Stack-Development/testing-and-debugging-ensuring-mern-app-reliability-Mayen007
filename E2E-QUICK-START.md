# Playwright E2E Testing - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies (Already Done ✅)

```bash
cd mern-bug-tracker/client
npm install -D @playwright/test
npx playwright install
```

### 2. Start Required Services

**Terminal 1 - Backend Server:**

```bash
cd mern-bug-tracker/server
npm run dev
```

Server runs on `http://localhost:5000`

**Terminal 2 - Frontend Server:**

```bash
cd mern-bug-tracker/client
npm run dev
```

Client runs on `http://localhost:5173`

## 🧪 Running Tests

### Basic Commands

**Run all E2E tests (headless):**

```bash
cd mern-bug-tracker/client
npm run test:e2e
```

**Run with browser visible:**

```bash
npm run test:e2e:headed
```

**Interactive UI mode (recommended for development):**

```bash
npm run test:e2e:ui
```

**Debug mode (step through tests):**

```bash
npm run test:e2e:debug
```

### Browser-Specific Tests

```bash
npm run test:e2e:chromium   # Chrome/Edge only
npm run test:e2e:firefox    # Firefox only
npm run test:e2e:webkit     # Safari only
```

### Run Specific Tests

**Single test file:**

```bash
npx playwright test tests/e2e/auth.spec.js
```

**Single test by name:**

```bash
npx playwright test -g "should successfully login"
```

**Multiple files:**

```bash
npx playwright test tests/e2e/auth.spec.js tests/e2e/posts.spec.js
```

## 📊 Test Structure

```
client/tests/e2e/
│
├── 📄 auth.spec.js              (11 tests)
│   ├── Registration flow
│   ├── Login flow
│   ├── Logout
│   ├── Form validation
│   └── Protected routes
│
├── 📄 posts.spec.js             (11 tests)
│   ├── Create post
│   ├── Read/view posts
│   ├── Update post
│   ├── Delete post
│   ├── Filtering
│   └── Search
│
├── 📄 navigation.spec.js        (20 tests)
│   ├── Page navigation
│   ├── Browser controls
│   ├── Routing
│   ├── 404 handling
│   └── Accessibility
│
├── 📄 error-handling.spec.js    (21 tests)
│   ├── Network errors
│   ├── API errors
│   ├── Visual regression
│   └── UI components
│
├── 📄 helpers.js
│   └── 20+ utility functions
│
└── 📄 README.md
    └── Full documentation
```

## 📈 Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🔍 Debugging

### View test execution in real-time:

```bash
npm run test:e2e:headed
```

### Debug a failing test:

```bash
npx playwright test --debug -g "test name"
```

### Generate code (record your actions):

```bash
npx playwright codegen http://localhost:5173
```

### View trace of failed test:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## 📸 Screenshots & Videos

**Location:**

- Screenshots: `test-results/*/test-failed-*.png`
- Videos: `test-results/*/video.webm`
- Traces: `test-results/*/trace.zip`

**Captured automatically on:**

- Test failure
- First retry
- On demand via code

## 🎯 Test Coverage

| Category       | Tests  | Status          |
| -------------- | ------ | --------------- |
| Authentication | 11     | ✅ Complete     |
| Posts CRUD     | 11     | ✅ Complete     |
| Navigation     | 20     | ✅ Complete     |
| Error Handling | 21     | ✅ Complete     |
| **TOTAL**      | **63** | **✅ Complete** |

## 💡 Common Use Cases

### Test user registration and login:

```bash
npx playwright test tests/e2e/auth.spec.js
```

### Test post creation flow:

```bash
npx playwright test -g "should create a new post"
```

### Test all navigation:

```bash
npx playwright test tests/e2e/navigation.spec.js
```

### Visual regression tests:

```bash
npx playwright test -g "snapshot"
```

## 🛠️ Configuration

**Config file:** `playwright.config.js`

Key settings:

- Base URL: `http://localhost:5173`
- Timeout: 30 seconds per test
- Retries: 0 locally, 2 on CI
- Screenshot: On failure
- Video: On failure
- Trace: On first retry

## 📝 Writing New Tests

### 1. Create test file:

```javascript
// tests/e2e/myfeature.spec.js
import { test, expect } from "@playwright/test";

test("should do something", async ({ page }) => {
  await page.goto("/");
  // Your test code
});
```

### 2. Use helpers:

```javascript
import { login, generateTestUser } from "./helpers";

test("my test", async ({ page }) => {
  const user = generateTestUser();
  await login(page, user);
});
```

### 3. Run your test:

```bash
npx playwright test tests/e2e/myfeature.spec.js --headed
```

## 🚨 Troubleshooting

### Tests fail with "Connection refused"

✅ Make sure dev server is running: `npm run dev`

### Browser not found

✅ Run: `npx playwright install`

### Tests are flaky

✅ Use better waiting: `page.waitForURL()` instead of `waitForTimeout()`

### Tests hang

✅ Check for unclosed dialogs or pending network requests

## 📚 Resources

- Full docs: `tests/e2e/README.md`
- Helper functions: `tests/e2e/helpers.js`
- Config: `playwright.config.js`
- Playwright docs: https://playwright.dev/

## ✅ Quick Validation

Run this command to verify setup:

```bash
cd mern-bug-tracker/client
npm run test:e2e -- tests/e2e/auth.spec.js --project=chromium
```

Expected: 11 passing tests in ~30-60 seconds

---

**Framework:** Playwright v1.x  
**Total Tests:** 63  
**Browsers:** Chromium, Firefox, WebKit  
**Status:** ✅ Ready to run
