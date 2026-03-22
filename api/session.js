export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount } = req.body || {};
  const apiKey = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_COMPANY_ID;

  try {
    // Create a checkout session using the correct Whop API
    const response = await fetch('https://api.whop.com/api/v2/checkout-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: 'plan_3GbhnONcpWhyh',
        amount_cents: Math.round(parseFloat(amount) * 100),
        currency: 'gbp',
      }),
    });

    const data = await response.json();
    console.log('Whop checkout-session response:', JSON.stringify(data));

    if (!response.ok) {
      // Fallback: return fixed plan ID so iframe still loads
      return res.status(200).json({
        sessionId: 'plan_3GbhnONcpWhyh',
        secret: '',
        fallback: true,
        whopError: data
      });
    }

    return res.status(200).json({
      sessionId: data.id || data.session_id || 'plan_3GbhnONcpWhyh',
      secret: data.session_key || data.sessionKey || data.secret || '',
      raw: data
    });

  } catch (err) {
    console.error('Error:', err);
    // Always return something so the iframe can still load
    return res.status(200).json({
      sessionId: 'plan_3GbhnONcpWhyh',
      secret: '',
      fallback: true
    });
  }
}
