import { http, HttpResponse } from "msw";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

const mockCustomers = [
  { id: "1", code: "CUST001", name: "Acme Corp", status: "ACTIVE", tags: [] },
  { id: "2", code: "CUST002", name: "Beta Inc", status: "ACTIVE", tags: [] },
];

const mockLeads = [
  { id: "1", title: "New opportunity", stage: "NEW", probability: 20 },
];

const mockContacts = [
  {
    id: "1",
    companyId: "1",
    firstName: "Taylor",
    lastName: "Smith",
    fullName: "Taylor Smith",
    isPrimary: true,
    isActive: true,
  },
];

const mockActivities = [
  {
    id: "1",
    type: "CALL",
    subject: "Intro call",
    createdById: "user-1",
    createdBy: { id: "user-1", name: "Agent" },
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
];

export const crmHandlers = [
  http.get(apiUrl("/crm/companies"), () => {
    return HttpResponse.json({
      data: mockCustomers,
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
  }),

  http.get(apiUrl("/crm/companies/:id"), ({ params }) => {
    const customer = mockCustomers.find((c) => c.id === params.id);
    if (!customer) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ data: customer });
  }),

  http.post(apiUrl("/crm/companies"), async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { id: "3", ...(body as object) } }, { status: 201 });
  }),

  http.get(apiUrl("/crm/opportunities"), () => {
    return HttpResponse.json({
      data: mockLeads,
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),

  http.get(apiUrl("/crm/opportunities/pipeline"), () => {
    return HttpResponse.json({
      data: { NEW: mockLeads, QUALIFIED: [], PROPOSAL: [], NEGOTIATION: [], WON: [], LOST: [] },
    });
  }),

  http.get(apiUrl("/crm/contacts"), () => {
    return HttpResponse.json({
      data: mockContacts,
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),

  http.get(apiUrl("/crm/contacts/:id"), ({ params }) => {
    const contact = mockContacts.find((c) => c.id === params.id);
    if (!contact) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ data: contact });
  }),

  http.get(apiUrl("/crm/activities"), () => {
    return HttpResponse.json({
      data: mockActivities,
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),
];
