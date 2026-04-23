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

## Protected Routes

### Authentication Middleware
The following routes require authentication using the `Authorization` header with a Bearer token (access token):

- `POST /api/auth/refresh` - Requires valid access token
- `POST /api/auth/logout` - Requires valid access token
- `POST /api/auth/change-password` - Requires valid access token

**Protected Route Headers:**
```
Authorization: Bearer <access_token_here>
```

**Middleware Flow:**
1. Extract token from `Authorization: Bearer <token>` header
2. Validate token format and signature
3. Verify token hasn't expired
4. Check user exists in database
5. Verify token version matches (prevents using old tokens after logout)
6. Attach user info to request and proceed to route handler
7. Return 401 error if any validation fails

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Protected Routes](#protected-routes)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Authentication Methods](#authentication-methods)
7. [Password Recovery](#password-recovery)
8. [Security](#security)

---

## Authentication Endpoints

### Public Endpoints
The following endpoints do not require authentication:

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user

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

**Authentication:** Required (Access Token)
```
Authorization: Bearer <your_access_token_here>
```

**Request Headers:**
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
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
  "error": "No token provided"
}
```

**Response (Error - 401, Invalid Token):**
```json
{
  "error": "Invalid refresh token"
}
```

---

### 4. Logout
**Clear user session and remove refresh token**

**Endpoint:** `POST /logout`

**Authentication:** Required (Access Token)
```
Authorization: Bearer <your_access_token_here>
```

**Request Headers:**
```
Authorization: Bearer <your_access_token_here>
```

**Request Body:** None

**Response (Success - 200):**
```json
{
  "message": "Successfully logout"
}
```

**Response (Error - 401, No Token):**
```json
{
  "error": "No token provided"
}
```

---

### 5. Change Password
**Change user password with authentication**

**Endpoint:** `POST /change-password`

**Authentication:** Required (Access Token)
```
Authorization: Bearer <your_access_token_here>
```

**Request Headers:**
```
Authorization: Bearer <your_access_token_here>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password changed. Please login again."
}
```

**Response (Error - 400, Passwords Don't Match):**
```json
{
  "error": "Passwords do not match"
}
```

**Response (Error - 400, Weak Password):**
```json
{
  "error": "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
}
```

**Response (Error - 400, Same Password):**
```json
{
  "error": "New password must be different"
}
```

**Response (Error - 400, Wrong Old Password):**
```json
{
  "error": "Incorrect old password"
}
```

**Response (Error - 401, No Token):**
```json
{
  "error": "No token provided"
}
```

**Response (Error - 401, No Token):**
```json
{
  "error": "No token provided"
}
```

**Field Requirements:**
- **oldPassword**: Current password (must be correct)
- **newPassword**: New password (must meet strength requirements)
- **confirmPassword**: Confirm new password (must match newPassword exactly)

---

### 6. Verify Email
**Verify user email address with token**

**Endpoint:** `GET /verify-email`

**Query Parameters:**
```
?token=verification_token_here
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Response (Error - 400, Invalid Token):**
```json
{
  "error": "Invalid or expired token"
}
```

**Response (Error - 400, Token Already Used):**
```json
{
  "error": "Token already used"
}
```

**Flow:**
1. User receives verification email after signup
2. User clicks verification link with token
3. Frontend sends GET request to `/verify-email?token=...`
4. Server validates token expiry (15 minutes)
5. Server marks email as verified
6. Token is marked as used and cannot be reused

---

### 7. Forgot Password
**Request password reset email**

**Endpoint:** `POST /forgot-password`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "message": "If account exists, email sent"
}
```

**Response (Error - 400, Missing Email):**
```json
{
  "error": "Email required"
}
```

**Security Note:**
- Response is the same whether email exists or not (prevents email enumeration)
- Reset token sent via email contains a valid reset token
- Token expires in 15 minutes
- User must receive the email to reset password

**Flow:**
1. User enters email address
2. Server checks if user exists
3. Server generates secure reset token
4. Reset email is queued to be sent (via Bull Queue)
5. Same response sent regardless of whether email exists (security)
6. Email worker sends reset email with link containing token

---

### 8. Reset Password
**Reset user password with verification token**

**Endpoint:** `POST /reset-password`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

**Response (Error - 400, Invalid Token):**
```json
{
  "error": "Invalid token"
}
```

**Response (Error - 400, Expired Token):**
```json
{
  "error": "Token expired"
}
```

**Response (Error - 400, Token Already Used):**
```json
{
  "error": "Token already used"
}
```

**Response (Error - 400, Weak Password):**
```json
{
  "error": "Weak password"
}
```

**Response (Error - 400, Passwords Don't Match):**
```json
{
  "error": "Passwords do not match"
}
```

**Field Requirements:**
- **token**: Reset token from email (must be valid and not expired)
- **newPassword**: New password (must meet strength requirements)
- **confirmPassword**: Confirm new password (must match newPassword exactly)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Flow:**
1. User clicks password reset link in email with token
2. Frontend captures the token from URL query parameter
3. User enters new password and confirms it
4. Frontend sends token and passwords to reset endpoint
5. Server validates token (not expired, not already used)
6. Server validates new password strength
7. Server hashes new password and updates database
8. Server increments token_version to invalidate all existing tokens
9. Reset token marked as used (cannot be reused)
10. User prompted to login with new password

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

### Example 5: Refresh Token (Protected)
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Cookie: refreshToken=token_here"
```

### Example 6: Logout (Protected)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 7: Change Password (Protected)
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

### Example 8: Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Example 9: Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_email",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

### Example 10: Verify Email
```bash
curl -X GET "http://localhost:3000/api/auth/verify-email?token=verification_token_from_email"
```

---

## Password Recovery

### Forgot Password Flow
The system provides a secure password recovery mechanism using time-limited tokens:

1. **Request Reset:** User requests password reset by providing email
2. **Token Generation:** Server generates a secure random token (32 bytes)
3. **Token Storage:** Token hash stored in database with 15-minute expiration
4. **Email Sending:** Reset email queued and sent to user with recovery link
5. **Token Validation:** User clicks link and provides new password
6. **Verification:** Server validates token (not expired, not already used)
7. **Password Update:** New password hashed and stored, token marked as used
8. **Token Invalidation:** User's token_version incremented (all old tokens invalidated)

### Security Features
- **One-Time Use:** Reset tokens marked as used after successful reset
- **Time Limited:** Tokens expire in 15 minutes
- **Secure Generation:** Tokens generated using crypto.randomBytes(32)
- **Hash Storage:** Tokens hashed with SHA-256 before database storage
- **Token Version:** All tokens invalidated when password is reset
- **Email Safety:** Same response sent whether email exists or not (prevents enumeration)

### Email Queue Integration
- Password reset emails handled asynchronously via Bull Queue
- Uses Redis for job queuing and processing
- Separate worker process handles email dispatch
- Failures logged and can be retried

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

### Password Recovery Flow
```
1. User enters email at forgot password page
2. Client sends email to /forgot-password endpoint
3. Server validates email and generates reset token
4. Token hash stored in database with 15-minute expiration
5. Reset email queued to be sent (Bull Queue)
6. Email worker sends email with reset link + token
7. User clicks link and enters new password
8. Client sends token and new password to /reset-password
9. Server validates token (not expired, not used)
10. Server hashes new password and updates account
11. Server marks reset token as used
12. Server increments token_version (all tokens invalidated)
13. User notified of successful reset, prompted to login
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
