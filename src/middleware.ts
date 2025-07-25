


import createMiddleware from 'next-intl/middleware';
import {type NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';
import {updateSession} from './lib/supabase/middleware';
 
const handleI18nRouting = createMiddleware(routing);
 
export async function middleware(request: NextRequest) {
  // Skip locale handling for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Create response inline for API routes
    const response = NextResponse.next({ request });
    return await updateSession(request, response);
  }
  
  const response = handleI18nRouting(request);
 
  // A `response` can now be passed here
  return await updateSession(request, response);
}
 
export const config = {
  matcher: [
    '/',
    '/(es|ca|eu|gl)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
};