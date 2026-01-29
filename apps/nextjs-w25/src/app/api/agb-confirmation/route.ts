import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { jsPDF } from 'jspdf';

export async function POST(req: NextRequest) {
  try {
    const { email, signedAt, ipAddress, version } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('AGB PROTOCOL CONFIRMATION', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Version: ${version}`, 20, 40);
    doc.text(`Signed By: ${email}`, 20, 50);
    doc.text(`Date/Time: ${signedAt}`, 20, 60);
    doc.text(`IP Address: ${ipAddress}`, 20, 70);
    
    doc.setFontSize(10);
    doc.text('This document serves as legal proof of your electronic signature and agreement', 20, 90);
    doc.text('to the General Terms and Conditions (AGB) of Studio W25.', 20, 100);
    
    // Add generic AGB text or reference
    doc.text('Full AGB text can be reviewed at: https://w25.at/agb', 20, 120);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // 2. Send email to User
    await sendEmail({
      to: email,
      subject: `[CONFIRMATION] AGB Protocol Signed - ${version}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #000; padding: 40px;">
          <h1 style="text-transform: uppercase; font-style: italic;">Protocol Authorized</h1>
          <p>This is an automated confirmation that you have electronically signed the AGB Protocol <strong>${version}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #000; margin: 20px 0;" />
          <p style="font-size: 12px; text-transform: uppercase; font-weight: bold;">Signature Metadata:</p>
          <ul style="font-size: 11px; list-style: none; padding: 0;">
            <li><strong>User:</strong> ${email}</li>
            <li><strong>Timestamp:</strong> ${signedAt}</li>
            <li><strong>IP Address:</strong> ${ipAddress}</li>
          </ul>
          <p style="font-size: 12px; margin-top: 30px;">A copy of your signed protocol is attached to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename: `AGB_Signature_${email.split('@')[0]}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // 3. Send notification to internal team (optional but requested: "to yourself and the user")
    // We can just add another 'to' or call again. 
    // I'll add an internal BCC or a second call.
    await sendEmail({
        to: 'protocol-logs@mail.w25.at', // Placeholder for "yourself"
        subject: `[LOG] AGB SIGNED: ${email}`,
        html: `<p>User ${email} signed AGB ${version} from IP ${ipAddress} at ${signedAt}.</p>`
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('AGB Confirmation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
