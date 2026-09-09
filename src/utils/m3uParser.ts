import type { Channel } from '../types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || `ch-${Math.random().toString(36).slice(2,7)}`
}

export function parseM3U(text: string): Channel[] {
  const lines = text.split(/\r?\n/)
  const channels: Channel[] = []
  let pending: Partial<Channel> & { attrs: Record<string,string> } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    if (line.startsWith('#EXTINF')) {
      // #EXTINF:-1 tvg-id="..." tvg-logo="..." group-title="Sports",Channel Name
      const comma = line.lastIndexOf(',')
      const name = comma >= 0 ? line.slice(comma + 1).trim() : `Channel ${channels.length + 1}`
      const attrPart = comma >= 0 ? line.slice(0, comma) : line
      const attrs: Record<string,string> = {}
      const re = /(\S+?)="(.*?)"/g
      let m: RegExpExecArray | null
      while ((m = re.exec(attrPart))) attrs[m[1]] = m[2]
      const logo = attrs['tvg-logo'] || attrs['tvgLogo'] || ''
      const group = attrs['group-title'] || attrs['groupTitle'] || 'All'
      const tvgId = attrs['tvg-id'] || ''
      pending = {
        attrs,
        name: name || tvgId || `Channel ${channels.length + 1}`,
        logo,
        categoryId: slugify(group),
        categoryName: group,
        featured: false,
        enabled: true,
        description: group
      }
    } else if (line.startsWith('#')) {
      continue
    } else if (pending && /^https?:\/\//.test(line)) {
      const id = pending.attrs['tvg-id'] ? slugify(pending.attrs['tvg-id']) : slugify(pending.name || line)
      // ensure unique
      let uid = id
      let c = 1
      while (channels.some(x => x.id === uid)) uid = `${id}-${c++}`
      let stream = line.trim()
      // keep original http; VideoPlayer will proxy via /api/proxy if needed (Mixed Content fix)
      channels.push({
        id: uid,
        name: pending.name || uid,
        logo: pending.logo || '',
        streamUrl: stream,
        categoryId: pending.categoryId || 'all',
        categoryName: pending.categoryName || 'All',
        featured: false,
        enabled: true,
        description: pending.description || '',
        keywords: `${pending.categoryName || ''} ${pending.name || ''}`
      })
      pending = null
    }
  }
  return channels
}

export const M3U_URL = 'https://go.skym3u.dev/ow52.m3u?t=3061&s=d87'
export const M3U_PROXY_PATH = '/__m3u/ow52.m3u'

export async function fetchM3U(url = M3U_URL): Promise<Channel[]> {
  const candidates = [
    // vercel api route (always works, CORS added)
    `/api/m3u`,
    `${M3U_PROXY_PATH}?t=3061&s=d87`,
    url,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ]
  let lastErr: any = null
  for (const u of candidates) {
    try {
      const res = await fetch(u, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (!text.includes('#EXTM3U') && !text.includes('#EXTINF')) throw new Error('Not a valid M3U')
      return parseM3U(text)
    } catch (e) {
      lastErr = e
      continue
    }
  }
  throw lastErr || new Error('Failed to fetch M3U')
}
