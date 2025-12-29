import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmailWithTemplate, sendWorkshopAdminNotification } from '@/lib/email';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { serverConfig } from '@/firebase/server-config';

export async function POST(request: Request) {
    try {
        if (!process.env.RESEND) {
            console.warn('RESEND API key is missing in environment variables');
        }
        const body = await request.json();
        console.log('Workshop registration request body:', body);
        const { name, email, message, workshopTitle, workshopDate, price, isPrebooking, eventId } = body;

        // Validate required fields
        if (!name || !email || !workshopTitle) {
            console.warn('Missing required fields:', { name, email, workshopTitle });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for authenticated user
        let userId: string | null = null;
        try {
            const tokens = await getTokens(await cookies(), {
                apiKey: serverConfig.apiKey,
                cookieName: serverConfig.cookieName,
                cookieSignatureKeys: serverConfig.cookieSignatureKeys,
                serviceAccount: serverConfig.serviceAccount,
            });
            userId = tokens?.decodedToken.uid || null;
        } catch (e) {
            console.warn('Failed to get auth tokens:', e);
        }

        // Step 1: Save to Firebase
        console.log('Saving to Firebase...');
        let docRef;
        try {
            if (userId && eventId) {
                console.log('Saving to bookings collection (authenticated)...');
                docRef = await addDoc(collection(db, 'bookings'), {
                    userId,
                    eventId,
                    status: 'confirmed',
                    timestamp: serverTimestamp(),
                    // Store details for redundancy
                    name,
                    email,
                    message: message || '',
                    workshopTitle,
                    workshopDate: workshopDate || '',
                    price: price || '',
                    isPrebooking: !!isPrebooking,
                });
            } else {
                console.log('Saving to membership_inquiries collection (legacy/guest)...');
                docRef = await addDoc(collection(db, 'membership_inquiries'), {
                    name,
                    email,
                    message: message || '',
                    workshopTitle,
                    workshopDate: workshopDate || '',
                    price: price || '',
                    isPrebooking: !!isPrebooking,
                    type: 'workshop', // Distinguish from membership inquiries
                    createdAt: serverTimestamp(),
                    eventId: eventId || null, // Store eventId if available even for guests
                });
            }
            console.log('Saved to Firebase with ID:', docRef.id);
        } catch (firebaseError) {
            console.error('Firebase save error:', firebaseError);
            throw new Error(`Firebase save failed: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}`);
        }

        // Step 2: Send Automated Emails
        console.log('Sending emails...');
        // A. Admin Notification
        const adminEmail = await sendWorkshopAdminNotification(name, email, workshopTitle, workshopDate || '', message || '', price || '0', !!isPrebooking);
        if (!adminEmail.success) {
            console.error('Failed to send workshop admin notification:', adminEmail.error);
        }

        // B. User Confirmation (using Sanity Template)
        const templateSlug = isPrebooking ? 'workshop-voranmeldung-confirmation' : 'workshop-confirmation';
        const userEmail = await sendEmailWithTemplate(templateSlug, email, {
            userName: name,
            workshopTitle,
            workshopDate: workshopDate || '',
        });
        
        if (!userEmail.success) {
            console.error('Failed to send workshop user confirmation:', userEmail.error);
        }
        console.log('Emails sent.');

        return NextResponse.json({
            success: true,
            firebaseId: docRef.id,
        });

    } catch (error) {
        console.error('Workshop registration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
