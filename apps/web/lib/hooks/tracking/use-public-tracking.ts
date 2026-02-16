"use client";

import { useQuery } from "@tanstack/react-query";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface PublicStopData {
  id: string;
  type: "PICKUP" | "DELIVERY";
  sequence: number;
  facilityName: string | null;
  city: string;
  state: string;
  zip: string | null;
  status: string;
  appointmentDate: string | null;
  appointmentTimeStart: string | null;
  appointmentTimeEnd: string | null;
  arrivedAt: string | null;
  departedAt: string | null;
  location: { lat: number; lng: number } | null;
}

export interface PublicTrackingData {
  loadNumber: string;
  orderNumber: string | null;
  status: string;
  equipmentType: string | null;
  customerName: string | null;
  currentLocation: {
    lat: number;
    lng: number;
    city: string | null;
    state: string | null;
    updatedAt: string | null;
  } | null;
  eta: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  dispatchedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  stops: PublicStopData[];
}

async function fetchPublicTracking(
  trackingCode: string
): Promise<PublicTrackingData> {
  const response = await fetch(
    `${API_BASE_URL}/public/tracking/${encodeURIComponent(trackingCode)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  if (response.status === 404) {
    throw new TrackingNotFoundError("Shipment not found");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch tracking data (${response.status})`);
  }

  const json = await response.json();
  return json.data;
}

export class TrackingNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrackingNotFoundError";
  }
}

export function usePublicTracking(trackingCode: string) {
  return useQuery<PublicTrackingData, Error>({
    queryKey: ["public-tracking", trackingCode],
    queryFn: () => fetchPublicTracking(trackingCode),
    enabled: !!trackingCode,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof TrackingNotFoundError) return false;
      return failureCount < 2;
    },
  });
}
