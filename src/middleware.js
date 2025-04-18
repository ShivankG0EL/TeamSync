import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup', '/', '/api/auth/signup', '/api/auth/signin'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Define role-based route access
  const adminRoutes = ['/admin', '/api/admin'];
  const leaderRoutes = ['/leader', '/teams', '/api/teams'];
  const memberRoutes = ['/member', '/tasks', '/api/tasks'];
  
  // Check if the user is authenticated
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If user is authenticated, check role-based access
  if (token) {
    // Redirect from login page if already authenticated
    if (pathname === '/auth/signin' || pathname === '/auth/signup') {
      const dashboardUrl = `/${token.role}/dashboard`;
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    
    // Check role-based access for protected routes
    if (
      (adminRoutes.some(route => pathname.startsWith(route)) && token.role !== 'admin') ||
      (leaderRoutes.some(route => pathname.startsWith(route)) && !['admin', 'leader'].includes(token.role))
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for static files, images, and some auth endpoints
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
