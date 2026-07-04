import { VercelRequest, VercelResponse } from '@vercel/node';
import { scoutMatch } from '../../../src/lib/agents/scout';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secret = req.headers['x-n8n-shared-secret'];
  if (process.env.N8N_SHARED_SECRET && secret !== process.env.N8N_SHARED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { householdId, cbcStrand } = req.body || {};

  if (!householdId || !cbcStrand) {
    return res.status(400).json({ error: 'Missing householdId or cbcStrand' });
  }

  try {
    const result = await scoutMatch(householdId, cbcStrand);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
