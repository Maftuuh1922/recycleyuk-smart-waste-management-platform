import type { User, Request, Chat, ChatMessage } from './types';
export const MOCK_USERS: User[] = [
  { id: 'warga-1', name: 'Budi Santoso', role: 'WARGA', address: 'Blok A No. 12, RW 04', isOnline: false },
  { id: 'warga-2', name: 'Siti Aminah', role: 'WARGA', address: 'Blok C No. 05, RW 04', isOnline: false },
  { id: 'tpu-1', name: 'Anto Wijaya', role: 'TPU', phone: '08123456789', isOnline: true },
  { id: 'admin-1', name: 'Pak RW 04', role: 'ADMIN', isOnline: true }
];
export const MOCK_REQUESTS: Request[] = [
  {
    id: 'req-1',
    userId: 'warga-1',
    status: 'PENDING',
    wasteType: 'ORGANIC',
    weightEstimate: 2.5,
    location: { lat: -6.2247, lng: 106.8077, address: 'Blok A No. 12, RW 04' },
    photos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=300&q=80'],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'req-2',
    userId: 'warga-2',
    collectorId: 'tpu-1',
    status: 'ON_THE_WAY',
    wasteType: 'NON_ORGANIC',
    weightEstimate: 5.0,
    location: { lat: -6.2230, lng: 106.8100, address: 'Blok C No. 05, RW 04' },
    photos: ['https://images.unsplash.com/photo-1605600611270-132d55ce0161?auto=format&fit=crop&w=300&q=80'],
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
    estimatedArrival: new Date(Date.now() + 1800000).toISOString()
  }
];
export const MOCK_CHATS: Chat[] = [{ id: 'c1', title: 'RW 04 Group' }];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'warga-1', text: 'Kapan jadwal sampah plastik minggu ini?', ts: Date.now() },
];