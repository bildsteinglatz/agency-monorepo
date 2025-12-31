import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { sendEmailWithTemplate, sendAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, membershipType, price } = body;

        // Validate required fields
        if (!name || !email || !membershipType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Step 1: Save to Firebase using Admin SDK
        const docRef = await adminDb.collection('membership_inquiries').add({
            name,
            email,
            message: message || '',
            membershipType,
            price: price || '',
            createdAt: new Date(), // Admin SDK uses native Date or FieldValue.serverTimestamp()
        });

        // Step 2: Send Automated Emails
        // A. Admin Notification (Matthias)
        const adminEmail = await sendAdminNotification(name, email, membershipType, message || '', price || '');
        if (!adminEmail.success) {
            console.error('Failed to send admin notification');
        }

        // B. User Confirmation (using Sanity Template)
        const userEmail = await sendEmailWithTemplate('membership-confirmation', email, {
            userName: name,
            membershipType,
        });
        
        if (!userEmail.success) {
            console.error('Failed to send user confirmation');
        }

        return NextResponse.json({
            success: true,
            firebaseId: docRef.id,
            emailSent: userEmail.success
        });

    } catch (error) {
        console.error('Error creating membership:', error);
        return NextResponse.json(
            {
                error: 'Failed to create membership',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
