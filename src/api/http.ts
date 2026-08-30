const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TOKEN_KEY = "medibook_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  params?: QueryParams;
}

// One place all API calls flow through: attaches the JWT, builds query
// strings, parses JSON, and turns non-2xx responses into thrown Errors with
// a readable message (so callers can just try/catch and show err.message).
export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, params }: RequestOptions = {}
): Promise<T> {
  let url = `${BASE_URL}${path}`;

  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Could not reach the server. Is the backend running (npm run start:dev) and MongoDB up?"
    );
  }

  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
    }
    const message =
      (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data as T;
}

export const http = {
  get: <T = unknown>(path: string, params?: QueryParams) =>
    apiRequest<T>(path, { method: "GET", params }),
  post: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T = unknown>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
