# Security Plus Admin Backend API Documentation

## Overview
This is the backend API for Security Plus Admin panel with authentication system and auto-import functionality.

**Base URL:** `http://localhost:8000`

## Authentication Endpoints

### 1. User Sign Up
**POST** `/api/auth/signup`

Creates a new user account.

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 6 chars, must contain uppercase, lowercase, number)",
  "role": "string (optional, default: 'user', values: 'user' | 'admin')"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "jwt_token_here",
    "expiresIn": "7d"
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Username must be between 3 and 30 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

### 2. User Sign In
**POST** `/api/auth/signin`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "lastLogin": "2025-10-18T10:18:34.287Z"
    },
    "token": "jwt_token_here",
    "expiresIn": "7d"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3. Get User Profile
**GET** `/api/auth/me`

Returns current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "lastLogin": "2025-10-18T10:18:34.287Z",
      "createdAt": "2025-10-18T10:16:03.200Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 4. User Logout
**POST** `/api/auth/logout`

Logs out user (client-side token removal).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Auto-Import Endpoints

### 1. Import Data
**POST** `/api/auto-import/import`

Automatically import data from frontend.

**Request Body:**
```json
{
  "collectionName": "string (optional, default: 'security-plus-data')"
}
```

### 2. Get Import Status
**GET** `/api/auto-import/status`

Get import status and collection info.

**Query Parameters:**
- `collectionName` (optional): Collection name to check

### 3. Start Auto Sync
**POST** `/api/auto-import/sync`

Start auto-sync (watch for changes).

### 4. List Collections
**GET** `/api/auto-import/collections`

List all collections in database.

### 5. Get Collection Data
**GET** `/api/auto-import/data/:collection`

Get data from specific collection.

**Query Parameters:**
- `limit` (optional): Number of documents to return (default: 10)
- `skip` (optional): Number of documents to skip (default: 0)

## System Endpoints

### Health Check
**GET** `/api/health`

Returns API health status.

**Response:**
```json
{
  "success": true,
  "message": "Security Plus Admin API is running",
  "timestamp": "2025-10-18T10:05:57.629Z"
}
```

### API Documentation
**GET** `/`

Returns complete API documentation and available endpoints.

## Authentication Middleware

The API includes authentication middleware for protecting routes:

- `authenticateToken`: Validates JWT token
- `requireAdmin`: Requires admin role
- `requireRole(roles)`: Requires specific roles

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (user already exists)
- `500`: Internal Server Error

## Environment Variables

Create a `.env` file with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/security-plus-admin

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
```

## Testing the API

### Using PowerShell (Windows):

1. **Sign Up:**
```powershell
$body = @{ username = "testuser"; email = "test@example.com"; password = "TestPass123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

2. **Sign In:**
```powershell
$body = @{ email = "test@example.com"; password = "TestPass123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/signin" -Method POST -Body $body -ContentType "application/json"
```

3. **Get Profile:**
```powershell
$token = "your_jwt_token_here"
$headers = @{ Authorization = "Bearer $token" }
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/me" -Method GET -Headers $headers
```

### Using curl:

1. **Sign Up:**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'
```

2. **Sign In:**
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

3. **Get Profile:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Security Features

- Password hashing with bcrypt (salt rounds: 12)
- JWT token authentication
- Input validation with express-validator
- Role-based access control
- CORS enabled
- Environment-based error messages

## Database Schema

### User Model
```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['admin', 'user'], default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `env.example`:
```bash
cp env.example .env
```

3. Update environment variables in `.env`

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

The API will be available at `http://localhost:8000`
