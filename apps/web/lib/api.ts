// =====================================================================
// Typed fetch client for the AR Trust API.
// Reads the token from localStorage and unwraps the { ok, data } envelope.
// Use this everywhere instead of calling fetch() directly, so auth headers
// and error handling stay consistent as features move off localStorage.
// =====================================================================

import type { ApiResponse, AuthResponse, LoginDto, RegisterDto, UserAccount } from './shared-types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'artrust_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore (private mode / SSR) */
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !body || body.ok === false) {
    const message = body && body.ok === false ? body.error : `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body && body.ok === false ? body.details : undefined);
  }
  return body.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ---- Auth helpers -------------------------------------------------------

export const authApi = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>('/api/auth/login', dto);
    setToken(result.token);
    return result;
  },
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>('/api/auth/register', dto);
    setToken(result.token);
    return result;
  },
  me: () => api.get<UserAccount>('/api/auth/me'),
  logout: () => setToken(null),
};
