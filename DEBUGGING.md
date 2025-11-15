# Debugging Guide for MERN Blog Application

## Table of Contents

1. [Server-Side Debugging](#server-side-debugging)
2. [Client-Side Debugging](#client-side-debugging)
3. [Error Handling](#error-handling)
4. [Performance Monitoring](#performance-monitoring)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Best Practices](#best-practices)

---

## Server-Side Debugging

### Winston Logger

Our application uses **Winston** for structured logging with multiple transports.

#### Log Levels

- `error`: Critical errors that need immediate attention
- `warn`: Warning messages for potential issues
- `info`: General informational messages
- `http`: HTTP request/response logs
- `debug`: Detailed debugging information

#### Log Files Location

```
mern-bug-tracker/server/logs/
├── error-YYYY-MM-DD.log      # Error logs only
├── combined-YYYY-MM-DD.log   # All log levels
└── http-YYYY-MM-DD.log       # HTTP request logs
```

#### Using the Logger

```javascript
const logger = require("./config/logger");

// Basic logging
logger.error("Something went wrong");
logger.warn("This is a warning");
logger.info("Server started");
logger.debug("Debugging information");

// Structured logging with context
logger.logError(error, {
  userId: req.user._id,
  action: "create-post",
  ipAddress: req.ip,
});

logger.logInfo("User logged in", {
  userId: user._id,
  email: user.email,
});

// HTTP request logging (automatic via middleware)
// Logs: method, url, statusCode, responseTime, userAgent, IP
```

#### Viewing Logs

**Real-time log monitoring:**

```bash
# Watch all logs
tail -f logs/combined-*.log

# Watch error logs only
tail -f logs/error-*.log

# Watch HTTP logs
tail -f logs/http-*.log

# Search logs for specific error
grep "Cannot find module" logs/combined-*.log
```

**Log rotation:**

- Logs rotate daily automatically
- Error logs kept for 14 days
- HTTP logs kept for 7 days
- Combined logs kept for 14 days
- Maximum file size: 20MB

### Environment Variables for Logging

```env
# Set log level (error, warn, info, http, debug)
LOG_LEVEL=debug

# Production: set to 'info' to reduce log volume
NODE_ENV=production
LOG_LEVEL=info
```

### Debugging Node.js with VS Code

**launch.json configuration:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/mern-bug-tracker/server/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

**Debugging steps:**

1. Set breakpoints in VS Code (click left of line number)
2. Press F5 or click "Run and Debug"
3. Trigger the code path (make API request)
4. Inspect variables in Debug panel
5. Step through code with F10 (over) or F11 (into)

### Node.js Inspector

```bash
# Start server with inspector
node --inspect server/server.js

# Start with break on first line
node --inspect-brk server/server.js

# Open Chrome DevTools
# Navigate to chrome://inspect
# Click "inspect" under Remote Target
```

---

## Client-Side Debugging

### Error Boundary

React Error Boundary catches JavaScript errors in component tree and displays fallback UI.

**Features:**

- Catches errors in child components
- Logs error details to console (dev mode)
- Shows user-friendly error message
- Provides "Try Again" and "Reload" options
- Counts error occurrences
- Can integrate with error tracking services (Sentry, LogRocket)

**Implementation:**

```jsx
import ErrorBoundary from './components/ErrorBoundary';

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Wrap specific component
<ErrorBoundary fallback={(error, reset) => (
  <div>
    <h2>Failed to load posts</h2>
    <button onClick={reset}>Retry</button>
  </div>
)}>
  <PostList />
</ErrorBoundary>
```

### Browser DevTools

#### Console Debugging

```javascript
// Basic console methods
console.log("Simple message");
console.info("Info message");
console.warn("Warning message");
console.error("Error message");

// Structured logging
console.table([
  { name: "User 1", email: "user1@example.com" },
  { name: "User 2", email: "user2@example.com" },
]);

// Grouping logs
console.group("User Login Process");
console.log("Step 1: Validate credentials");
console.log("Step 2: Generate token");
console.log("Step 3: Store in localStorage");
console.groupEnd();

// Timing operations
console.time("API Call");
fetch("/api/posts").then(() => {
  console.timeEnd("API Call");
});

// Conditional logging
console.assert(user !== null, "User should not be null");

// Stack trace
console.trace("Show call stack");
```

#### Network Tab

**Inspecting API requests:**

1. Open DevTools (F12)
2. Click Network tab
3. Filter by "XHR" or "Fetch"
4. Click request to see:
   - Headers (request & response)
   - Payload (request body)
   - Response (JSON data)
   - Timing information

**Common issues to check:**

- ❌ Status code 4xx/5xx → Check error message
- ⚠️ Slow requests → Check response time
- 🔒 CORS errors → Check server CORS config
- 🚫 Failed requests → Check network connection

#### React DevTools

**Installation:**

- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Features:**

1. **Components Tab**

   - Inspect component tree
   - View props and state
   - Edit props/state in real-time
   - Find component by name

2. **Profiler Tab**
   - Record component renders
   - Identify slow components
   - Analyze render duration
   - Find unnecessary re-renders

**Usage:**

```jsx
// Add display name for easier debugging
MyComponent.displayName = "MyComponent";

// Use React DevTools to:
// 1. Select component in tree
// 2. View props: { title: "Hello", count: 5 }
// 3. Edit state: { isOpen: true }
// 4. Profile renders to find performance issues
```

#### Redux DevTools (if using Redux)

**Installation:**

```bash
npm install --save-dev redux-devtools-extension
```

**Features:**

- Time-travel debugging
- Action history
- State diff viewer
- Action replay

---

## Error Handling

### Global Error Handler (Server)

Located in: `server/middleware/errorHandler.js`

**Error types:**

```javascript
const {
  AppError, // Base error class
  ValidationError, // 400 - Validation errors
  AuthenticationError, // 401 - Auth required
  AuthorizationError, // 403 - Permission denied
  NotFoundError, // 404 - Resource not found
  DatabaseError, // 500 - Database errors
} = require("./middleware/errorHandler");

// Usage in routes
const { asyncHandler } = require("./middleware/errorHandler");

router.post(
  "/posts",
  asyncHandler(async (req, res) => {
    if (!req.body.title) {
      throw new ValidationError("Title is required");
    }

    const post = await Post.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // ... rest of logic
  })
);
```

**Automatic error handling:**

- Mongoose validation errors → 400
- Duplicate key errors → 409
- Cast errors (invalid ObjectId) → 400
- JWT errors → 401
- Multer file upload errors → 400

### Error Response Format

```json
{
  "error": "Post not found",
  "statusCode": 404,
  "stack": "Error: Post not found\n    at ...", // Dev only
  "details": {
    "name": "NotFoundError",
    "isOperational": true
  }
}
```

### Error Boundary (Client)

Located in: `client/src/components/ErrorBoundary.jsx`

**Error capture:**

```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to console (dev)
    console.error("Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);

    // Send to error tracking service
    // Sentry.captureException(error);

    // Send to backend API
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
      }),
    });
  }
}
```

---

## Performance Monitoring

### Server Performance

#### Request Timing Middleware

```javascript
// Automatically logs request duration
// See logs/http-*.log

// Example log:
{
  method: 'GET',
  url: '/api/posts',
  statusCode: 200,
  responseTime: '45ms',
  timestamp: '2024-01-15 10:30:00'
}
```

#### Database Query Performance

```javascript
// Enable Mongoose debug mode
mongoose.set("debug", true);

// Logs all queries with execution time
// Mongoose: posts.find({}) { ... } 23ms

// Index queries for better performance
const postSchema = new mongoose.Schema({
  title: { type: String, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
});
```

#### Health Check Endpoint

```bash
# Check server health
curl http://localhost:5000/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Client Performance

#### React Profiler

```jsx
import { Profiler } from "react";

function onRenderCallback(
  id, // Component name
  phase, // "mount" or "update"
  actualDuration, // Time spent rendering
  baseDuration, // Estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  console.log(`${id} took ${actualDuration}ms to render`);
}

<Profiler id="PostList" onRender={onRenderCallback}>
  <PostList />
</Profiler>;
```

#### Performance API

```javascript
// Measure page load time
window.addEventListener("load", () => {
  const perfData = performance.getEntriesByType("navigation")[0];
  console.log(
    "Page load time:",
    perfData.loadEventEnd - perfData.fetchStart,
    "ms"
  );
});

// Measure API call time
performance.mark("api-start");
fetch("/api/posts").then(() => {
  performance.mark("api-end");
  performance.measure("api-call", "api-start", "api-end");
  const measure = performance.getEntriesByName("api-call")[0];
  console.log("API call time:", measure.duration, "ms");
});
```

#### Chrome DevTools Performance Tab

1. Open DevTools → Performance
2. Click Record (⚫)
3. Interact with app
4. Click Stop
5. Analyze:
   - **Main Thread**: JavaScript execution
   - **Network**: Request/response timing
   - **Rendering**: Layout, paint, composite
   - **FPS**: Frame rate (target 60fps)

---

## Common Issues & Solutions

### Server Issues

#### 1. MongoDB Connection Failed

**Error:**

```
MongoServerError: bad auth : Authentication failed
```

**Solution:**

```bash
# Check .env file
MONGODB_URI=mongodb://username:password@localhost:27017/dbname

# Verify credentials
# Check if MongoDB service is running
# Check network connectivity
```

#### 2. Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change PORT in .env
PORT=5001
```

#### 3. CORS Errors

**Error:**

```
Access to fetch at 'http://localhost:5000/api/posts' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**

```javascript
// In server.js - add origin to ALLOWED_ORIGIN in .env
ALLOWED_ORIGIN=http://localhost:5173

// Or allow all origins in development
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : process.env.ALLOWED_ORIGIN
}));
```

#### 4. JWT Token Invalid

**Error:**

```
JsonWebTokenError: invalid token
```

**Solution:**

```javascript
// Check JWT_SECRET in .env
// Verify token format: "Bearer <token>"
// Check token expiration
// Clear localStorage and login again
```

### Client Issues

#### 1. Component Not Rendering

**Debug steps:**

```jsx
// 1. Check console for errors
// 2. Verify component is imported
import PostList from './components/PostList';

// 3. Check props are passed correctly
<PostList posts={posts} />  // ✓
<PostList posts="posts" />  // ✗ (string instead of array)

// 4. Add console.log to verify data
console.log('Posts:', posts);

// 5. Check conditional rendering
{posts && posts.length > 0 ? (
  <PostList posts={posts} />
) : (
  <p>No posts found</p>
)}
```

#### 2. Infinite Loop / Too Many Renders

**Problem:**

```jsx
// ❌ Wrong: setState in render
function MyComponent() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Causes infinite loop
  return <div>{count}</div>;
}

// ❌ Wrong: Missing dependency
useEffect(() => {
  fetchData(id);
}, []); // Missing 'id' dependency
```

**Solution:**

```jsx
// ✓ Correct: setState in event handler
function MyComponent() {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount(count + 1);
  return <button onClick={handleClick}>{count}</button>;
}

// ✓ Correct: Include all dependencies
useEffect(() => {
  fetchData(id);
}, [id]);
```

#### 3. State Not Updating

**Problem:**

```jsx
// ❌ Wrong: Mutating state directly
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Doesn't trigger re-render
```

**Solution:**

```jsx
// ✓ Correct: Create new array
setItems([...items, 4]);

// ✓ Correct: Use functional update
setItems((prev) => [...prev, 4]);
```

#### 4. Network Request Failing

**Debug steps:**

```javascript
// 1. Check Network tab in DevTools
// 2. Verify API endpoint
console.log("Fetching from:", API_URL);

// 3. Check request headers
fetch("/api/posts", {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// 4. Handle errors properly
try {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error("Fetch error:", error);
}
```

---

## Best Practices

### Server-Side

1. **Always use asyncHandler for async routes**

   ```javascript
   router.get(
     "/posts",
     asyncHandler(async (req, res) => {
       // No need for try-catch, asyncHandler handles it
     })
   );
   ```

2. **Use structured logging**

   ```javascript
   // ❌ Bad
   console.log("User logged in");

   // ✓ Good
   logger.logInfo("User logged in", {
     userId: user._id,
     email: user.email,
     timestamp: new Date(),
   });
   ```

3. **Throw specific errors**

   ```javascript
   // ❌ Bad
   throw new Error("Something went wrong");

   // ✓ Good
   throw new NotFoundError(`Post with id ${id} not found`);
   ```

4. **Validate input**

   ```javascript
   const { ValidationError } = require("./middleware/errorHandler");

   if (!req.body.title || req.body.title.trim() === "") {
     throw new ValidationError("Title is required");
   }
   ```

### Client-Side

1. **Use Error Boundaries**

   ```jsx
   <ErrorBoundary>
     <SuspiciousComponent />
   </ErrorBoundary>
   ```

2. **Handle loading and error states**

   ```jsx
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   if (loading) return <Spinner />;
   if (error) return <ErrorMessage error={error} />;
   return <DataDisplay data={data} />;
   ```

3. **Use React DevTools Profiler**

   - Identify slow components
   - Optimize with React.memo, useMemo, useCallback

4. **Clean up side effects**
   ```jsx
   useEffect(() => {
     const controller = new AbortController();

     fetch("/api/posts", { signal: controller.signal })
       .then((res) => res.json())
       .then(setData);

     return () => controller.abort(); // Cleanup
   }, []);
   ```

---

## Debugging Checklist

### Before Deployment

- [ ] Check all console.log/console.error removed (or wrapped in dev check)
- [ ] Verify error handling in all routes
- [ ] Test error boundaries work correctly
- [ ] Review log files for unexpected errors
- [ ] Run performance profiler
- [ ] Check for memory leaks
- [ ] Verify environment variables set correctly
- [ ] Test in production mode locally
- [ ] Check browser console for warnings

### Production Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor log files daily
- [ ] Set up alerts for critical errors
- [ ] Track API response times
- [ ] Monitor database performance
- [ ] Check server uptime
- [ ] Review user feedback for issues

---

## Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

_Last updated: January 2024_
