import { http, HttpResponse } from "msw";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const handlers = [
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        data: {
          user: {
            id: "user-1",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            role: "admin",
            permissions: [],
          },
        },
      });
    }

    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          role: "admin",
          permissions: [],
        },
      },
    });
  }),
];
