'use server'

import { client } from "@/sanity/client";

// Note: Ensure your Sanity client has a write token for this to work in production
export async function registerVisitor(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Checkboxes
    const privacyAccepted = formData.get('privacyAccepted') === 'on';
    const liabilityAccepted = formData.get('liabilityAccepted') === 'on';
    const photoConsent = formData.get('photoConsent') === 'on';
    const newsletterSubscribed = formData.get('newsletterSubscribed') === 'on';

    if (!name || !email || !privacyAccepted || !liabilityAccepted) {
        return { error: 'Bitte akzeptieren Sie alle erforderlichen Bedingungen (*).' };
    }

    try {
        // Prepare document for Sanity
        const doc = {
            _type: 'visitor',
            name,
            email,
            privacyAccepted,
            liabilityAccepted,
            photoConsent,
            newsletterSubscribed,
            registrationDate: new Date().toISOString(),
        };

        // TODO: Enable this when write token is configured
        // await client.create(doc);

        console.log('Visitor registered (MOCKED SAVE):', doc);

        // TODO: Send confirmation email
        // await sendVisitorConfirmation(email, name);

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' };
    }
}
