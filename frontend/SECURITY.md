# Security Implementation Guide

## 🔐 Token Storage Strategy

### Access Token (24 hours)
**Storage Location:** **In-Memory (React State)** ✅ SECURE

- Stored in React state within `AuthContext`
- Never persisted to localStorage or sessionStorage
- Cleared automatically on page refresh (requires re-authentication via refresh token)
- Protected from XSS attacks since it's not in localStorage

**Access via:**
```typescript
// In AuthContext
const [accessToken, setAccessToken] = useState<string | null>(null)

// Exposed to axios via window (minimal exposure)
window.__getAccessToken = () => accessToken
window.__setAccessToken = (token) => setAccessToken(token)
```

### Refresh Token (7 days)
**Storage Location:** **HTTP-Only Cookie** ✅ MOST SECURE

- Set by backend with `HttpOnly` flag (JavaScript cannot access)
- Set with `Secure` flag in production (HTTPS only)
- Set with `SameSite=Strict` to prevent CSRF attacks
- Automatically included in requests via `withCredentials: true`
- Backend handles token rotation and blacklisting

**Cookie Configuration (Backend):**
```java
ResponseCookie.from("refreshToken", refreshToken)
    .httpOnly(true)           // Cannot be accessed by JavaScript
    .secure(true)             // HTTPS only in production
    .sameSite("Strict")       // CSRF protection
    .path("/")
    .maxAge(7 * 24 * 60 * 60) // 7 days
    .build();
```

## 🛡️ Security Features

### 1. XSS Protection
- **Access tokens in memory**: Not vulnerable to XSS attacks via localStorage
- **HTTP-only cookies**: Refresh tokens completely inaccessible to JavaScript
- **Content Security Policy**: Configure CSP headers on backend

### 2. CSRF Protection
- **SameSite=Strict cookies**: Browser prevents cookies from being sent in cross-site requests
- **CORS configuration**: Backend whitelist for allowed origins

### 3. Token Rotation
- Every refresh generates new access + refresh tokens
- Old refresh token is invalidated immediately
- Prevents token replay attacks

### 4. Reuse Detection
- Backend detects if an old refresh token is reused
- If detected, entire token family is invalidated
- User must re-authenticate

### 5. Token Blacklisting
- Used tokens stored in Redis for 7 days
- Prevents token reuse even if intercepted
- Logout immediately blacklists all user tokens

## 🔄 Authentication Flow

### Initial Login
1. User submits credentials to `/auth/login`
2. Backend validates and returns:
   - Access token (24h) in response body
   - Refresh token (7d) in HTTP-only cookie
3. Frontend stores access token in memory (React state)
4. Frontend stores user info in React Context

### Authenticated Requests
1. Axios interceptor adds access token to `Authorization` header
2. Request sent with `withCredentials: true` (includes refresh cookie)
3. Backend validates access token
4. Response returned

### Access Token Expiry (401 Error)
1. Axios interceptor catches 401 error
2. Calls `/auth/refresh` with refresh token cookie
3. Backend validates refresh token from cookie
4. Returns new access token (24h) + new refresh cookie (7d)
5. Updates access token in memory
6. Retries original request with new access token
7. Queued requests also updated with new token

### Logout
1. User clicks logout
2. Frontend calls `/auth/logout`
3. Backend:
   - Blacklists refresh token in Redis
   - Clears refresh token cookie
   - Blacklists access token
4. Frontend clears access token from memory
5. Redirects to login page

## 🚪 Route Protection

### Public Routes (No Auth Required)
- `/` - Homepage
- `/about` - About page
- `/contact` - Contact page
- `/how-it-works` - How it works
- `/search` - Search listings
- `/listing/[id]` - View listing details

### Protected Routes (Auth Required)
- `/dashboard` - User/Landlord dashboard
- `/dashboard/create` - Create listing
- `/messages` - Messages
- `/profile` - User profile

### Admin Routes (Admin Role Required)
- `/admin` - Admin panel

### Auth Routes (Redirect if Logged In)
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/forgot-password` - Password reset request

### Middleware Logic
```typescript
// middleware.ts
1. Check if refresh token cookie exists
2. If accessing protected route without auth → Redirect to /auth/login?redirect=/original-path
3. If accessing auth route while authenticated → Redirect to /dashboard
4. All other routes → Allow access
```

## 🔑 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8089/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_COOKIE_DOMAIN=localhost
```

## 📝 Best Practices

### ✅ DO
- Store access tokens in memory (React state)
- Store refresh tokens in HTTP-only cookies
- Use `withCredentials: true` for all API requests
- Implement automatic token refresh on 401
- Clear tokens on logout
- Validate tokens on every request (backend)
- Use short-lived access tokens (15-30 min recommended, 24h for development)
- Use longer-lived refresh tokens (7-30 days)
- Implement token rotation
- Implement reuse detection
- Use HTTPS in production

### ❌ DON'T
- Store tokens in localStorage (vulnerable to XSS)
- Store tokens in sessionStorage (still vulnerable to XSS)
- Store sensitive data in cookies accessible to JavaScript
- Use long-lived access tokens
- Skip token validation on backend
- Share tokens between users
- Log tokens in console (production)
- Send tokens in URL parameters

## 🧪 Testing Authentication

### Test Login
```bash
# Terminal 1: Start backend
cd backend && ./mvnw spring-boot:run

# Terminal 2: Start frontend
cd frontend && pnpm dev

# Browser: Open http://localhost:3000/auth/login
# Login with credentials
# Check: DevTools → Application → Cookies → refreshToken (HttpOnly)
# Check: React DevTools → AuthContext → accessToken in state
```

### Test Protected Routes
```bash
# Not logged in: Try accessing /dashboard → Redirects to /auth/login?redirect=/dashboard
# Login → Automatically redirected back to /dashboard
# Logged in: Try accessing /auth/login → Redirects to /dashboard
```

### Test Token Refresh
```bash
# 1. Login and note access token
# 2. Wait for token to expire (or manually expire on backend)
# 3. Make any API request
# 4. Check Network tab: Should see /auth/refresh call
# 5. Check: New access token in memory
# 6. Original request should succeed
```

### Test Logout
```bash
# 1. Login
# 2. Click logout
# 3. Check: redirected to /auth/login
# 4. Check: refreshToken cookie cleared
# 5. Check: access token cleared from memory
# 6. Try accessing /dashboard → Redirects to login
```

## 🐛 Troubleshooting

### Issue: "Not hitting backend"
**Check:**
1. Backend running on port 8089?
2. CORS enabled on backend?
3. `withCredentials: true` in axios?
4. Correct API URL in .env.local?

### Issue: "Token not being sent"
**Check:**
1. Access token in React state? (React DevTools)
2. Refresh token cookie exists? (DevTools → Application → Cookies)
3. Axios interceptor adding token to headers? (Network tab)

### Issue: "Infinite refresh loop"
**Check:**
1. Refresh token valid?
2. Backend refresh endpoint working?
3. `_retry` flag preventing double-refresh?

### Issue: "Redirecting to login unexpectedly"
**Check:**
1. Middleware routes configuration
2. Refresh token cookie not expired?
3. Backend not returning 401 for valid tokens?

## 📚 References

- [OWASP Cheat Sheet: Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- [HTTP-only Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
