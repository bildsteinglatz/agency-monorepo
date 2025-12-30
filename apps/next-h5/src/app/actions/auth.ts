"use server";

import { getAdminAuth } from "@/lib/firebase-admin-sdk";
import { Resend } from "resend";

const resendKey = process.env.RESEND || process.env.RESEND_API_KEY;
const resend = new Resend(resendKey);

export async function sendLoginLink(email: string, redirectUrl: string) {
  try {
    const auth = getAdminAuth();
    
    const actionCodeSettings = {
      url: redirectUrl,
      handleCodeInApp: true,
    };

    const link = await auth.generateSignInWithEmailLink(email, actionCodeSettings);

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'Halle 5 <noreply@mail.halle5.at>',
      to: email,
      subject: 'Dein Login Link für Halle 5',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Willkommen bei Halle 5</h2>
          <p>Klicke auf den folgenden Button, um dich anzumelden:</p>
          <a href="${link}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Anmelden
          </a>
          <p style="color: #666; font-size: 14px;">
            Oder kopiere diesen Link in deinen Browser:<br>
            <a href="${link}" style="color: #666;">${link}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Dieser Link ist nur einmal gültig. Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Firebase Admin error:", error);
    return { success: false, error: error.message };
  }
}
