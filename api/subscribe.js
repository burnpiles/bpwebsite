export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  // Beehiiv API credentials
  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUB_ID = process.env.BEEHIIV_PUB_ID || 'pub_52423244-f79b-4c0f-805b-a6e7757dd803';

  if (!API_KEY) {
    return res.status(500).json({ error: 'Beehiiv API key not configured' });
  }

  try {
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        utm_source: 'burnpiles.com',
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
