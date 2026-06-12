import { VercelRequest, VercelResponse } from '@vercel/node';
import { guardianFilterAndRoute } from '../../src/lib/agents/guardian';

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

  const { hubs, dispatch_queue } = req.body || {};

  if (!hubs || !dispatch_queue) {
    return res.status(400).json({ error: 'Missing hubs or dispatch_queue array' });
  }

  const result = guardianFilterAndRoute(hubs, dispatch_queue);

  return res.status(200).json(result);
}
