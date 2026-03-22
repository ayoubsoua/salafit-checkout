export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { amount } = req.body || {};
  const apiKey = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_COMPANY_ID;
  const response = await fetch('https://api.whop.com/api/v2/plans', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: companyId,
      product_id: 'prod_2ACpiZ0oa3Jhl',
      plan_type: 'one_time',
      initial_price: parseFloat(amount),
      currency: 'gbp',
      visibility: 'hidden',
    }),
  });
  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: 'Whop failed', detail: data });
  return res.status(200).json({ sessionId: data.id, secret: data.secret || '', purchaseUrl: data.purchase_url || '' });
}
