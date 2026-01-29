import type { User, Request, Chat, ChatMessage, TrackingUpdate } from './types';
export const MOCK_USERS: User[] = [
  { id: 'warga-1', name: 'Budi Santoso', role: 'WARGA', address: 'Blok A No. 12, RW 04' },
  { id: 'warga-2', name: 'Siti Aminah', role: 'WARGA', address: 'Blok C No. 05, RW 04' },
  { id: 'tpu-1', name: 'Anto Wijaya', role: 'TPU', phone: '08123456789' },
  { id: 'admin-1', name: 'Pak RW 04', role: 'ADMIN' }
];
export const MOCK_REQUESTS: Request[] = [
  {
    id: 'req-1',
    userId: 'warga-1',
    status: 'PENDING',
    wasteType: 'ORGANIC',
    weightEstimate: 2.5,
    location: { lat: -6.2247, lng: 106.8077, address: 'Blok A No. 12, RW 04' },
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
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
  }
];
export const MOCK_TRACKING_UPDATES: TrackingUpdate[] = [
  {
    id: 'tr-1',
    requestId: 'req-2',
    collectorId: 'tpu-1',
    lat: -6.2210,
    lng: 106.8090,
    timestamp: Date.now() - 300000,
  }
];
export const MOCK_CHATS: Chat[] = [{ id: 'c1', title: 'RW 04 Group' }];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'warga-1', text: 'Kapan jadwal sampah plastik minggu ini?', ts: Date.now() },
];