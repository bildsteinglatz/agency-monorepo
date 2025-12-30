import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { Resend } from 'resend'
import { jsPDF } from 'jspdf'
import { uploadReceipt } from '@/lib/dropbox'

// --- Configuration ---
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // Needs write access
  useCdn: false,
})

const resend = new Resend(process.env.RESEND)

// --- Helper: Generate PDF ---
function generateReceiptPDF(doc: any): Buffer {
  // eslint-disable-next-line new-cap
  const docPDF = new jsPDF()
  
  // Header
  docPDF.setFontSize(20)
  docPDF.text('Halle 5 Verein - Receipt', 20, 20)
  
  docPDF.setFontSize(12)
  docPDF.text(`Receipt #: ${doc.receiptNumber}`, 20, 30)
  docPDF.text(`Date: ${doc.date}`, 20, 36)
  
  // Recipient
  docPDF.text('To:', 20, 50)
  docPDF.text(doc.recipient?.name || '', 20, 56)
  docPDF.text(doc.recipient?.address || '', 20, 62)
  
  // Items Table Header
  let y = 80
  docPDF.setFont('helvetica', 'bold')
  docPDF.text('Description', 20, y)
  docPDF.text('Amount', 140, y, { align: 'right' })
  docPDF.text('Tax', 170, y, { align: 'right' })
  docPDF.line(20, y + 2, 190, y + 2)
  
  // Items
  y += 10
  docPDF.setFont('helvetica', 'normal')
  let total = 0
  
  doc.items?.forEach((item: any) => {
    docPDF.text(item.description || '', 20, y)
    docPDF.text(`€${item.amount?.toFixed(2)}`, 140, y, { align: 'right' })
    docPDF.text(`${item.taxRate}%`, 170, y, { align: 'right' })
    total += item.amount || 0
    y += 8
  })
  
  // Total
  y += 5
  docPDF.line(20, y, 190, y)
  y += 10
  docPDF.setFont('helvetica', 'bold')
  docPDF.text('Total:', 110, y)
  docPDF.text(`€${total.toFixed(2)}`, 140, y, { align: 'right' })
  
  // Footer
  if (doc.notes) {
    y += 20
    docPDF.setFont('helvetica', 'italic')
    docPDF.setFontSize(10)
    docPDF.text(doc.notes, 20, y)
  }
  
  // Return as Buffer
  return Buffer.from(docPDF.output('arraybuffer'))
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json()
    
    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 1. Fetch Data
    const doc = await client.fetch(`*[_type == "accountingReceipt" && _id == $id][0]`, { id: documentId })
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { 
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }
    
    if (doc.status === 'processed') {
      return NextResponse.json({ error: 'Receipt already processed' }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 2. Generate PDF
    const pdfBuffer = generateReceiptPDF(doc)
    const filename = `Receipt_${doc.receiptNumber}_${doc.date}.pdf`

    // 3. Upload to Dropbox (uses refresh token flow via getAccessToken)
    let dropboxPath = ''
    try {
      const uploadRes = await uploadReceipt(pdfBuffer, filename)
      dropboxPath = uploadRes?.path_display || ''
    } catch (err: any) {
      console.error('Dropbox upload failed:', err)
      return NextResponse.json({ error: `Dropbox Error: ${err.message}` }, { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 4. Send Email via Resend
    if (doc.recipient?.email) {
      await resend.emails.send({
        from: 'Halle 5 Accounting <accounting@halle5.at>',
        to: doc.recipient.email,
        subject: `Receipt #${doc.receiptNumber} from Halle 5`,
        html: `<p>Dear ${doc.recipient.name},</p><p>Please find your receipt attached.</p><p>Best regards,<br>Halle 5 Team</p>`,
        attachments: [
          {
            filename: filename,
            content: pdfBuffer,
          },
        ],
      })
    }

    // 5. Update Sanity Document
    await client
      .patch(documentId)
      .set({
        status: 'processed',
        dropboxPath: dropboxPath
      })
      .commit()

    return NextResponse.json({ success: true, dropboxPath }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error: any) {
    console.error('Processing Error:', error)
    return NextResponse.json({ error: error.message }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}
