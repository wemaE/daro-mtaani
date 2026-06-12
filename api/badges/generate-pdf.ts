import { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument, rgb } from 'pdf-lib';
import { put } from '@vercel/blob';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { tutorName, badgeName, dateEarned } = req.body || {};

  if (!tutorName || !badgeName) {
    return res.status(400).json({ error: 'Missing tutorName or badgeName' });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    page.drawText('Certificate of Achievement', {
      x: 50,
      y: 300,
      size: 30,
      color: rgb(0, 0.3, 0.7)
    });

    page.drawText(`This is proudly presented to: ${tutorName}`, {
      x: 50,
      y: 200,
      size: 20
    });

    page.drawText(`For earning the badge: ${badgeName}`, {
      x: 50,
      y: 150,
      size: 16
    });

    page.drawText(`Date: ${dateEarned || new Date().toLocaleDateString()}`, {
      x: 50,
      y: 100,
      size: 12
    });

    const pdfBytes = await pdfDoc.save();

    const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
    const filename = `badges/cert-${Date.now()}.pdf`;

    const blobResult = await put(filename, Buffer.from(pdfBytes), {
      access: 'public',
      token
    });

    return res.status(200).json({ url: blobResult.url });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate PDF' });
  }
}
