export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  created_at: string;
};
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "The workspace service is unavailable. Check that the local backend is running, then try again.",
      0,
    );
  }
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? payload.detail
        : null;
    throw new ApiError(
      typeof detail === "string"
        ? detail
        : response.status === 401
          ? "Your session has expired. Sign in again."
          : response.status >= 500
            ? "The workspace service could not complete this request. Try again."
            : `Request failed (${response.status}).`,
      response.status,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const getMe = () => request<User>("/auth/me");
export const login = (email: string, password: string) =>
  request<{
    user: User;
    access_token: string;
    token_type: string;
    expires_in: number;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
export const logout = () =>
  request<{ success: boolean; message: string }>("/auth/logout", {
    method: "POST",
  });
export const json = (method: string, data: unknown): RequestInit => ({
  method,
  body: JSON.stringify(data),
});
export const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.size ? `?${params}` : "";
};
