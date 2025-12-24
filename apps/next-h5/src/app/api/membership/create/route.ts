import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { createSevDeskMember } from '@/lib/sevdesk';
import { sendMembershipConfirmation, sendAdminNotification } from '@/lib/email';

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

        // Step 1: Save to Firebase
        const docRef = await addDoc(collection(db, 'membership_inquiries'), {
            name,
            email,
            message: message || '',
            membershipType,
            price: price || '',
            createdAt: serverTimestamp(),
            sevdeskStatus: process.env.SEVDESK_API_KEY ? 'pending' : 'disabled',
            sevdeskAttempts: 0,
        });

        // Initialize SevDesk result
        let sevdeskResult = null;

        // Step 2: Handle SevDesk (if configured)
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
                    sevdeskResult = await createSevDeskMember({
                        name,
                        email,
                        membershipType,
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

                    console.log(`sevDesk: Created invoice ${sevdeskResult.invoice.invoiceNumber} for ${email}`);
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

        // Step 3: Send Automated Emails
        // A. Admin Notification (Matthias)
        const adminEmail = await sendAdminNotification(name, email, membershipType, message || '', price || '');
        if (!adminEmail.success) {
            console.error('Failed to send admin notification');
        }

        // B. User Confirmation (The "Automated Communication" part)
        const userEmail = await sendMembershipConfirmation(name, email, membershipType);
        if (!userEmail.success) {
            console.error('Failed to send user confirmation');
        }

        return NextResponse.json({
            success: true,
            firebaseId: docRef.id,
            sevdesk: sevdeskResult ? {
                contactId: sevdeskResult.contact.id,
                invoiceId: sevdeskResult.invoice.id,
                invoiceNumber: sevdeskResult.invoice.invoiceNumber,
            } : null,
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
