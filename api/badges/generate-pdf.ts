import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Shared secret validation
  const sharedSecret = process.env.N8N_SHARED_SECRET;
  const clientSecret = req.headers['x-n8n-secret'];
  if (sharedSecret && clientSecret !== sharedSecret) {
    return res.status(403).json({ error: 'Unauthorized shared secret' });
  }

  const { tutorName, badgeName, dateEarned } = req.body || {};

  if (!tutorName || !badgeName) {
    return res.status(400).json({ error: 'Missing tutorName or badgeName' });
  }

  // Emulate a PDF creation and base64 output
  const pdfMetadata = {
    title: `Certificate of Achievement: ${badgeName}`,
    recipient: tutorName,
    date: dateEarned || new Date().toISOString(),
    issuer: "Elders Council - DarasaMtaani",
    certId: `DM-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    fileBase64: "JVBERi0xLjQKJdPp9oQ...[emulated pdf content base64]...=="
  };

  return res.status(200).json(pdfMetadata);
}
