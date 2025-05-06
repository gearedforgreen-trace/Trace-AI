import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export const authRoutes = ['/sign-in'];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);


  return NextResponse.json({
    sessionCookie,
  });

  if (authRoutes.includes(request.nextUrl.pathname) && !sessionCookie) {
    return NextResponse.next();
  }

  if (authRoutes.includes(request.nextUrl.pathname) && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/analytics',
    '/coupons',
    '/qr-codes',
    '/users',
    '/settings',
    '/reward-points',
    '/organization',
    '/organization/:path*',
  ],
};
