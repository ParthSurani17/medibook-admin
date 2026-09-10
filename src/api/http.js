const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TOKEN_KEY = "medibook_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// One place all API calls flow through: attaches the JWT, builds query
// strings, parses JSON, and turns non-2xx responses into thrown Errors with
// a readable message (so callers can just try/catch and show err.message).
export async function apiRequest(path, { method = "GET", body, params } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          query.append(key, item);
        }
      });
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
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

  let data = null;
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
      (data && (data.message || data.error)) ||
      `Request failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data;
}

// Fetch in pages within the API's 50-record maximum.
export async function getList(path, limit, params = {}) {
  const list = [];
  let page;
  do {
    page = await apiRequest(path, {
      params: {
        ...params,
        skip: list.length,
        take: Math.min(50, limit - list.length),
      },
    });
    list.push(...page.list);
  } while (page.hasMany && page.list.length > 0 && list.length < limit);
  return { ...page, list, count: list.length };
}

export const http = {
  get: (path, params) => apiRequest(path, { method: "GET", params }),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  patch: (path, body) => apiRequest(path, { method: "PATCH", body }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};
