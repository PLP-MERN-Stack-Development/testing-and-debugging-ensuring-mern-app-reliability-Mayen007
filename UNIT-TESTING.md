# 🧪 Unit Testing Guide - Task 2

## Overview

This guide covers implementing comprehensive unit tests for a MERN stack application. Unit tests verify that individual functions and components work correctly in isolation.

## What is Unit Testing?

Unit testing focuses on testing:
- **Utility functions** - Pure functions that don't depend on external systems
- **React components** - Components tested in isolation with mocked dependencies
- **Custom hooks** - React hooks that manage state and side effects
- **Middleware** - Express middleware functions with mocked request/response objects

---

## Client-Side Unit Testing

### 1. Utility Functions

Create simple, testable utility functions in `client/src/utils/`:

#### String Utilities (`string.js`)
```javascript
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
```

#### Math Utilities (`math.js`)
```javascript
export const add = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
};
```

#### Date Utilities (`date.js`)
```javascript
export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};
```

### 2. Testing Utilities

Test utilities using Jest:

```javascript
describe('String Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('notanemail')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });
});
```

**Testing Best Practices:**
- ✅ Test happy paths
- ✅ Test error cases
- ✅ Test edge cases (null, undefined, empty)
- ✅ Test with different input types
- ✅ Use descriptive test names

### 3. React Components

Create simple, testable components:

```javascript
// TextField.jsx
const TextField = ({ label, value, onChange, error }) => (
  <div>
    {label && <label>{label}</label>}
    <input value={value} onChange={onChange} />
    {error && <span className="error">{error}</span>}
  </div>
);
```

Test components with React Testing Library:

```javascript
describe('TextField Component', () => {
  it('should render input element', () => {
    render(<TextField label="Email" value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when input changes', () => {
    const handleChange = jest.fn();
    render(<TextField value="" onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' }
    });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<TextField value="" error="Required" onChange={() => {}} />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
```

**Component Testing Tips:**
- ✅ Test rendering with different props
- ✅ Test user interactions (click, type, blur)
- ✅ Mock callbacks and verify they're called
- ✅ Test conditional rendering
- ✅ Test accessibility (roles, labels)

### 4. Custom Hooks

Create testable custom hooks:

```javascript
// useForm.js
const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) await onSubmit(values);
  };

  return { values, errors, handleChange, handleSubmit };
};
```

Test hooks with `renderHook`:

```javascript
import { renderHook, act } from '@testing-library/react';

describe('useForm Hook', () => {
  it('should initialize with provided values', () => {
    const { result } = renderHook(() => 
      useForm({ name: 'John' })
    );
    expect(result.current.values.name).toBe('John');
  });

  it('should update values on change', () => {
    const { result } = renderHook(() => 
      useForm({ name: '' })
    );
    
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Jane' }
      });
    });
    
    expect(result.current.values.name).toBe('Jane');
  });
});
```

**Hook Testing Tips:**
- ✅ Use `renderHook` to test hooks in isolation
- ✅ Wrap state updates in `act()`
- ✅ Test all hook methods and state changes
- ✅ Test side effects with useEffect

---

## Server-Side Unit Testing

### 1. Utility Functions

Create server utilities in `server/src/utils/`:

```javascript
// validation.js
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Too short' };
  }
  return { valid: true, message: 'Strong' };
};
```

Test utilities:

```javascript
describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return validation result object', () => {
      const result = validatePassword('Pass123');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('message');
    });
  });
});
```

### 2. Express Middleware

Create testable middleware:

```javascript
// auth.js
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  req.user = user;
  next();
};
```

Test middleware with mock request/response:

```javascript
describe('Authentication Middleware', () => {
  it('should reject request without token', () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow request with valid token', () => {
    const req = {
      headers: { authorization: 'Bearer valid_token' }
    };
    const res = {};
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
```

**Middleware Testing Tips:**
- ✅ Mock request, response, and next objects
- ✅ Verify status codes and JSON responses
- ✅ Test that next() is called when appropriate
- ✅ Test error scenarios

---

## Testing File Structure

```
client/
├── src/
│   ├── utils/
│   │   ├── string.js
│   │   ├── math.js
│   │   └── date.js
│   ├── components/
│   │   ├── TextField.jsx
│   │   ├── Alert.jsx
│   │   └── Card.jsx
│   ├── hooks/
│   │   ├── useForm.js
│   │   └── useLocalStorage.js
│   └── tests/
│       └── unit/
│           ├── string.test.js
│           ├── math.test.js
│           ├── date.test.js
│           ├── TextField.test.jsx
│           ├── Alert.test.jsx
│           ├── useForm.test.js
│           └── useLocalStorage.test.js

server/
├── src/
│   ├── utils/
│   │   ├── validation.js
│   │   └── string.js
│   └── middleware/
│       ├── auth.js
│       └── errorHandler.js
└── tests/
    └── unit/
        ├── validation.test.js
        ├── string.test.js
        ├── auth.test.js
        └── errorHandler.test.js
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Common Testing Patterns

### 1. Testing Error Cases

```javascript
it('should throw error for invalid input', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero');
});
```

### 2. Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const result = await fetchData();
  expect(result).toEqual(expectedData);
});
```

### 3. Testing Event Handlers

```javascript
it('should call onClick handler', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### 4. Testing Conditional Rendering

```javascript
it('should show message when condition is true', () => {
  render(<Component showMessage={true} />);
  expect(screen.getByText('Message')).toBeInTheDocument();
});

it('should hide message when condition is false', () => {
  render(<Component showMessage={false} />);
  expect(screen.queryByText('Message')).not.toBeInTheDocument();
});
```

### 5. Mocking Dependencies

```javascript
jest.mock('../../api/users', () => ({
  fetchUser: jest.fn(() => 
    Promise.resolve({ id: 1, name: 'John' })
  ),
}));
```

---

## Coverage Metrics

Target coverage thresholds:
| Metric | Target |
|--------|--------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

Check coverage:
```bash
npm run test:coverage
```

---

## Best Practices

### ✅ DO:
- Write isolated, independent tests
- Use descriptive test names
- Test behaviors, not implementation
- Keep tests simple and focused
- Mock external dependencies
- Test edge cases and errors
- Write tests before or with code (TDD)

### ❌ DON'T:
- Write tests that depend on execution order
- Test private implementation details
- Skip error and edge case testing
- Create flaky tests
- Leave debugging code in tests
- Test third-party libraries

---

## Debugging Tests

### 1. Using console.log

```javascript
it('should do something', () => {
  console.log('Debugging value:', someValue);
  expect(someValue).toBe(expected);
});
```

### 2. Using screen.debug()

```javascript
it('should render component', () => {
  render(<MyComponent />);
  screen.debug(); // Prints rendered HTML
});
```

### 3. Using debugger

```javascript
it('should do something', () => {
  debugger; // Set breakpoint
  expect(true).toBe(true);
});
// Run with: node --inspect-brk node_modules/.bin/jest
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest Matchers](https://jestjs.io/docs/expect)

---

**Last Updated:** November 2024
**Coverage Target:** 70%+
**Status:** Task 2 Complete ✅
