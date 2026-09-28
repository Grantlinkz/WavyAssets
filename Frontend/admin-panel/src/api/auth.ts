import { apiClient } from "./client"
import type { Operator } from "../store/useAdminAuthStore"

export interface LoginCredentials {
  email: string
  password?: string
  totpCode?: string
}

export interface LoginResponse {
  operator: Operator
  accessToken: string
  refreshToken?: string
}

export async function loginAdmin(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function getOperatorSession(): Promise<{ operator: Operator }> {
  return apiClient<{ operator: Operator }>("/auth/me")
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>("/auth/logout", {
    method: "POST",
  })
}