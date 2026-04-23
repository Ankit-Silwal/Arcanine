# Arcanine Authentication API Documentation

## Overview
The Arcanine API provides a comprehensive authentication system supporting multiple authentication methods: Email/Password and OAuth providers (Google, GitHub).

**Base URL:** `http://localhost:PORT/api/auth` (adjust port as needed)

---

## Quick Start

### Route Setup
The authentication routes are already integrated in the main application:

**File:** `api/src/app.ts`
```typescript
import authRouter from "./modules/auth/auth.routes.js";

app.use("/api/auth", authRouter);
```

**File:** `api/src/modules/auth/auth.routes.ts`
```typescript
import { Router } from "express";
import { signUpController, loginController, refreshController } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);

export default authRouter;
```

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Request/Response Formats](#requestresponse-formats)
3. [Error Handling](#error-handling)
4. [Authentication Methods](#authentication-methods)
5. [Security](#security)

---

## Authentication Endpoints

### 1. Sign Up
**Register a new user account**

**Endpoint:** `POST /signup`

**Request Body:**
```json
{
  "provider": "email",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Query Parameters:** None

**Request Headers:**
```
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_id_here",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**Validation Requirements:**
- **provider**: Must be one of: `"email"`, `"google"`, `"github"`
- **email**: Valid email format (for email provider)
- **password**: Must meet strong password requirements (for email provider)
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

**Supported OAuth Signup:**
```json
{
  "provider": "google",
  "oauthToken": "google_oauth_token_here"
}
```

---

### 2. Login
**Authenticate user and receive tokens**

**Endpoint:** `POST /login`

**Request Body (Email):**
```json
{
  "provider": "email",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Request Body (OAuth):**
```json
{
  "provider": "google",
  "token": "oauth_token_here"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies (Set Automatically):**
```
refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - httpOnly: true
  - secure: false (should be true in production)
  - sameSite: strict
```

**Response (Error - 400):**
```json
{
  "error": "Invalid credentials"
}
```

**Response (Error - 400, Missing Provider):**
```json
{
  "success": false,
  "message": "Provide the required provider sir"
}
```

---

### 3. Refresh Token
**Generate a new access token using refresh token**

**Endpoint:** `POST /refresh`

**Request Headers:**
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:** None (refresh token comes from cookie)

**Response (Success - 200):**
```json
{
  "result": {
    "accessToken": "new_access_token_here"
  }
}
```

**Response (Error - 401, No Token):**
```json
{
  "error": "No refresh token"
}
```

**Response (Error - 401, Invalid Token):**
```json
{
  "error": "Invalid refresh token"
}
```

---

## Request/Response Formats

### JWT Token Structure
All JWT tokens contain the following payload:

```typescript
{
  userId: string;          // Unique user identifier
  token_version: number;   // Token version for invalidation
  iat: number;             // Issued at timestamp
  exp: number;             // Expiration timestamp
}
```

### Token Expiration
- **Access Token:** 15 minutes
- **Refresh Token:** 15 days

### Response Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful authentication |
| 400 | Bad Request | Invalid input, authentication failure |
| 401 | Unauthorized | Missing or invalid refresh token |
| 500 | Server Error | Database or server error |

---

## Error Handling

### Common Error Responses

**Invalid Credentials:**
```json
{
  "error": "Invalid email or password"
}
```

**User Already Exists:**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**Weak Password:**
```json
{
  "success": false,
  "message": "Password does not meet strength requirements"
}
```

**Missing Required Fields:**
```json
{
  "success": false,
  "message": "Please provide both email and password"
}
```

**Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Authentication Methods

### Email/Password Authentication
Traditional username/password authentication with strong password requirements.

**Supported Operations:**
- Sign Up: Create new account with email and password
- Login: Authenticate with email and password
- Password must meet security standards

### Google OAuth
OAuth 2.0 authentication using Google accounts.

**Supported Operations:**
- Sign Up: Create account using Google token
- Login: Authenticate using Google token

**Requirements:**
- Valid Google OAuth token
- Google credentials configured in environment

### GitHub OAuth
OAuth 2.0 authentication using GitHub accounts.

**Supported Operations:**
- Sign Up: Create account using GitHub token
- Login: Authenticate using GitHub token

**Requirements:**
- Valid GitHub OAuth token
- GitHub credentials configured in environment

---

## Security

### Best Practices

1. **HTTPS Only** (Production)
   - Set `secure: true` for cookies in production
   - All API calls should use HTTPS

2. **Token Storage**
   - Store access tokens in memory or sessionStorage
   - Refresh tokens stored in httpOnly cookies (protected from XSS)

3. **Token Expiration**
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 15 days
   - Use refresh endpoint to get new access tokens

4. **Password Requirements**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, and special characters
   - Never sent in plain text (HTTPS required)

5. **Token Versioning**
   - Token version tracked per user
   - Allows invalidating all tokens by incrementing version
   - Useful for logout functionality

### Environment Variables Required
```env
ACCESS_TOKEN_SECRET=your_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
```

---

## Usage Examples

### Example 1: Email Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "email",
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'
```

### Example 2: Email Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "email",
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Example 3: Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=token_here"
```

### Example 4: Google Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "token": "google_oauth_token"
  }'
```

---

## Flow Diagrams

### Login Flow
```
1. User sends credentials (email/password or OAuth token)
2. Server validates credentials
3. Server generates access and refresh tokens
4. Refresh token stored in httpOnly cookie
5. Access token returned in response body
6. Client stores access token in memory
7. Client uses access token for authenticated requests
```

### Token Refresh Flow
```
1. Access token expires
2. Client sends refresh token (from cookie)
3. Server validates refresh token
4. Server generates new access token
5. New access token returned to client
6. Client stores new token and retries original request
```

---

## Database Schema References

### Users Table
The authentication system stores user information in a `users` table with at least the following columns:
- `id`: Unique user identifier
- `email`: User email (for email auth)
- `password_hash`: Hashed password (for email auth)
- `token_version`: Current token version (for token invalidation)
- `created_at`: Account creation timestamp

---

## Rate Limiting
⚠️ **Note:** Rate limiting is not currently implemented. Consider adding rate limiting to prevent brute force attacks:
- Limit login attempts: 5 attempts per 15 minutes per IP
- Limit sign up attempts: 3 attempts per hour per IP

---

## Support & Issues
For bugs or issues with authentication:
1. Check that all required environment variables are set
2. Verify database connectivity
3. Check request format matches documentation
4. Review error message for specific details

---

**Last Updated:** April 23, 2026
**Version:** 1.0
