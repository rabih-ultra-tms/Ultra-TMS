/**
 * Socket.io client configuration
 * Namespace URLs, reconnection settings, and typed event definitions
 */

import type { ManagerOptions, SocketOptions } from 'socket.io-client';

// WebSocket server URL
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

// Socket.io namespaces
export const SOCKET_NAMESPACES = {
  EVENTS: '/events',
  DISPATCH: '/dispatch',
  TRACKING: '/tracking',
  NOTIFICATIONS: '/notifications',
} as const;

// Connection configuration
export const SOCKET_CONFIG: Partial<ManagerOptions & SocketOptions> = {
  transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: false, // Manual connection control
};

// Load event types
export interface LoadStatusChangedEvent {
  loadId: string;
  loadNumber: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
}

export interface LoadLocationUpdatedEvent {
  loadId: string;
  loadNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  eta?: string;
  speed?: number;
}

export interface LoadDispatchedEvent {
  loadId: string;
  loadNumber: string;
  carrierId: string;
  carrierName: string;
  driverId?: string;
  driverName?: string;
}

export interface LoadCreatedEvent {
  loadId: string;
  loadNumber: string;
  orderId: string;
  status: string;
}

export interface LoadDeliveredEvent {
  loadId: string;
  loadNumber: string;
  deliveredAt: string;
  podUrl?: string;
}

// Order event types
export interface OrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  customerId: string;
  status: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
}

// Check call event types
export interface CheckCallReceivedEvent {
  loadId: string;
  loadNumber: string;
  location: string;
  notes: string;
  eta?: string;
  receivedAt: string;
}

// Notification event types
export interface NotificationEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  link?: string;
  userId?: string;
}

// Carrier event types
export interface CarrierCreatedEvent {
  carrierId: string;
  carrierName: string;
  mcNumber?: string;
}

export interface CarrierUpdatedEvent {
  carrierId: string;
  carrierName: string;
  changes: Record<string, unknown>;
}

export interface CarrierComplianceAlertEvent {
  carrierId: string;
  carrierName: string;
  alertType: 'insurance_expired' | 'authority_revoked' | 'safety_rating_changed';
  message: string;
}

// System event types
export interface SystemMaintenanceEvent {
  message: string;
  scheduledAt?: string;
  duration?: string;
}

export interface SystemAnnouncementEvent {
  title: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
}

// Event names (colon-separated namespace convention)
export const SOCKET_EVENTS = {
  // Load events
  LOAD_CREATED: 'load:created',
  LOAD_UPDATED: 'load:updated',
  LOAD_STATUS_CHANGED: 'load:status:changed',
  LOAD_DISPATCHED: 'load:dispatched',
  LOAD_LOCATION_UPDATED: 'load:location:updated',
  LOAD_DELIVERED: 'load:delivered',
  LOAD_ETA_UPDATED: 'load:eta:updated',

  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status:changed',

  // Check call events
  CHECKCALL_RECEIVED: 'checkcall:received',

  // Carrier events
  CARRIER_CREATED: 'carrier:created',
  CARRIER_UPDATED: 'carrier:updated',
  CARRIER_COMPLIANCE_ALERT: 'carrier:compliance:alert',
  CARRIER_LOAD_ASSIGNED: 'carrier:load:assigned',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_ANNOUNCEMENT: 'system:announcement',

  // Room join/leave events
  JOIN_LOAD: 'join:load',
  LEAVE_LOAD: 'leave:load',
} as const;

// Type for all event names
export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

// Connection status types
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';
