export type Channel = {
  id: string
  name: string
  logo: string
  streamUrl: string
  categoryId: string
  categoryName?: string
  featured: boolean
  enabled: boolean
  description?: string
  keywords?: string
}

export type Category = {
  id: string
  name: string
  icon?: string
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  type: 'channel' | 'maintenance' | 'announcement'
}

export type Maintenance = {
  enabled: boolean
  message: string
}

export type WatchHistoryItem = {
  channelId: string
  channelName: string
  logo: string
  watchedAt: string // ISO
  durationMinutes: number
  progressSeconds?: number
}
