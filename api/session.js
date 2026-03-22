export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { amount } = req.body || {};
  const apiKey = process.env.WHOP_API_KEY;
  const response = await fetch('https://api.whop.com/api/v2/checkout-sessions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan_id: 'plan_3GbhnONcpWhyh',
    }),
  });
  const data = await response.json();
  console.log('Whop response:', JSON.stringify(data));
  if (!response.ok) return res.status(500).json({ error: 'Whop failed', detail: data });
  return res.status(200).json({ sessionId: data.id, secret: data.sessionKey || data.secret || '', raw: data });
}
