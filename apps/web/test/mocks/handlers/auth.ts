import { http, HttpResponse } from "msw";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

const mockUser = {
  id: "1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  status: "ACTIVE",
  emailVerified: true,
  mfaEnabled: false,
  tenantId: "tenant-1",
  roles: [{ id: "role-1", name: "admin", displayName: "Admin", isSystem: true }],
  permissions: ["users:read", "users:write"],
};

export const authHandlers = [
  http.get(apiUrl("/auth/me"), () => {
    return HttpResponse.json({ data: mockUser });
  }),

  http.post(apiUrl("/auth/login"), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "test@example.com" && body.password === "password") {
      return HttpResponse.json({
        user: mockUser,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      });
    }

    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }),

  http.post(apiUrl("/auth/register"), () => {
    return HttpResponse.json({ message: "Registration successful" }, { status: 201 });
  }),

  http.post(apiUrl("/auth/logout"), () => {
    return HttpResponse.json({ message: "Logged out" });
  }),

  http.post(apiUrl("/auth/forgot-password"), () => {
    return HttpResponse.json({ message: "Reset email sent" });
  }),

  http.get(apiUrl("/users"), () => {
    return HttpResponse.json({
      data: [mockUser],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),

  http.get(apiUrl("/users/:id"), ({ params }) => {
    if (params.id === "1") {
      return HttpResponse.json({ data: mockUser });
    }
    return HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  http.get(apiUrl("/roles"), () => {
    return HttpResponse.json({
      data: [
        { id: "role-1", name: "admin", displayName: "Admin", isSystem: true },
        { id: "role-2", name: "user", displayName: "User", isSystem: true },
      ],
    });
  }),

  http.get(apiUrl("/roles/permissions"), () => {
    return HttpResponse.json({
      data: [
        { id: "perm-1", code: "users:read", name: "Read Users", group: "Users" },
        { id: "perm-2", code: "users:write", name: "Write Users", group: "Users" },
      ],
    });
  }),
];
