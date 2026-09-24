import type { Listing, ListingInput, User } from "@/types";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

async function request<T>(path: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("settla-token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? "Request failed");
  return body as T;
}

export const api = {
  login: (email: string, password: string) => request<{ data: { accessToken: string; user: User } }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request<{ data: User }>("/auth/me"),
  listings: (params = "") => request<{ data: Listing[]; meta: { totalItems: number } }>(`/listings${params}`),
  listing: (slug: string) => request<{ data: Listing }>(`/listings/${slug}`),
  myListings: () => request<{ data: Listing[] }>("/me/listings"),
  createListing: (data: ListingInput) => request<{ data: Listing }>("/listings", { method: "POST", body: JSON.stringify(data) }),
  submitListing: (id: string) => request<{ data: Listing }>(`/me/listings/${id}/submit`, { method: "POST" }),
  adminListings: () => request<{ data: Listing[] }>("/admin/listings"),
  moderate: (id: string, status: "PUBLISHED" | "REJECTED" | "ARCHIVED", rejectionReason?: string) => request<{ data: Listing }>(`/admin/listings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, rejectionReason }) })
};
