/**
 * Socket.io client infrastructure
 * Centralized exports for WebSocket functionality
 */

export { SocketProvider, useSocket } from './socket-provider';
export { useSocketEvent, useSocketEvents, useSocketEmit, useSocketRoom } from './use-socket-event';
export { useSocketStatus, useIsRealtime } from './use-socket-status';
export {
  SOCKET_EVENTS,
  SOCKET_NAMESPACES,
  type SocketEventName,
  type ConnectionStatus,
  type LoadStatusChangedEvent,
  type LoadLocationUpdatedEvent,
  type LoadDispatchedEvent,
  type LoadCreatedEvent,
  type LoadDeliveredEvent,
  type OrderCreatedEvent,
  type OrderStatusChangedEvent,
  type CheckCallReceivedEvent,
  type NotificationEvent,
  type CarrierCreatedEvent,
  type CarrierUpdatedEvent,
  type CarrierComplianceAlertEvent,
  type SystemMaintenanceEvent,
  type SystemAnnouncementEvent,
} from './socket-config';
