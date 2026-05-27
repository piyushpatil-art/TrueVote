const RELAYER_URL = process.env.REACT_APP_RELAYER_URL || '';
const RELAYER_KEY = process.env.REACT_APP_RELAYER_KEY || '';

async function post(endpoint, body) {
  const url = RELAYER_URL ? `${RELAYER_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}` : `/relayer/${endpoint.replace(/^\//, '')}`;
  const headers = { 'Content-Type': 'application/json' };
  if (RELAYER_KEY) headers['x-api-key'] = RELAYER_KEY;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Relayer request failed');
  }
  return res.json();
}

const relayer = { post };
export default relayer;
