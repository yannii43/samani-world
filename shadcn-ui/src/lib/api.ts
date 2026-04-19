// src/lib/api.ts
type Json = any;

const RAW_BASE = (import.meta as any).env?.VITE_API_URL as string | undefined;
// Si VITE_API_URL n'est pas défini, on s'appuie sur le proxy Vite /api -> http://localhost:4000
const BASE = (RAW_BASE || "").replace(/\/$/, "");

function withApiPrefix(path: string) {
  // si déjà une URL complète, on laisse
  if (/^https?:\/\//i.test(path)) return path;

  // base explicite (ex: http://localhost:4000)
  if (BASE) {
    if (path.startsWith("/api/")) return `${BASE}${path}`;
    if (path.startsWith("/")) return `${BASE}/api${path}`;
    return `${BASE}/api/${path}`;
  }

  // pas de base => proxy Vite
  if (path.startsWith("/api/")) return path;
  if (path.startsWith("/")) return `/api${path}`;
  return `/api/${path}`;
}

async function request<T = Json>(path: string, init?: RequestInit): Promise<T> {
  const url = withApiPrefix(path);

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // pas du JSON
    data = { ok: false, error: text || `HTTP_${res.status}` };
  }

  if (!res.ok) {
    // on harmonise l'erreur
    const msg = data?.message || data?.error || `HTTP_${res.status}`;
    return { ok: false, error: msg } as any;
  }

  return data as T;
}

export function apiGet<T = Json>(path: string) {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T = Json>(path: string, body?: any) {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T = Json>(path: string, body?: any) {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = Json>(path: string) {
  return request<T>(path, { method: "DELETE" });
}
