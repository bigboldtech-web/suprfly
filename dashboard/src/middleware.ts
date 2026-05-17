import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('suprfly_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isPublicPage = pathname === '/' || isAuthPage;

  if (!isPublicPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
