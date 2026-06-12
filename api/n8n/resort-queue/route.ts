import { VercelRequest, VercelResponse } from '@vercel/node';
import { guardianResortQueue } from '../../../src/lib/agents/guardian';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { settlement } = req.body || {};

  if (!settlement) {
    return res.status(400).json({ error: 'Missing settlement' });
  }

  try {
    const queue = await guardianResortQueue(settlement);
    return res.status(200).json({ queue });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
