import { Resend } from 'resend';

const resend = process.env.RESEND ? new Resend(process.env.RESEND) : null;

export async function sendEmail({ to, subject, html, from = 'halle 5 <hello@mail.halle5.at>' }: { to: string | string[]; subject: string; html: string; from?: string }) {
    if (!resend) {
        console.warn('RESEND API key not found. Email sending skipped.');
        return { success: false, error: 'API key not found' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}

export async function sendMembershipConfirmation(name: string, email: string, type: string) {
    const subject = `Willkommen bei halle 5 – Deine Mitgliedschaft: ${type}`;
    const html = `
        <div style="font-family: sans-serif; line-height: 1.5; color: #000;">
            <h1 style="text-transform: uppercase; font-weight: 900;">Willkommen in der halle 5, ${name}!</h1>
            <p>Vielen Dank für dein Interesse an einer Mitgliedschaft in der Kategorie <strong>${type}</strong>.</p>
            <p>Wir haben deine Anfrage erhalten und werden uns in Kürze bei dir melden, um die nächsten Schritte zu besprechen.</p>
            <br />
            <p>Beste Grüße,</p>
            <p><strong>Matthias Bildstein</strong><br />halle 5</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Spinnergasse 1, 6850 Dornbirn, Österreich</p>
        </div>
    `;

    return sendEmail({ to: email, subject, html });
}

export async function sendAdminNotification(name: string, email: string, type: string, message: string, price: string) {
    const subject = `NEUE MITGLIEDSCHAFTS-ANFRAGE: ${name} (${type})`;
    const html = `
        <div style="font-family: sans-serif; line-height: 1.5; color: #000;">
            <h1 style="text-transform: uppercase; font-weight: 900;">Neue Anfrage</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Kategorie:</strong> ${type}</p>
            <p><strong>Preis/Label:</strong> ${price}</p>
            <p><strong>Nachricht:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #000;">
                ${message.replace(/\n/g, '<br />')}
            </div>
            <br />
            <p>Diese Anfrage wurde automatisch über die Website halle5.at erstellt.</p>
        </div>
    `;

    // Send to Matthias
    return sendEmail({ to: 'matthias@halle5.at', subject, html });
}
export async function sendWorkshopConfirmation(name: string, email: string, workshopTitle: string, workshopDate: string) {
    const subject = `Bestätigung deiner Anmeldung: ${workshopTitle} – halle 5`;
    const html = `
        <div style="font-family: sans-serif; line-height: 1.5; color: #000;">
            <h1 style="text-transform: uppercase; font-weight: 900;">Hallo ${name},</h1>
            <p>vielen Dank für deine Anmeldung zum Workshop <strong>${workshopTitle}</strong> bei halle 5.</p>
            ${workshopDate ? `<p><strong>Datum:</strong> ${workshopDate}</p>` : ''}
            <p>Wir haben deine Daten erhalten und freuen uns sehr, dich bald bei uns im Atelier begrüßen zu dürfen.</p>
            <p>In Kürze erhältst du eine weitere E-Mail mit allen Details zum Ablauf.</p>
            <br />
            <p>Beste Grüße,</p>
            <p><strong>Matthias Bildstein</strong><br />halle 5</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Spinnergasse 1, 6850 Dornbirn, Österreich</p>
        </div>
    `;

    return sendEmail({ to: email, subject, html });
}

export async function sendWorkshopAdminNotification(name: string, email: string, workshopTitle: string, workshopDate: string, message: string, price: string) {
    const subject = `NEUE WORKSHOP-ANMELDUNG: ${workshopTitle} (${name})`;
    const html = `
        <div style="font-family: sans-serif; line-height: 1.5; color: #000;">
            <h1 style="text-transform: uppercase; font-weight: 900;">Neue Workshop-Anmeldung</h1>
            <p><strong>Workshop:</strong> ${workshopTitle}</p>
            ${workshopDate ? `<p><strong>Datum:</strong> ${workshopDate}</p>` : ''}
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Preis:</strong> ${price || 'N/A'}</p>
            <p><strong>Nachricht:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #000;">
                ${message ? message.replace(/\n/g, '<br />') : 'Keine Nachricht'}
            </div>
            <br />
            <p>Diese Anmeldung wurde automatisch über die Website halle5.at erstellt.</p>
        </div>
    `;

    return sendEmail({ to: 'matthias@halle5.at', subject, html });
}
export async function sendVisitorConfirmation(email: string, name: string) {
    const subject = 'Bestätigung deiner Registrierung – halle 5';
    const html = `
        <div style="font-family: sans-serif; line-height: 1.5; color: #000;">
            <h1 style="text-transform: uppercase; font-weight: 900;">Hallo ${name},</h1>
            <p>vielen Dank für deine Registrierung bei halle 5.</p>
            <p>Wir haben deine Daten erfolgreich erhalten. Dies dient der Dokumentation für unsere Workshops und Atelierbesuche.</p>
            <br />
            <p>Wir freuen uns auf deinen Besuch!</p>
            <br />
            <p>Beste Grüße,</p>
            <p><strong>Matthias Bildstein</strong><br />halle 5</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Spinnergasse 1, 6850 Dornbirn, Österreich</p>
        </div>
    `;

    return sendEmail({ to: email, subject, html });
}
