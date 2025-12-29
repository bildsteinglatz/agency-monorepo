import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverConfig } from '@/firebase/server-config';

export async function requireStaffRole() {
  const tokens = await getTokens(await cookies(), {
    apiKey: serverConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  if (!tokens) {
    redirect('/');
  }

  const email = tokens.decodedToken.email;
  
  if (!email || !email.endsWith('@halle5.at')) {
    console.warn(`Unauthorized access attempt by ${email}`);
    redirect('/');
  }

  return tokens.decodedToken;
}
