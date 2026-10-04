import { apiClient } from "./client"

export type AdminPersonnelRole =
  | "SUPER_ADMIN"
  | "TREASURY_OFFICER"
  | "COMPLIANCE_OFFICER"
  | "DESK_LEAD"
  | "CONCIERGE"

export interface AdminPersonnel {
  id: string
  fullName: string
  email: string
  role: AdminPersonnelRole
  isActive: boolean
  createdAt: string
  updatedAt: string
  permissions: string[]
  roleDescription: string
}

export interface CreateAdminPayload {
  fullName: string
  email: string
  passphrase: string
  role: AdminPersonnelRole
}

export interface UpdateAdminPayload {
  fullName?: string
  email?: string
  passphrase?: string
  role?: AdminPersonnelRole
}

export interface AdminListResponse {
  items: AdminPersonnel[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function fetchAdmins(params?: {
  search?: string
  role?: string
  status?: string
}): Promise<AdminPersonnel[]> {
  const queryParts: string[] = []
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.role && params.role !== "ALL") queryParts.push(`role=${encodeURIComponent(params.role)}`)
  if (params?.status && params.status !== "ALL") queryParts.push(`status=${encodeURIComponent(params.status)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<unknown>(`/admin/admins${queryString}`)

  if (Array.isArray(res)) {
    return res as AdminPersonnel[]
  }
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>
    if ("items" in obj && Array.isArray(obj.items)) {
      return obj.items as AdminPersonnel[]
    }
  }
  return []
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminPersonnel> {
  return apiClient<AdminPersonnel>("/admin/admins", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateAdmin(id: string, payload: UpdateAdminPayload): Promise<AdminPersonnel> {
  return apiClient<AdminPersonnel>(`/admin/admins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function suspendAdmin(id: string, reason?: string): Promise<AdminPersonnel> {
  return apiClient<AdminPersonnel>(`/admin/admins/${id}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
}

export async function unsuspendAdmin(id: string, reason?: string): Promise<AdminPersonnel> {
  return apiClient<AdminPersonnel>(`/admin/admins/${id}/unsuspend`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
}

export async function deleteAdmin(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : ""
  return apiClient<{ success: boolean; message: string }>(`/admin/admins/${id}${query}`, {
    method: "DELETE",
  })
}
