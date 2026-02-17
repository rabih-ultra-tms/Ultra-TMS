import { http, HttpResponse } from "msw";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export const mockCarriers = [
  {
    id: "c1",
    tenantId: "t1",
    carrierType: "COMPANY" as const,
    companyName: "Swift Trucking LLC",
    mcNumber: "MC123456",
    dotNumber: "DOT789012",
    address: "100 Main St",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    phone: "555-100-2000",
    email: "dispatch@swift.com",
    billingEmail: "billing@swift.com",
    paymentTermsDays: 30,
    preferredPaymentMethod: "ACH" as const,
    insuranceCompany: "National Ins",
    insurancePolicyNumber: "POL-001",
    insuranceExpiryDate: "2027-06-15",
    insuranceCargoLimitCents: 10000000,
    status: "ACTIVE" as const,
    notes: "Preferred carrier, reliable.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    _count: { drivers: 12, trucks: 8 },
  },
  {
    id: "c2",
    tenantId: "t1",
    carrierType: "OWNER_OPERATOR" as const,
    companyName: "Mike's Hauling",
    mcNumber: "MC654321",
    dotNumber: "DOT210987",
    address: "200 Oak Ave",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    phone: "555-200-3000",
    email: "mike@mikeshauling.com",
    billingEmail: "mike@mikeshauling.com",
    paymentTermsDays: 15,
    preferredPaymentMethod: "CHECK" as const,
    status: "PREFERRED" as const,
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-20T00:00:00Z",
    _count: { drivers: 1, trucks: 1 },
  },
  {
    id: "c3",
    tenantId: "t1",
    carrierType: "COMPANY" as const,
    companyName: "Frozen Express",
    mcNumber: "MC111222",
    dotNumber: "DOT333444",
    address: "300 Ice Rd",
    city: "Miami",
    state: "FL",
    zip: "33101",
    phone: "555-300-4000",
    email: "ops@frozenexpress.com",
    billingEmail: "ar@frozenexpress.com",
    paymentTermsDays: 45,
    preferredPaymentMethod: "WIRE" as const,
    status: "ON_HOLD" as const,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-05T00:00:00Z",
    _count: { drivers: 6, trucks: 4 },
  },
];

export const mockCarrierStats = {
  total: 3,
  byType: { COMPANY: 2, OWNER_OPERATOR: 1 },
  byStatus: { ACTIVE: 1, PREFERRED: 1, ON_HOLD: 1 },
};

export const mockDrivers = [
  {
    id: "d1",
    carrierId: "c1",
    firstName: "John",
    lastName: "Smith",
    isOwner: false,
    phone: "555-111-0001",
    email: "john@swift.com",
    address: "10 Elm St",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    cdlNumber: "CDL-001",
    cdlState: "TX",
    cdlClass: "A",
    cdlExpiry: "2027-12-01",
    medicalCardExpiry: "2027-06-01",
    emergencyContactName: "Jane Smith",
    emergencyContactPhone: "555-111-0002",
    status: "ACTIVE" as const,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export const carrierHandlers = [
  // List carriers
  http.get(apiUrl("/operations/carriers"), ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const status = url.searchParams.get("status");
    const carrierType = url.searchParams.get("carrierType");

    let filtered = [...mockCarriers];

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.companyName.toLowerCase().includes(search) ||
          c.mcNumber?.toLowerCase().includes(search) ||
          c.dotNumber?.toLowerCase().includes(search)
      );
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (carrierType) {
      filtered = filtered.filter((c) => c.carrierType === carrierType);
    }

    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 25,
      totalPages: 1,
    });
  }),

  // Get single carrier
  http.get(apiUrl("/operations/carriers/stats"), () => {
    return HttpResponse.json(mockCarrierStats);
  }),

  // Get single carrier (must come after /stats to avoid route conflict)
  http.get(apiUrl("/operations/carriers/:id"), ({ params }) => {
    const carrier = mockCarriers.find((c) => c.id === params.id);
    if (!carrier) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(carrier);
  }),

  // Create carrier
  http.post(apiUrl("/operations/carriers"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "c-new", ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 }
    );
  }),

  // Update carrier
  http.patch(apiUrl("/operations/carriers/:id"), async ({ params, request }) => {
    const carrier = mockCarriers.find((c) => c.id === params.id);
    if (!carrier) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...carrier, ...body, updatedAt: new Date().toISOString() });
  }),

  // Delete carrier
  http.delete(apiUrl("/operations/carriers/:id"), ({ params }) => {
    const carrier = mockCarriers.find((c) => c.id === params.id);
    if (!carrier) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Get carrier drivers
  http.get(apiUrl("/operations/carriers/:id/drivers"), ({ params }) => {
    const drivers = mockDrivers.filter((d) => d.carrierId === params.id);
    return HttpResponse.json(drivers);
  }),
];
