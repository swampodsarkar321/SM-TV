# Firebase Realtime Database Schema (shared Android + Web + Admin)
channels/{channelId}: { name, logo, streamUrl|url, categoryId|category, categoryName, featured:boolean, enabled:boolean, description, keywords }
categories/{categoryId}: { name, icon? }
maintenance: { enabled:boolean, message:string }
notifications/{pushId}: { title, body|message, time, read:boolean, type }
users/{uid}/favorites: string[] | { [channelId]: true }
users/{uid}/history: WatchHistoryItem[]
users/{uid}/watchTime/{channelId}: { seconds:number, updatedAt:string }
