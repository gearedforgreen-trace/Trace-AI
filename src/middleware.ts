import { NextRequest, NextResponse } from 'next/server';

export const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
export const publicRoutes = ['/terms', '/privacy-policy'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie - Better Auth typically uses these cookie names
  const sessionToken = request.cookies.get('better-auth.session_token') || 
                       request.cookies.get('authjs.session-token') ||
                       request.cookies.get('session');
  const hasSession = !!sessionToken;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${pathname}, HasSession: ${hasSession}, Cookies:`, 
      Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 10) + '...'])));
  }

  // If on auth route and has session, redirect to dashboard
  if (authRoutes.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If on auth route and no session, allow access
  if (authRoutes.includes(pathname) && !hasSession) {
    return NextResponse.next();
  }

  // For protected routes, require session
  if (!hasSession) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-in',
    '/',
    '/analytics',
    '/coupons',
    '/qr-codes',
    '/users',
    '/settings',
    '/reward-points',
    '/organization',
    '/organization/:path*',
    '/reward-rules',
    '/reward-rules/:path*',
    '/bins',
    '/materials',
    '/stores',
    '/organizations',
    '/recycles',
  ],
};
