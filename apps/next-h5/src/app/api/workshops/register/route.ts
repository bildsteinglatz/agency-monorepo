import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { sendEmailWithTemplate, sendWorkshopAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        if (!process.env.RESEND) {
            console.warn('RESEND API key is missing in environment variables');
        }
        const body = await request.json();
        console.log('Workshop registration request body:', body);
        const { name, email, message, workshopTitle, workshopDate, price, isPrebooking } = body;

        // Validate required fields
        if (!name || !email || !workshopTitle) {
            console.warn('Missing required fields:', { name, email, workshopTitle });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Step 1: Save to Firebase using Admin SDK
        console.log('Saving to Firebase (using membership_inquiries collection)...');
        let docRef;
        try {
            docRef = await adminDb.collection('membership_inquiries').add({
                name,
                email,
                message: message || '',
                workshopTitle,
                workshopDate: workshopDate || '',
                price: price || '',
                isPrebooking: !!isPrebooking,
                type: 'workshop', // Distinguish from membership inquiries
                createdAt: new Date(),
            });
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
