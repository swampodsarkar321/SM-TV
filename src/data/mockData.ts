import type { Category, Channel, NotificationItem, Maintenance } from '../types'

export const mockCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'news', name: 'News' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'music', name: 'Music' },
  { id: 'kids', name: 'Kids' },
  { id: 'movies', name: 'Movies' },
  { id: 'international', name: 'International' },
]

export const mockChannels: Channel[] = [
  { id: 't-sports', name: 'T Sports', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'sports', categoryName: 'Sports', featured: true, enabled: true, description: 'Bangladesh premier sports channel — live cricket, football and more.' },
  { id: 'news24', name: 'News 24', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'news', categoryName: 'News', featured: true, enabled: true, description: '24/7 news coverage.' },
  { id: 'channel-i', name: 'Channel i', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'entertainment', categoryName: 'Entertainment', featured: false, enabled: true },
  { id: 'gtv', name: 'Gazi TV', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'sports', categoryName: 'Sports', featured: false, enabled: true },
  { id: 'somoy', name: 'Somoy TV', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'news', categoryName: 'News', featured: false, enabled: true },
  { id: 'atn-bangla', name: 'ATN Bangla', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'entertainment', categoryName: 'Entertainment', featured: true, enabled: true },
  { id: 'discovery-kids', name: 'Discovery Kids', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'kids', categoryName: 'Kids', featured: false, enabled: true },
  { id: '9xm', name: '9XM Music', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'music', categoryName: 'Music', featured: false, enabled: true },
  { id: 'star-movies', name: 'Star Movies', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'movies', categoryName: 'Movies', featured: false, enabled: true },
  { id: 'bbc-world', name: 'BBC World', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', categoryId: 'international', categoryName: 'International', featured: false, enabled: true },
  { id: 'disabled-demo', name: 'Disabled Channel', logo: 'https://cdn-icons-png.flaticon.com/512/138/138817.png', streamUrl: '', categoryId: 'news', categoryName: 'News', featured: false, enabled: false },
]

export const mockNotifications: NotificationItem[] = [
  { id: '1', title: 'New Channel Added', body: 'A new Sports channel T Sports is now available.', time: new Date().toISOString(), read: false, type: 'channel' },
  { id: '2', title: 'Maintenance Notice', body: 'Scheduled maintenance tonight 2AM - 4AM.', time: new Date(Date.now()-86400000).toISOString(), read: false, type: 'maintenance' },
  { id: '3', title: 'Announcement', body: 'New channels have been added. Explore now!', time: new Date(Date.now()-172800000).toISOString(), read: true, type: 'announcement' },
]

export const mockMaintenance: Maintenance = { enabled: false, message: "We're making some improvements. Please check back shortly." }
