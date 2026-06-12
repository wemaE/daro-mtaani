import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    time_poverty_score,
    material_deficit_score,
    time_poverty,
    material_deficit
  } = req.body || {};

  const tp = time_poverty_score !== undefined ? time_poverty_score : time_poverty;
  const md = material_deficit_score !== undefined ? material_deficit_score : material_deficit;

  if (tp === undefined || md === undefined) {
    return res.status(400).json({ error: 'Missing time_poverty_score or material_deficit_score' });
  }

  const score = (Number(tp) * 0.5 + Number(md) * 0.5) * 10;

  return res.status(200).json({
    ups: score,
    ups_score: score,
    priority_tier: score >= 8.0 ? 'Critical' : score >= 6.0 ? 'High' : score >= 3.0 ? 'Medium' : 'Low'
  });
}
