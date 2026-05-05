import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lightweight in-memory store for rate limiting (Edge compatible)
const rateLimitCache = new Map();

export async function proxy(request) {
  const response = NextResponse.next();

  // 1. Enforce Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. Authentication & Route Protection
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isSignupPage = request.nextUrl.pathname.startsWith('/signup');

  if (isDashboardPage && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((isLoginPage || isSignupPage) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. CORS Lockdown for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://leadsnap.app';

    if (process.env.NODE_ENV === 'production' && origin && origin !== allowedOrigin) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 4. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    let limit = 100;
    if (request.nextUrl.pathname.includes('/search') || request.nextUrl.pathname.includes('/auth/')) {
      limit = 5; 
    }

    if (rateLimitCache.has(ip)) {
      const entry = rateLimitCache.get(ip);
      if (now - entry.startTime > windowMs) {
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

    if (rateLimitCache.size > 5000) rateLimitCache.clear();
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
