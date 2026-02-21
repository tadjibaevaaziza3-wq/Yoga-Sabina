---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to Use This Skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Core Concepts

### 1. Error Handling Philosophies
**Exceptions vs Result Types:**
- **Exceptions**: Traditional try-catch, disrupts control flow
- **Result Types**: Explicit success/failure, functional approach
- **Error Codes**: C-style, requires discipline
- **Option/Maybe Types**: For nullable values

**When to Use Each:**
- **Exceptions**: Unexpected errors, exceptional conditions
- **Result Types**: Expected errors, validation failures
- **Panics/Crashes**: Unrecoverable errors, programming bugs

### 2. Error Categories
- **Recoverable Errors**: Network timeouts, missing files, invalid user input, API rate limits.
- **Unrecoverable Errors**: Out of memory, stack overflow, programming bugs (null pointer, etc.).

## Language-Specific Patterns

### TypeScript/JavaScript Error Handling

**Custom Error Classes:**
```typescript
class ApplicationError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} not found`, "NOT_FOUND", 404, { resource, id });
  }
}
```

**Result Type Pattern:**
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

## Universal Patterns

### Pattern 1: Circuit Breaker
Prevent cascading failures in distributed systems by rejecting requests when a service is failing.

### Pattern 2: Error Aggregation
Collect multiple errors (e.g., validation) instead of failing on the first one.

### Pattern 3: Graceful Degradation
Provide fallback functionality or cached data when errors occur.

## Best Practices
1. **Fail Fast**: Validate input early.
2. **Preserve Context**: Include stack traces and metadata.
3. **Meaningful Messages**: Explain what happened and how to fix it.
4. **Clean Up Resources**: Use `finally` blocks or context managers.
5. **Don't Swallow Errors**: Log or re-throw, never silently ignore.
