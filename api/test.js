// Temporary diagnostic endpoint — REMOVE BEFORE LAUNCH
module.exports = async function handler(req, res) {
  const url = process.env.SUPABASE_URL || 'MISSING';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING';

  const info = {
    url_length: url.length,
    url_prefix: url.slice(0, 35),
    key_length: key.length,
    key_prefix: key.slice(0, 12),
  };

  try {
    // Raw HTTP request — bypasses the JS client to see the real HTTP response
    const endpoint = `${url}/rest/v1/registrations?select=id&limit=1`;
    const rawRes = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    });
    const rawText = await rawRes.text();
    res.status(200).json({
      info,
      http_status: rawRes.status,
      http_status_text: rawRes.statusText,
      response_body: rawText.slice(0, 500),
    });
  } catch (e) {
    res.status(200).json({ info, thrown: e.message });
  }
};
