import { http, HttpResponse } from "msw";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export const handlers = [
  http.get(apiUrl("/health"), () => {
    return HttpResponse.json({ status: "ok" });
  }),
];

export { apiUrl };
