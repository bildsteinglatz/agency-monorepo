import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { createSevDeskWorkshopOrder } from '@/lib/sevdesk';
import { sendWorkshopConfirmation, sendWorkshopAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, workshopTitle, workshopDate, price } = body;

        // Validate required fields
        if (!name || !email || !workshopTitle) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Step 1: Save to Firebase
        const docRef = await addDoc(collection(db, 'workshop_inquiries'), {
            name,
            email,
            message: message || '',
            workshopTitle,
            workshopDate: workshopDate || '',
            price: price || '',
            createdAt: serverTimestamp(),
            sevdeskStatus: process.env.SEVDESK_API_KEY ? 'pending' : 'disabled',
            sevdeskAttempts: 0,
        });

        // Initialize SevDesk result
        let sevdeskResult = null;

        // Step 2: Handle SevDesk (DISABLED FOR NOW)
        /*
        if (process.env.SEVDESK_API_KEY) {
            try {
                // Idempotency check: Ensure we haven't already processed this doc
                const docSnapshot = await getDoc(doc(db, 'workshop_inquiries', docRef.id));
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
                    await updateDoc(doc(db, 'workshop_inquiries', docRef.id), {
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
                await updateDoc(doc(db, 'workshop_inquiries', docRef.id), {
                    sevdeskStatus: 'failed',
                    sevdeskError: sevdeskError instanceof Error ? sevdeskError.message : 'Unknown error',
                    sevdeskAttempts: 1, // Simple counter for now
                    sevdeskUpdatedAt: serverTimestamp(),
                });
            }
        }
        */

        // Step 3: Send Automated Emails
        // A. Admin Notification
        const adminEmail = await sendWorkshopAdminNotification(name, email, workshopTitle, workshopDate || '', message || '', price || '');
        if (!adminEmail.success) {
            console.error('Failed to send workshop admin notification');
        }

        // B. User Confirmation
        const userEmail = await sendWorkshopConfirmation(name, email, workshopTitle, workshopDate || '');
        if (!userEmail.success) {
            console.error('Failed to send workshop user confirmation');
        }

        return NextResponse.json({
            success: true,
            firebaseId: docRef.id,
            sevdesk: null,
        });

    } catch (error) {
        console.error('Workshop registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
