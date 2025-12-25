import { createSevDeskMember, createSevDeskWorkshopOrder } from './sevdesk';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function processMembershipDoc(membershipDocId: string) {
    const ref = doc(db, 'membership_inquiries', membershipDocId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Document not found');
    const data = snap.data() as any;

    // Skip if already successful
    if (data.sevdeskStatus === 'success' && data.sevdeskInvoiceId) {
        return { skipped: true, reason: 'already_success' };
    }

    // Don't process if disabled in env
    if (!process.env.SEVDESK_API_KEY) {
        await updateDoc(ref, {
            sevdeskStatus: 'disabled',
            sevdeskUpdatedAt: serverTimestamp(),
        });
        return { skipped: true, reason: 'sevdesk_disabled' };
    }

    // Increment attempts
    const attempts = (data.sevdeskAttempts || 0) + 1;
    await updateDoc(ref, { sevdeskStatus: 'processing', sevdeskAttempts: attempts, sevdeskUpdatedAt: serverTimestamp() });

    try {
        const result = await createSevDeskMember({
            name: data.name,
            email: data.email,
            membershipType: data.membershipType,
            price: data.price || '0',
        });

        await updateDoc(ref, {
            sevdeskStatus: 'success',
            sevdeskContactId: result.contact.id,
            sevdeskInvoiceId: result.invoice.id,
            sevdeskInvoiceNumber: result.invoice.invoiceNumber,
            sevdeskUpdatedAt: serverTimestamp(),
        });

        return { success: true, result };
    } catch (err: any) {
        await updateDoc(ref, {
            sevdeskStatus: 'failed',
            sevdeskError: err?.message || String(err),
            sevdeskAttempts: attempts,
            sevdeskUpdatedAt: serverTimestamp(),
        });
        return { success: false, error: err?.message || String(err) };
    }
}

export async function processWorkshopOrderDoc(orderDocId: string) {
    const ref = doc(db, 'workshop_inquiries', orderDocId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Document not found');
    const data = snap.data() as any;

    // Skip if already successful
    if (data.sevdeskStatus === 'success' && data.sevdeskInvoiceId) {
        return { skipped: true, reason: 'already_success' };
    }

    // Don't process if disabled in env
    if (!process.env.SEVDESK_API_KEY) {
        await updateDoc(ref, {
            sevdeskStatus: 'disabled',
            sevdeskUpdatedAt: serverTimestamp(),
        });
        return { skipped: true, reason: 'sevdesk_disabled' };
    }

    // Increment attempts
    const attempts = (data.sevdeskAttempts || 0) + 1;
    await updateDoc(ref, { sevdeskStatus: 'processing', sevdeskAttempts: attempts, sevdeskUpdatedAt: serverTimestamp() });

    // SEVDESK DISABLED FOR NOW
    await updateDoc(ref, {
        sevdeskStatus: 'disabled',
        sevdeskUpdatedAt: serverTimestamp(),
    });
    return { skipped: true, reason: 'sevdesk_disabled' };

    /*
    try {
        const result = await createSevDeskWorkshopOrder({
            name: data.name,
            email: data.email,
            workshopTitle: data.workshopTitle,
            price: data.price || '0',
        });

        await updateDoc(ref, {
            sevdeskStatus: 'success',
            sevdeskContactId: result.contact.id,
            sevdeskInvoiceId: result.invoice.id,
            sevdeskInvoiceNumber: result.invoice.invoiceNumber,
            sevdeskUpdatedAt: serverTimestamp(),
        });

        return { success: true, result };
    } catch (err: any) {
        await updateDoc(ref, {
            sevdeskStatus: 'failed',
            sevdeskError: err?.message || String(err),
            sevdeskAttempts: attempts,
            sevdeskUpdatedAt: serverTimestamp(),
        });
        return { success: false, error: err?.message || String(err) };
    }
    */
}
