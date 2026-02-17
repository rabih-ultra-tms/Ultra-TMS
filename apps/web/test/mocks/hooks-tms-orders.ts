/**
 * Manual mock for @/lib/hooks/tms/use-orders
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_TMS_ORDERS_MOCK__";

interface MockState {
  orders: Record<string, unknown>;
  order: Record<string, unknown>;
  orderLoads: Record<string, unknown>;
  orderTimeline: Record<string, unknown>;
  orderDocuments: Record<string, unknown>;
  createOrder: Record<string, unknown>;
  updateOrder: Record<string, unknown>;
  orderFromQuote: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      orders: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      order: {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      },
      orderLoads: {
        data: undefined,
        isLoading: true,
        error: null,
      },
      orderTimeline: {
        data: undefined,
        isLoading: true,
        error: null,
      },
      orderDocuments: {
        data: undefined,
        isLoading: true,
        error: null,
      },
      createOrder: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({ id: "o-new" }),
        isPending: false,
      },
      updateOrder: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
        isPending: false,
      },
      orderFromQuote: {
        data: undefined,
        isLoading: false,
        error: null,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const ordersReturn = shared.orders;
export const orderReturn = shared.order;
export const orderLoadsReturn = shared.orderLoads;
export const orderTimelineReturn = shared.orderTimeline;
export const orderDocumentsReturn = shared.orderDocuments;
export const createOrderReturn = shared.createOrder;
export const updateOrderReturn = shared.updateOrder;
export const orderFromQuoteReturn = shared.orderFromQuote;

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: unknown) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function useOrders() {
  return shared.orders;
}
export function useOrder() {
  return shared.order;
}
export function useOrderLoads() {
  return shared.orderLoads;
}
export function useOrderTimeline() {
  return shared.orderTimeline;
}
export function useOrderDocuments() {
  return shared.orderDocuments;
}
export function useCreateOrder() {
  return shared.createOrder;
}
export function useUpdateOrder() {
  return shared.updateOrder;
}
export function useOrderFromQuote() {
  return shared.orderFromQuote;
}
