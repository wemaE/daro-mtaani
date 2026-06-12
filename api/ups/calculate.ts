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

  const { time_poverty, material_deficit } = req.body || {};

  if (time_poverty === undefined || material_deficit === undefined) {
    return res.status(400).json({ error: 'Missing time_poverty or material_deficit' });
  }

  const score = (Number(time_poverty) * 0.5 + Number(material_deficit) * 0.5) * 10;

  return res.status(200).json({
    ups_score: score,
    priority_tier: score >= 8.0 ? 'Critical' : score >= 6.0 ? 'High' : score >= 3.0 ? 'Medium' : 'Low'
  });
}
