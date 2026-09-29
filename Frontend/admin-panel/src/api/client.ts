export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
  timestamp: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errorCode?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

let inMemoryToken: string | null = null

export function setAuthToken(token: string | null) {
  inMemoryToken = token
}

export function getAuthToken(): string | null {
  return inMemoryToken
}

const BASE_URL = "/api/v1"

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: options.credentials || "include",
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error"
    throw new ApiError(0, message)
  }

  if (response.status === 401) {
    inMemoryToken = null
    window.dispatchEvent(new CustomEvent("wavy:session_expired"))
    throw new ApiError(401, "Session expired or unauthorized")
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`
    let errorCode: string | undefined
    try {
      const errJson = await response.json()
      errorMsg = errJson.message || errJson.error || errorMsg
      errorCode = errJson.errorCode
    } catch {
      // ignore json parse error
    }
    throw new ApiError(response.status, errorMsg, errorCode)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  const json: ApiResponse<T> = await response.json()
  return json.data !== undefined ? json.data : (json as unknown as T)
}
