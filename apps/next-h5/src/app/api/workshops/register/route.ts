import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { createSevDeskWorkshopOrder } from '@/lib/sevdesk';
import { sendWorkshopConfirmation, sendWorkshopAdminNotification } from '@/lib/email';

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

        // Step 1: Save to Firebase
        console.log('Saving to Firebase (using membership_inquiries collection)...');
        let docRef;
        try {
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
                sevdeskStatus: process.env.SEVDESK_API_KEY ? 'pending' : 'disabled',
                sevdeskAttempts: 0,
            });
            console.log('Saved to Firebase with ID:', docRef.id);
        } catch (firebaseError) {
            console.error('Firebase save error:', firebaseError);
            throw new Error(`Firebase save failed: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}`);
        }

        // Initialize SevDesk result
        let sevdeskResult = null;

        // Step 2: Handle SevDesk (DISABLED FOR NOW)
        /*
        if (process.env.SEVDESK_API_KEY) {
            try {
                // Idempotency check: Ensure we haven't already processed this doc
                const docSnapshot = await getDoc(doc(db, 'membership_inquiries', docRef.id));
                const data = docSnapshot.data() || {};

                if (data.sevdeskStatus === 'success' && data.sevdeskInvoiceId) {
                    sevdeskResult = {
                        contact: { id: data.sevdeskContactId },
                        invoice: { id: data.sevdeskInvoiceId, invoiceNumber: data.sevdeskInvoiceNumber },
                    };
                } else {
                    // Create in SevDesk
                    sevdeskResult = await createSevDeskWorkshopOrder({
                        name,
                        email,
                        workshopTitle,
                        workshopDate: workshopDate || '',
                        price: price || '0',
                    });

                    // Update Firebase with success
                    await updateDoc(doc(db, 'membership_inquiries', docRef.id), {
                        sevdeskStatus: 'success',
                        sevdeskContactId: sevdeskResult.contact.id,
                        sevdeskInvoiceId: sevdeskResult.invoice.id,
                        sevdeskInvoiceNumber: sevdeskResult.invoice.invoiceNumber,
                        sevdeskAttempts: (data.sevdeskAttempts || 0) + 1,
                        sevdeskUpdatedAt: serverTimestamp(),
                    });

                    console.log(`sevDesk: Created workshop invoice ${sevdeskResult.invoice.invoiceNumber} for ${email}`);
                }
            } catch (sevdeskError) {
                console.error('sevDesk error:', sevdeskError);
                // Update Firebase with failure
                await updateDoc(doc(db, 'membership_inquiries', docRef.id), {
                    sevdeskStatus: 'failed',
                    sevdeskError: sevdeskError instanceof Error ? sevdeskError.message : 'Unknown error',
                    sevdeskAttempts: 1, // Simple counter for now
                    sevdeskUpdatedAt: serverTimestamp(),
                });
            }
        }
        */

        // Step 3: Send Automated Emails
        console.log('Sending emails...');
        // A. Admin Notification
        const adminEmail = await sendWorkshopAdminNotification(name, email, workshopTitle, workshopDate || '', message || '', price || '0', !!isPrebooking);
        if (!adminEmail.success) {
            console.error('Failed to send workshop admin notification:', adminEmail.error);
        }

        // B. User Confirmation
        const userEmail = await sendWorkshopConfirmation(name, email, workshopTitle, workshopDate || '', !!isPrebooking);
        if (!userEmail.success) {
            console.error('Failed to send workshop user confirmation:', userEmail.error);
        }
        console.log('Emails sent.');

        return NextResponse.json({
            success: true,
            firebaseId: docRef.id,
            sevdesk: null,
        });

    } catch (error) {
        console.error('Workshop registration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
