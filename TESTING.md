# 🧪 Testing Setup Guide

## Overview

This document explains the testing environment setup for the MERN application, including unit testing, integration testing, and debugging tools.

## Project Structure

```
mern-testing/
├── client/
│   ├── jest.config.js              # Jest config for React
│   ├── package.json                # Client dependencies
│   └── src/
│       └── tests/
│           ├── setup.js            # Jest setup file
│           ├── testUtils.js        # Custom test utilities
│           ├── __mocks__/
│           │   └── fileMock.js     # Mock for imports
│           └── unit/
│               └── Button.test.jsx
│
├── server/
│   ├── jest.config.js              # Jest config for Node.js
│   ├── package.json                # Server dependencies
│   └── tests/
│       ├── setup.js                # Jest setup with MongoDB
│       ├── testUtils.js            # Test helper functions
│       └── integration/
│           └── posts.test.js
│
├── jest.config.js                  # Root Jest config
├── .babelrc                        # Babel configuration
├── package.json                    # Root dependencies
├── .env.example                    # Environment template
└── TESTING.md                      # This file
```

## Installation

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **For local database testing (optional):**
   ```bash
   npm run setup-test-db
   ```

## Running Tests

### All Tests
```bash
npm test
```
Runs all unit and integration tests with coverage report.

### Unit Tests Only
```bash
npm run test:unit
```
Runs only unit tests from `unit/` directories.

### Integration Tests Only
```bash
npm run test:integration
```
Runs only integration tests from `integration/` directories.

### Watch Mode
```bash
npm run test:watch
```
Continuously runs tests as files change.

### Coverage Report
```bash
npm run test:coverage
```
Generates HTML coverage report in `coverage/` directory.

## Testing Framework Configuration

### Jest Configuration

The project uses a **multi-project Jest setup**:

- **Root `jest.config.js`**: Orchestrates both client and server testing
- **Client `jest.config.js`**: Configured for React components with jsdom environment
- **Server `jest.config.js`**: Configured for Node.js with node environment

### Client-Side Testing

**Environment:** `jsdom` (simulates browser DOM)

**Key Configurations:**
- **Transform:** Uses `babel-jest` for JSX/ES6+ syntax
- **Module Mappings:**
  - CSS imports → `identity-obj-proxy` (mock)
  - Image imports → `fileMock.js` (mock)
- **Setup File:** `client/src/tests/setup.js`

**Example Unit Test:**
```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Server-Side Testing

**Environment:** `node` (Node.js environment)

**Key Configurations:**
- **MongoDB Memory Server:** Automatically spun up for each test suite
- **Database Setup:** Automatically cleans up collections between tests
- **Setup File:** `server/tests/setup.js`

**Example Integration Test:**
```javascript
const request = require('supertest');
const app = require('../../src/app');
const Post = require('../../src/models/Post');

describe('POST /api/posts', () => {
  it('should create a new post', async () => {
    const newPost = {
      title: 'Test Post',
      content: 'Test content'
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(newPost.title);
  });
});
```

## Testing Utilities

### Client Utilities (`client/src/tests/testUtils.js`)

Custom render function for wrapping components with providers:

```javascript
import { render } from '../tests/testUtils';

// Use in tests instead of direct render
render(<MyComponent />);
```

### Server Utilities (`server/tests/testUtils.js`)

Helper functions for creating test data:

```javascript
const { generateTestToken, createMockUser, createMockPost } = require('../tests/testUtils');

const user = createMockUser({ email: 'custom@example.com' });
const token = generateTestToken(user._id);
```

## Coverage Thresholds

The project is configured with the following coverage targets:

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

To check coverage:
```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/client/` - Client coverage
- `coverage/server/` - Server coverage

## Best Practices

### ✅ DO

- Write tests that are **isolated** and **independent**
- Use **descriptive test names** that explain what is being tested
- Test **behaviors**, not implementation details
- Mock **external dependencies** (APIs, databases, etc.)
- Keep tests **fast** and **deterministic**
- Use **helper functions** to reduce code duplication

### ❌ DON'T

- Write tests that depend on execution order
- Test **private implementation details**
- Create **flaky tests** that fail intermittently
- Skip testing **error cases** and **edge cases**
- Leave **console.log()** or debug code in tests
- Test too many things in a single test

## Common Issues and Solutions

### Issue: Tests timeout

**Solution:** Increase timeout in `jest.setTimeout()`
```javascript
jest.setTimeout(15000); // 15 seconds
```

### Issue: MongoDB Memory Server fails to start

**Solution:** Ensure sufficient disk space and RAM. Try rebuilding:
```bash
npm rebuild mongodb-memory-server
```

### Issue: CSS/Import errors in tests

**Solution:** Check module name mapper in `jest.config.js` matches file extensions.

### Issue: React Testing Library queries return null

**Solution:** Verify element is rendered using `screen.debug()`:
```javascript
screen.debug(); // Prints rendered HTML
```

## Debugging Tests

### Using console.log()

```javascript
it('should do something', () => {
  console.log('Debugging info');
  expect(true).toBe(true);
});
```

### Using screen.debug()

```javascript
import { render, screen } from '@testing-library/react';

it('should render component', () => {
  render(<MyComponent />);
  screen.debug(); // Prints full HTML
});
```

### Using debugger

```javascript
it('should do something', () => {
  debugger; // Sets breakpoint - run with `node --inspect`
  expect(true).toBe(true);
});
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm run install-all
      - run: npm test
      - run: npm run test:coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

After setting up the testing environment:

1. **Task 2:** Write unit tests for utility functions and React components
2. **Task 3:** Write integration tests for API endpoints
3. **Task 4:** Set up end-to-end tests with Cypress/Playwright
4. **Task 5:** Implement debugging techniques and error handling

---

**Last Updated:** November 2024
**Testing Framework Version:** Jest 29.7.0
**React Testing Library Version:** 14.1.0
