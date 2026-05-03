import { NextResponse } from 'next/server';

// Lightweight in-memory store for rate limiting (Edge compatible)
const rateLimitCache = new Map();

export function middleware(request) {
  const response = NextResponse.next();

  // 1. Enforce Security Headers
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'); // Enforce HTTPS
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. CORS Lockdown for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://leadsnap.app';

    // In production, reject unverified origins (STRICT exact match)
    if (process.env.NODE_ENV === 'production' && origin && origin !== allowedOrigin) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 3. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    // Set limits based on endpoint sensitivity
    let limit = 100;
    // Fix: 5 requests/min per IP on login + expensive (search/AI) endpoints
    if (request.nextUrl.pathname.includes('/search') || request.nextUrl.pathname.includes('/auth/')) {
      limit = 5; 
    }

    if (rateLimitCache.has(ip)) {
      const entry = rateLimitCache.get(ip);
      if (now - entry.startTime > windowMs) {
        // Reset window
        rateLimitCache.set(ip, { count: 1, startTime: now });
      } else {
        entry.count++;
        if (entry.count > limit) {
          console.warn(`[ABUSE DETECTED] Rate limit exceeded by IP: ${ip} on ${request.nextUrl.pathname}`);
          return new NextResponse(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
          });
        }
      }
    } else {
      rateLimitCache.set(ip, { count: 1, startTime: now });
    }

    // Occasional cleanup to prevent edge memory leaks
    if (rateLimitCache.size > 5000) rateLimitCache.clear();
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
