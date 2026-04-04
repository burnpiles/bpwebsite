export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPA_URL = 'https://ylpfupjilqfxfattwikx.supabase.co';
  const SUPA_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPA_KEY) {
    return res.status(500).json({ error: 'Supabase key not configured' });
  }

  const { action, table, data, query } = req.body || {};
  if (!table || !action) {
    return res.status(400).json({ error: 'Missing table or action' });
  }

  // Only allow projects and settings tables
  if (!['projects', 'settings'].includes(table)) {
    return res.status(403).json({ error: 'Table not allowed' });
  }

  const headers = {
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    let url, method, body;

    if (action === 'upsert') {
      url = `${SUPA_URL}/rest/v1/${table}`;
      method = 'POST';
      headers['Prefer'] = 'return=representation,resolution=merge-duplicates';
      body = JSON.stringify(data);
    } else if (action === 'update') {
      url = `${SUPA_URL}/rest/v1/${table}?${query}`;
      method = 'PATCH';
      headers['Prefer'] = 'return=representation';
      body = JSON.stringify(data);
    } else if (action === 'delete') {
      url = `${SUPA_URL}/rest/v1/${table}?${query}`;
      method = 'DELETE';
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, { method, headers, body });

    if (response.ok) {
      const result = await response.text();
      return res.status(200).json({ success: true, data: result });
    } else {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
