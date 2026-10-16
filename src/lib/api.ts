const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/+$/,
  "",
);

export function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${apiBaseUrl}${normalizedPath}`, {
    ...init,
    credentials: "include",
  });
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `The API returned a non-JSON response (HTTP ${response.status}). Check the Vercel /api rewrite or set VITE_API_BASE_URL to the deployed Express backend.`,
    );
  }
  return response.json() as Promise<T>;
}
