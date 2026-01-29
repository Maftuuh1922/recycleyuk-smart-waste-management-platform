export type UserRole = 'WARGA' | 'TPU' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'COLLECTING' | 'COMPLETED' | 'CANCELLED';
export type WasteType = 'ORGANIC' | 'NON_ORGANIC' | 'B3' | 'RESIDUE';
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
}
export interface Request {
  id: string;
  userId: string;
  collectorId?: string;
  status: RequestStatus;
  wasteType: WasteType;
  weightEstimate: number; // in kg
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}
export interface TrackingUpdate {
  requestId: string;
  collectorId: string;
  lat: number;
  lng: number;
  timestamp: number;
}
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}
// For existing template compatibility
export interface Chat { id: string; title: string; }
export interface ChatMessage { id: string; chatId: string; userId: string; text: string; ts: number; }