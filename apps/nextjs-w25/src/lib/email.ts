import { Resend } from 'resend';

const resendKey = process.env.RESEND || process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = 'Studio W25 <protocol@mail.w25.at>',
  attachments = [] 
}: { 
  to: string | string[]; 
  subject: string; 
  html: string; 
  from?: string;
  attachments?: any[];
}) {
    if (!resend) {
        console.error('RESEND_API_KEY not found. Email sending skipped.');
        return { success: false, error: 'API key not found' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            attachments
        });

        if (error) {
            console.error('Resend API error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email sending exception:', error);
        return { success: false, error };
    }
}
