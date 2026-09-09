export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).send('POST only')

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return res.status(500).send('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env')

  const { title, text, url, image } = req.body || {}
  if (!title) return res.status(400).send('missing title')

  const message = `📺 <b>${title}</b>\n${text || ''}\n\n${url ? `▶ Watch Now: ${url}` : ''}\n\n<i>SM TV • Premium OTT</i>`

  try {
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      reply_markup: url ? { inline_keyboard: [[{ text: '▶ Watch Live', url }]] } : undefined
    }
    // if image, use sendPhoto
    let apiUrl = `https://api.telegram.org/bot${token}/sendMessage`
    let body = JSON.stringify(payload)
    if (image) {
      apiUrl = `https://api.telegram.org/bot${token}/sendPhoto`
      body = JSON.stringify({ chat_id: chatId, photo: image, caption: message, parse_mode: 'HTML', reply_markup: payload.reply_markup })
    }
    const r = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    const j = await r.json()
    if (!j.ok) return res.status(500).json(j)
    return res.status(200).json({ ok:true })
  } catch (e) {
    return res.status(500).send(String(e.message || e))
  }
}
