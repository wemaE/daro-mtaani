import { VercelRequest, VercelResponse } from '@vercel/node';
import { hunterMatch } from '../../../src/lib/agents/hunter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { studentId, tutorId, elderApprovalPin, scheduledAt } = req.body || {};

  if (!studentId || !tutorId) {
    return res.status(400).json({ error: 'Missing studentId or tutorId' });
  }

  try {
    const result = await hunterMatch(studentId, tutorId, elderApprovalPin, scheduledAt);
    if (result.status === 'failed') {
      return res.status(400).json({ error: result.error });
    }
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
