import * as admin from 'firebase-admin';
import { serverConfig } from './server-config';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serverConfig.serviceAccount.projectId,
        clientEmail: serverConfig.serviceAccount.clientEmail,
        privateKey: serverConfig.serviceAccount.privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
