import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from 'next-firebase-auth-edge';
import { serverConfig } from '@/firebase/server-config';

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    apiKey: serverConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async (reason) => {
      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', error);
      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: [
    '/api/login',
    '/api/logout',
    '/',
    '/((?!_next|favicon.ico|.*\\.).*)',
  ],
};
