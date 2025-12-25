import { NextResponse } from 'next/server';
import { query } from 'firebase/firestore';
import { collection, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { processMembershipDoc, processWorkshopOrderDoc } from '@/lib/sevdeskWorker';

const ADMIN_TOKEN = process.env.SEVDESK_ADMIN_TOKEN || '';

export async function POST(request: Request) {
    // Simple token protection
    const token = request.headers.get('x-admin-token') || '';
    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { docId, type = 'membership', limit: limitN = 10 } = body as { docId?: string; type?: 'membership' | 'workshop'; limit?: number };

    const results: any[] = [];

    if (docId) {
        const res = type === 'workshop' 
            ? await processWorkshopOrderDoc(docId)
            : await processMembershipDoc(docId);
        results.push({ docId, res });
        return NextResponse.json({ results });
    }

    // Find failed or pending items
    const collectionName = type === 'workshop' ? 'workshop_inquiries' : 'membership_inquiries';
    const q = query(
        collection(db, collectionName),
        where('sevdeskStatus', 'in', ['failed', 'pending']),
        limit(limitN)
    );

    const snaps = await getDocs(q);
    for (const s of snaps.docs) {
        try {
            const res = type === 'workshop'
                ? await processWorkshopOrderDoc(s.id)
                : await processMembershipDoc(s.id);
            results.push({ docId: s.id, res });
        } catch (err) {
            results.push({ docId: s.id, error: (err as any).message || String(err) });
        }
    }

    return NextResponse.json({ results });
}
