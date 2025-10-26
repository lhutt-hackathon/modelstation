const apiBaseUrl =
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}
