import { NextRequest, NextResponse } from 'next/server';

export const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
export const publicRoutes = ['/terms', '/privacy-policy'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow auth routes - let them handle their own logic
  if (authRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // For all other routes (protected routes), let the server components handle authentication
  // The dashboard layout will redirect to /sign-in if no session is found
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
