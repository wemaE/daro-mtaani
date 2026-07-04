import { VercelRequest, VercelResponse } from '@vercel/node';
import { guardianRoute } from '../../src/lib/agents/guardian';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secret = req.headers['x-n8n-shared-secret'];
  if (process.env.N8N_SHARED_SECRET && secret !== process.env.N8N_SHARED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { landmarkCode, requiredAssets } = req.body || {};

  if (!landmarkCode) {
    return res.status(400).json({ error: 'Missing landmarkCode' });
  }

  try {
    const result = await guardianRoute(landmarkCode, requiredAssets || []);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
