
// import { Resend } from 'resend';

// MOCK implementations to prevent build crash while 'resend' is not installed
// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string; }) {
    console.warn('Resend module not installed. Email sending skipped.');
    return { success: false, error: 'Module not found' };
}

export async function sendMembershipConfirmation(name: string, email: string, type: string) {
    return sendEmail({ to: email, subject: 'Mock Subject', html: 'Mock Body' });
}

export async function sendAdminNotification(name: string, email: string, type: string, message: string, price: string) {
    return sendEmail({ to: 'mock@example.com', subject: 'Mock Admin', html: 'Mock Body' });
}
