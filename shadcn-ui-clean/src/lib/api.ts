// src/lib/api.ts
export type ApiError = {
  message: string;
  status?: number;
  url?: string;
  body?: any;
};

const API_BASE = import.meta.env.VITE_API_URL || ""; // "" = proxy Vite en dev

function joinApi(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.startsWith("/api/")) return `${API_BASE}${path}`;
  return `${API_BASE}/api${path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = joinApi(path);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  let json: any = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    json = await res.json().catch(() => null);
  } else {
    json = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const err: ApiError = {
      message: `HTTP ${res.status}`,
      status: res.status,
      url,
      body: json,
    };
    throw err;
  }

  return json as T;
}
