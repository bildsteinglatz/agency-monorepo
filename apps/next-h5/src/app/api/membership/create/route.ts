import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createSevDeskMember } from '@/lib/sevdesk';

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

        // Short-circuit if sevDesk is not configured
        if (!process.env.SEVDESK_API_KEY) {
            // Send Email Notification even if sevDesk is disabled
            if (process.env.RESEND_API_KEY) {
                try {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        },
                        body: JSON.stringify({
                            from: 'halle 5 Membership <system@halle5.at>',
                            to: ['matthias@halle5.at'],
                            subject: `Neue Mitgliedschaftsanfrage: ${membershipType}`,
                            html: `
                                <h1>Neue Anfrage</h1>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Mitgliedschaft:</strong> ${membershipType}</p>
                                <p><strong>Preis:</strong> ${price}</p>
                                <p><strong>Nachricht:</strong></p>
                                <p>${message || 'Keine Nachricht hinterlassen.'}</p>
                                <hr />
                                <p><small>Diese Anfrage wurde auch in Firebase gespeichert.</small></p>
                            `,
                        }),
                    });
                } catch (emailError) {
                    console.error('Failed to send notification email:', emailError);
                }
            }
            return NextResponse.json({ success: true, firebaseId: docRef.id, sevdesk: null });
        }

        // Step 2: Create contact and invoice in sevDesk (if API key is configured)
        let sevdeskResult = null;
        try {
            // Idempotency: re-fetch the doc and ensure we haven't already succeeded
            const docSnapshot = await (await import('firebase/firestore')).getDoc((await import('firebase/firestore')).doc(db, 'membership_inquiries', docRef.id));
            const data = docSnapshot.data?.() || {};
            if (data.sevdeskStatus === 'success' && data.sevdeskInvoiceId) {
                sevdeskResult = {
                    contact: { id: data.sevdeskContactId },
                    invoice: { id: data.sevdeskInvoiceId, invoiceNumber: data.sevdeskInvoiceNumber },
                };
            } else {
                // Attempt creation
                sevdeskResult = await createSevDeskMember({
                    name,
                    email,
                    membershipType,
                    price: price || '0',
                });

                // Update Firebase document with sevDesk info (update in place)
                await (await import('firebase/firestore')).updateDoc((await import('firebase/firestore')).doc(db, 'membership_inquiries', docRef.id), {
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
            // Update existing doc with failure info
            await (await import('firebase/firestore')).updateDoc((await import('firebase/firestore')).doc(db, 'membership_inquiries', docRef.id), {
                sevdeskStatus: 'failed',
                sevdeskError: sevdeskError instanceof Error ? sevdeskError.message : 'Unknown error',
                sevdeskAttempts: (0) + 1,
                sevdeskUpdatedAt: serverTimestamp(),
            });
        }

        // Step 3: Send Email Notification (Temporary until fully automated)
        if (process.env.RESEND_API_KEY) {
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: 'halle 5 Membership <system@halle5.at>',
                        to: ['matthias@halle5.at'],
                        subject: `Neue Mitgliedschaftsanfrage: ${membershipType}`,
                        html: `
                            <h1>Neue Anfrage</h1>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Mitgliedschaft:</strong> ${membershipType}</p>
                            <p><strong>Preis:</strong> ${price}</p>
                            <p><strong>Nachricht:</strong></p>
                            <p>${message || 'Keine Nachricht hinterlassen.'}</p>
                            <hr />
                            <p><small>Diese Anfrage wurde auch in Firebase gespeichert.</small></p>
                        `,
                    }),
                });
            } catch (emailError) {
                console.error('Failed to send notification email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            firebaseId: docRef.id,
            sevdesk: sevdeskResult ? {
                contactId: sevdeskResult.contact.id,
                invoiceId: sevdeskResult.invoice.id,
                invoiceNumber: sevdeskResult.invoice.invoiceNumber,
            } : null,
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
