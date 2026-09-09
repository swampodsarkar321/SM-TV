export default async function handler(req, res) {
  const target = 'https://go.skym3u.dev/ow52.m3u?t=3061&s=d87'
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  try {
    const r = await fetch(target, { headers: { 'User-Agent': 'SMTV/1.0' } })
    if (!r.ok) return res.status(r.status).send('upstream ' + r.status)
    const text = await r.text()
    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(text)
  } catch (e) {
    return res.status(500).send(String(e.message || e))
  }
}
