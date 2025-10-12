# API Documentation - CURL Commands

Base URL: `http://localhost:3333`

## Authentication Endpoints

### 1. Create Account
Creates a new user account in the system.

**Endpoint:** `POST /users`

```bash
curl -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

**Response:** `201 Created` (no body)

---

### 2. Authenticate with Password
Authenticates a user with email and password, returning a JWT token.

**Endpoint:** `POST /sessions/password`

```bash
curl -X POST http://localhost:3333/sessions/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid-here",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "avatarUrl": null
  },
  "token": "jwt-token-here"
}
```

---

### 3. Get Profile
Retrieves the authenticated user's profile information.

**Endpoint:** `GET /profile`

**Requires:** Bearer Token Authentication

```bash
curl -X GET http://localhost:3333/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "avatarUrl": null
}
```

---

### 4. Request Password Recovery
Initiates the password recovery process by generating a recovery token.

**Endpoint:** `POST /password/recover`

```bash
curl -X POST http://localhost:3333/password/recover \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Response:** `201 Created` (no body)

**Note:** The recovery token is currently logged to the console. In production, this would be sent via email.

---

### 5. Reset Password
Resets the user's password using a recovery token.

**Endpoint:** `POST /password/reset`

```bash
curl -X POST http://localhost:3333/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "code": "recovery-token-from-email",
    "password": "newSecurePassword123"
  }'
```

**Response:** `204 No Content`

---

## Complete Workflow Example

### Step 1: Create a new account
```bash
curl -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "mypassword123"
  }'
```

### Step 2: Login and get token
```bash
curl -X POST http://localhost:3333/sessions/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "mypassword123"
  }'
```

Save the returned token from the response.

### Step 3: Get your profile (using the token)
```bash
curl -X GET http://localhost:3333/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 4: Forgot password? Request recovery
```bash
curl -X POST http://localhost:3333/password/recover \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com"
  }'
```

### Step 5: Reset password with recovery code
```bash
curl -X POST http://localhost:3333/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "code": "the-recovery-code-from-logs",
    "password": "newStrongPassword456"
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid credentials."
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

---

## Additional Information

- All endpoints accept and return JSON
- The JWT token expires in 7 days
- Password recovery tokens expire in 1 hour
- Minimum password length is 6 characters
- Email addresses must be valid format

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:3333/docs
```
