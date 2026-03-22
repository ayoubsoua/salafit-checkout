export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount } = req.body || {};

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount: ' + amount });
  }

  const apiKey = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_COMPANY_ID;

  if (!apiKey || !companyId) {
    return res.status(500).json({ error: 'Missing env vars', hasKey: !!apiKey, hasCompany: !!companyId });
  }

  try {
    // Create a one-time plan with exact amount
    const response = await fetch('https://api.whop.com/api/v2/plans', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: companyId,
        plan_type: 'one_time',
        initial_price: parseFloat(amount),
        currency: 'gbp',
        visibility: 'hidden',
      }),
    });

    const data = await response.json();
    console.log('Whop response:', JSON.stringify(data));

    if (!response.ok) {
      return res.status(500).json({ error: 'Whop API failed', status: response.status, detail: data });
    }

    // The purchase_url contains the session ID we need
    const purchaseUrl = data.purchase_url || '';
    const sessionId = data.id || purchaseUrl.split('/').filter(Boolean).pop();

    return res.status(200).json({
      sessionId: sessionId,
      secret: data.secret || '',
      purchaseUrl: purchaseUrl,
      raw: data,
    });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
