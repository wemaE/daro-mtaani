import { VercelRequest, VercelResponse } from '@vercel/node';
import { hunterFinalizeMatch } from '../../src/lib/agents/hunter';

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

  const { tutorLandmark, studentLandmark, hubLandmark, elderApprovalPin, scheduledAt } = req.body || {};

  if (!tutorLandmark || !studentLandmark || !hubLandmark) {
    return res.status(400).json({ error: 'Missing landmark parameters' });
  }

  const result = hunterFinalizeMatch({
    tutorLandmark,
    studentLandmark,
    hubLandmark,
    elderApprovalPin,
    scheduledAt
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json(result.payload);
}
