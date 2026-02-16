/**
 * Dispatch Board Types
 *
 * Type definitions for the Dispatch Board data layer.
 * Supports real-time updates, multi-user state management, and optimistic UI.
 */

export type LoadStatus =
  | 'PLANNING'
  | 'PENDING'
  | 'TENDERED'
  | 'ACCEPTED'
  | 'DISPATCHED'
  | 'AT_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AT_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type EquipmentType = 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'STEP_DECK' | 'OTHER';

export type LoadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Kanban lane grouping - maps multiple statuses to display lanes
 */
export type KanbanLane =
  | 'UNASSIGNED'
  | 'TENDERED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED';

/**
 * Maps load status to its Kanban lane
 */
export const STATUS_TO_LANE: Record<LoadStatus, KanbanLane> = {
  PLANNING: 'UNASSIGNED',
  PENDING: 'UNASSIGNED',
  TENDERED: 'TENDERED',
  ACCEPTED: 'DISPATCHED',
  DISPATCHED: 'DISPATCHED',
  AT_PICKUP: 'IN_TRANSIT',
  PICKED_UP: 'IN_TRANSIT',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_DELIVERY: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'COMPLETED',
};

/**
 * Lane display configuration
 */
export interface LaneConfig {
  lane: KanbanLane;
  label: string;
  color: string;
  statuses: LoadStatus[];
}

export const LANE_CONFIG: Record<KanbanLane, LaneConfig> = {
  UNASSIGNED: {
    lane: 'UNASSIGNED',
    label: 'Unassigned',
    color: '#6B7280',
    statuses: ['PLANNING', 'PENDING'],
  },
  TENDERED: {
    lane: 'TENDERED',
    label: 'Tendered',
    color: '#8B5CF6',
    statuses: ['TENDERED'],
  },
  DISPATCHED: {
    lane: 'DISPATCHED',
    label: 'Dispatched',
    color: '#6366F1',
    statuses: ['ACCEPTED', 'DISPATCHED'],
  },
  IN_TRANSIT: {
    lane: 'IN_TRANSIT',
    label: 'In Transit',
    color: '#0EA5E9',
    statuses: ['AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'AT_DELIVERY'],
  },
  DELIVERED: {
    lane: 'DELIVERED',
    label: 'Delivered',
    color: '#84CC16',
    statuses: ['DELIVERED'],
  },
  COMPLETED: {
    lane: 'COMPLETED',
    label: 'Completed',
    color: '#10B981',
    statuses: ['COMPLETED', 'CANCELLED'],
  },
};

/**
 * Stop information for origin/destination display
 */
export interface DispatchStop {
  id: number;
  type: 'PICKUP' | 'DELIVERY';
  city: string;
  state: string;
  appointmentDate: string;
  status: 'PENDING' | 'ARRIVED' | 'DEPARTED' | 'COMPLETED';
}

/**
 * Carrier information for card display
 */
export interface DispatchCarrier {
  id: number;
  name: string;
  mcNumber?: string;
}

/**
 * Driver information for card display
 */
export interface DispatchDriver {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Customer information for card display
 */
export interface DispatchCustomer {
  id: number;
  name: string;
}

/**
 * Load card data for dispatch board
 */
export interface DispatchLoad {
  id: number;
  loadNumber: string;
  status: LoadStatus;
  equipmentType: EquipmentType;
  priority?: LoadPriority;
  isHotLoad: boolean;
  hasExceptions: boolean;

  // Related entities
  customer: DispatchCustomer;
  carrier?: DispatchCarrier;
  driver?: DispatchDriver;
  stops: DispatchStop[];

  // Financial (permission-gated)
  customerRate?: number;
  carrierRate?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  tenderedAt?: string;
  lastCheckCallAt?: string;

  // Metadata
  distance?: number;
  weight?: number;
  commodity?: string;
  specialInstructions?: string;
  referenceNumbers?: string[];

  // Assignment
  assignedDispatcherId?: number;
}

/**
 * Computed fields for display
 */
export interface ComputedLoadFields {
  margin: number;
  marginPercent: number;
  loadAge: number;
  timeToPickup?: number;
  checkCallFreshness?: number;
  tenderTimeRemaining?: number;
  route: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: string;
  deliveryDate: string;
}

/**
 * Filter options for dispatch board
 */
export interface DispatchFilters {
  dateFrom?: string;
  dateTo?: string;
  statuses?: LoadStatus[];
  equipmentTypes?: EquipmentType[];
  carrierId?: number;
  customerId?: number;
  originState?: string[];
  destState?: string[];
  dispatcherId?: number;
  priorities?: LoadPriority[];
  search?: string;
}

/**
 * Sort options for lanes
 */
export type SortField = 'pickupDate' | 'loadAge' | 'margin' | 'customerRate' | 'customerName';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

/**
 * Board statistics for KPI strip
 */
export interface DispatchBoardStats {
  unassigned: number;
  tendered: number;
  dispatched: number;
  inTransit: number;
  atStop: number;
  deliveredToday: number;
  totalActive: number;
  atRisk: number;
}

/**
 * Grouped loads by lane
 */
export interface DispatchBoardData {
  loads: DispatchLoad[];
  loadsByLane: Record<KanbanLane, DispatchLoad[]>;
  stats: DispatchBoardStats;
}

/**
 * WebSocket event payloads
 */
export interface LoadCreatedEvent {
  loadId: number;
  orderId?: number;
  status: LoadStatus;
  origin: string;
  destination: string;
  pickupDate: string;
  customerId: number;
  equipmentType: EquipmentType;
}

export interface LoadStatusChangedEvent {
  loadId: number;
  previousStatus: LoadStatus;
  newStatus: LoadStatus;
  changedBy: number;
  changedByName?: string;
  timestamp: string;
}

export interface LoadAssignedEvent {
  loadId: number;
  carrierId: number;
  carrierName: string;
  driverId?: number;
  driverName?: string;
}

export interface LoadDispatchedEvent {
  loadId: number;
  carrierId: number;
  carrierName: string;
  dispatchedBy: number;
  timestamp: string;
}

export interface LoadLocationUpdatedEvent {
  loadId: number;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface LoadEtaUpdatedEvent {
  loadId: number;
  stopId: number;
  previousEta: string;
  newEta: string;
  reason?: string;
}

export interface CheckCallReceivedEvent {
  loadId: number;
  checkCallId: number;
  type: string;
  location?: string;
  notes?: string;
  timestamp: string;
}

export interface LoadUpdatedEvent {
  loadId: number;
  changedFields: Partial<DispatchLoad>;
}

/**
 * Optimistic update tracking
 */
export interface OptimisticUpdate {
  loadId: number;
  field: keyof DispatchLoad;
  previousValue: unknown;
  newValue: unknown;
  timestamp: number;
}

/**
 * Mutation error with rollback info
 */
export interface MutationError extends Error {
  loadId: number;
  operation: string;
  rollbackData?: Partial<DispatchLoad>;
}

/**
 * Status transition validation
 */
export interface StatusTransition {
  from: LoadStatus;
  to: LoadStatus;
  valid: boolean;
  requiresPermission?: string;
  requiresReason?: boolean;
}

/**
 * Valid forward transitions (no special permission required)
 */
export const VALID_FORWARD_TRANSITIONS: Record<LoadStatus, LoadStatus[]> = {
  PLANNING: ['PENDING'],
  PENDING: ['TENDERED'],
  TENDERED: ['ACCEPTED', 'PENDING'], // Can revert if tender rejected/expired
  ACCEPTED: ['DISPATCHED'],
  DISPATCHED: ['AT_PICKUP'],
  AT_PICKUP: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['AT_DELIVERY'],
  AT_DELIVERY: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Check if status transition is valid
 */
export function isValidTransition(from: LoadStatus, to: LoadStatus): StatusTransition {
  const validForward = VALID_FORWARD_TRANSITIONS[from]?.includes(to);

  if (validForward) {
    return { from, to, valid: true };
  }

  // Check if it's a backward transition (requires special permission)
  const statusOrder: LoadStatus[] = [
    'PLANNING',
    'PENDING',
    'TENDERED',
    'ACCEPTED',
    'DISPATCHED',
    'AT_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'AT_DELIVERY',
    'DELIVERED',
    'COMPLETED',
  ];

  const fromIndex = statusOrder.indexOf(from);
  const toIndex = statusOrder.indexOf(to);

  if (fromIndex > toIndex && toIndex >= 0) {
    return {
      from,
      to,
      valid: true,
      requiresPermission: 'load_status_revert',
      requiresReason: true,
    };
  }

  // Invalid transition
  return { from, to, valid: false };
}
