import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { slug, to, data } = await request.json();

        if (!slug || !to) {
            return NextResponse.json({ error: 'Missing slug or recipient' }, { status: 400 });
        }

        // Fetch template from Sanity
        const template = await client.fetch(
            `*[_type == "emailTemplate" && slug.current == $slug][0]`,
            { slug }
        );

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        let { subject, body } = template;

        // Replace placeholders
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
                body = body.replace(new RegExp(placeholder, 'g'), String(value));
            });
        }

        const result = await sendEmail({
            to,
            subject,
            html: body,
        });

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email template error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
