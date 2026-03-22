export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { amount } = req.body;

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const response = await fetch('https://api.whop.com/v5/checkout-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line_items: [{
          amount: Math.round(parseFloat(amount) * 100), // pence
          currency: 'gbp',
          name: 'SALAFIT Order',
          quantity: 1,
        }],
        company_id: process.env.WHOP_COMPANY_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Whop error:', data);
      return res.status(500).json({ error: 'Whop API error', detail: data });
    }

    return res.status(200).json({
      sessionId: data.id,
      secret: data.secret,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
