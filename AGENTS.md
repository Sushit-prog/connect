# Connect App - Agent Guidelines

## Project Overview

Connect is a high-end chat application built with the MERN stack (MongoDB, Express, React, Node.js).

---

## Available Commands

### Development
```bash
npm run dev          # Start development server with ts-node
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build
```

### Testing
```bash
npm test             # Run all tests
npm test -- --watch  # Run tests in watch mode
npm test -- --testNamePattern="specific test name"   # Run single test
npm test -- user.test.ts                             # Run specific test file
npm test -- --coverage                              # Run with coverage report
```

### Linting & Formatting
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
```

---

## Code Style Guidelines

### TypeScript Conventions

- **Strict Mode**: All TypeScript code uses strict mode
- **Explicit Types**: Always declare return types for functions; avoid `any`
- **Interfaces over Types**: Prefer interfaces for object shapes
- **Null Safety**: Avoid non-null assertions (`!`); use proper null checks

```typescript
// Good
function getUserById(id: string): Promise<User | null> { ... }

// Avoid
function getUserById(id: string) { ... }
```

### Import Organization

Order imports as follows (enforced by ESLint):

1. **Node.js built-ins** (`fs`, `path`, `http`)
2. **External packages** (`express`, `mongoose`, `dotenv`)
3. **Internal packages** (`src/config`, `src/utils`)
4. **Relative imports** (`./routes`, `../models`)

```typescript
import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/user.model';
import userService from '../services/user.service';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user.routes.ts`, `auth-middleware.ts` |
| Classes/Interfaces | PascalCase | `UserModel`, `AuthRequest` |
| Variables/Functions | camelCase | `getUserById`, `isAuthenticated` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `JWT_SECRET` |
| Database Collections | singular, lowercase | `users`, `messages` |

### File Structure Pattern

Follow the **Controller-Service-Route** pattern:

```
src/
├── config/
│   └── db.ts              # Database connection
├── models/
│   └── user.model.ts      # Mongoose schemas
├── controllers/
│   └── user.controller.ts  # Request/Response handlers
├── services/
│   └── user.service.ts     # Business logic
├── routes/
│   └── user.routes.ts      # Route definitions
├── middleware/
│   └── errorHandler.ts     # Error handling
├── types/
│   └── index.ts            # TypeScript interfaces
└── server.ts               # Application entry point
```

### Error Handling

- Use `async/await` with `try/catch` blocks for all async operations
- Create custom error classes for specific error types
- Centralize error handling with middleware

```typescript
// Service layer
async getUserById(id: string): Promise<User> {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError(`User with id ${id} not found`);
  }
  return user;
}

// Controller layer
async getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
```

### Response Format

Standardize API responses:

```typescript
// Success
res.status(200).json({
  success: true,
  data: user,
  message: 'User retrieved successfully'
});

// Error
res.status(400).json({
  success: false,
  error: 'Invalid input',
  message: 'Email format is incorrect'
});
```

### Security Best Practices

- **Passwords**: Always use `select: false` in schemas; explicitly select when needed
- **Input Validation**: Validate all user input with a library like `joi` or `zod`
- **Rate Limiting**: Implement rate limiting on auth endpoints
- **Helmet**: Use helmet middleware for security headers
- **Environment Variables**: Never commit `.env` files; use `.env.example`
- **SQL/NoSQL Injection**: Use parameterized queries; avoid user input in queries

### Mongoose Schema Guidelines

- Use `timestamps: true` for automatic `createdAt` and `updatedAt`
- Use `select: false` for sensitive fields like `password`
- Index frequently queried fields
- Use schemas for validation with Mongoose types

```typescript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },  // SECURITY: Never expose
  avatar: { type: String, default: null },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });
```

---

## Testing Guidelines

### Test Structure

- Place tests in `tests/` directory
- Name test files: `*.test.ts`
- Use descriptive test names: `"should return user when valid id provided"`

### Test Example

```typescript
import userService from '../src/services/user.service';
import { User } from '../src/models/user.model';

describe('UserService', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user', async () => {
    const userData = { username: 'testuser', email: 'test@example.com', password: 'hashed' };
    const user = await userService.createUser(userData);
    expect(user.username).toBe('testuser');
  });
});
```

---

## Git Conventions

- **Branch naming**: `feature/`, `fix/`, `chore/`
- **Commits**: Use conventional commits (`feat:`, `fix:`, `docs:`)
- **Never commit**: `.env`, `node_modules/`, `dist/`, `coverage/`

---

## Environment Variables

Required environment variables (see `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/connect
JWT_SECRET=your-secret-key
NODE_ENV=development
```

---

## Notes for AI Agents

- Always run `npm run lint:fix` before committing
- Run tests with `npm test` before opening PR
- Use TypeScript strictly; avoid `any` types
- Follow the Controller-Service-Route pattern for all features
- Security: Never log or expose passwords; use `select: false`
