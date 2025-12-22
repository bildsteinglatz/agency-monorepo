'use server'

import { client } from "@/sanity/client";

// Note: In a real app, you'd use a write token and a separate client for mutations
// For this demo, we'll assume the client is configured or we'll use a mock
export async function registerVisitor(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const dsvgoAccepted = formData.get('dsvgoAccepted') === 'on';
    const newsletterSubscribed = formData.get('newsletterSubscribed') === 'on';

    if (!name || !email || !dsvgoAccepted) {
        return { error: 'Bitte füllen Sie alle erforderlichen Felder aus.' };
    }

    try {
        // Create the visitor document in Sanity
        // In production, you MUST use a write token
        // await client.create({
        //     _type: 'visitor',
        //     name,
        //     email,
        //     address,
        //     dsvgoAccepted,
        //     newsletterSubscribed,
        //     emailSent: true, // Mocking email sent
        //     registrationDate: new Date().toISOString(),
        // });

        console.log('Visitor registered:', { name, email, address, dsvgoAccepted, newsletterSubscribed });

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' };
    }
}
