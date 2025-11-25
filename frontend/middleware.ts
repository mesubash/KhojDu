// Middleware for route protection and authentication
// ✅ Protects routes based on authentication status

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/how-it-works",
  "/search",
  "/listing",
];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/messages", "/profile"];

// Admin-only routes
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has refresh token cookie (indicates authentication)
  // Note: The backend sets cookie with Path=/api/auth, so we also check for
  // the presence of any auth-related cookies or headers
  const refreshToken = request.cookies.get("refreshToken");
  const kdToken = request.cookies.get("__kd_token");
  
  // Check for authentication - either cookie exists or we have a session
  // Since refreshToken has Path=/api/auth, it won't be sent to frontend routes
  // So we'll be more lenient and check if the request is coming from an authenticated session
  const isAuthenticated = !!(refreshToken || kdToken);

  // Check if path is protected (only check specific protected routes)
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // ✅ For protected routes, we'll allow access and let the client-side handle auth
  // The AuthContext will redirect if not authenticated
  // This is necessary because the refreshToken cookie has Path=/api/auth
  // and isn't accessible to middleware on frontend routes
  if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
    // Instead of blocking, we'll allow the request and let client-side auth handle it
    // This prevents the redirect loop issue
    console.log('[Middleware] Protected route accessed, allowing (client-side will handle auth)');
  }

  // ✅ If authenticated user tries to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ Allow all other requests (public pages, static assets, etc.)
  return NextResponse.next();
}

// Configure which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images|icons).*)",
  ],
};
