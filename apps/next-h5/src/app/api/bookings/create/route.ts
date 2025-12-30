import { NextResponse } from 'next/server';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { serverConfig } from '@/firebase/server-config';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp({
        credential: cert(serverConfig.serviceAccount),
    });
}

const db = getFirestore();

export async function POST(request: Request) {
    try {
        // Verify authentication
        const tokens = await getTokens(await cookies(), {
            apiKey: serverConfig.apiKey,
            cookieName: serverConfig.cookieName,
            cookieSignatureKeys: serverConfig.cookieSignatureKeys,
            serviceAccount: serverConfig.serviceAccount,
        });

        if (!tokens) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            itemId, 
            itemType, 
            itemTitle, 
            amount, 
            paymentMethod, 
            status, 
            paymentIntentId,
            billingDetails 
        } = body;

        if (!itemId || !amount || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const bookingData = {
            userId: tokens.decodedToken.uid,
            userEmail: tokens.decodedToken.email,
            itemId,
            itemType,
            itemTitle,
            amount, // in cents
            currency: 'eur',
            paymentMethod,
            status: status || 'pending',
            paymentIntentId: paymentIntentId || null,
            billingDetails,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Create booking in Firestore
        const bookingRef = await db.collection('bookings').add(bookingData);

        return NextResponse.json({
            success: true,
            bookingId: bookingRef.id
        });

    } catch (error: any) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
