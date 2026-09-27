import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (pathname.startsWith('/login') || pathname.startsWith('/privacy')) {
    if (token && pathname.startsWith('/login')) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // Protected paths (everything except /login, /api, static files)
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    if (!token) {
      if (refreshToken) {
        // Tenemos refresh_token pero no access_token. Intentamos refrescar llamando al endpoint local.
        try {
          const res = await fetch(new URL('/api/auth/refresh', request.url), {
            method: 'POST',
            headers: {
              cookie: `refresh_token=${refreshToken}`,
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.accessToken) {
              // Modificamos el request actual para que los Server Components vean el nuevo access_token
              request.cookies.set('access_token', data.accessToken);
              
              const response = NextResponse.next({
                request: {
                  headers: request.headers,
                }
              });
              
              // Copiamos las cookies (nuevo access_token y refresh_token) del response de la API a nuestro middleware response
              const setCookieHeaders = res.headers.getSetCookie();
              if (setCookieHeaders && setCookieHeaders.length > 0) {
                for (const cookie of setCookieHeaders) {
                  response.headers.append('Set-Cookie', cookie);
                }
              }
              return response;
            }
          }
        } catch (e) {
          console.error('Middleware refresh error:', e);
        }
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
