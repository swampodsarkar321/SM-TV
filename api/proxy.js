export default async function handler(req, res) {
  const url = req.query.url
  if (!url) return res.status(400).send('missing url')
  // allow only http/https
  if (!/^https?:\/\//.test(url)) return res.status(400).send('invalid url')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'SMTV/1.0' } })
    // copy content-type
    const ct = r.headers.get('content-type') || 'application/vnd.apple.mpegurl'
    res.setHeader('Content-Type', ct)
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Access-Control-Allow-Origin', '*')
    const buf = await r.arrayBuffer()
    return res.status(r.status).send(Buffer.from(buf))
  } catch (e) {
    return res.status(500).send(String(e.message || e))
  }
}
