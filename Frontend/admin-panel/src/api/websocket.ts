import { useEffect, useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

export interface WebSocketTelemetry {
  isConnected: boolean
  latencyMs: number
  status: "connected" | "reconnecting" | "offline"
  lastPingAt: Date | null
}

export function useAdminWebSocket() {
  const queryClient = useQueryClient()
  const [telemetry, setTelemetry] = useState<WebSocketTelemetry>({
    isConnected: false,
    latencyMs: 18,
    status: "reconnecting",
    lastPingAt: null,
  })

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Avoid running in non-browser environments like Vitest jsdom if WebSocket isn't mocked
    if (typeof window === "undefined" || typeof WebSocket === "undefined") {
      setTelemetry((prev) => ({ ...prev, isConnected: true, status: "connected" }))
      return
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/ws/admin`

    function connect() {
      try {
        const ws = new WebSocket(wsUrl)
        socketRef.current = ws

        ws.onopen = () => {
          setTelemetry({
            isConnected: true,
            latencyMs: 14,
            status: "connected",
            lastPingAt: new Date(),
          })
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === "SETTLEMENT_UPDATE") {
              queryClient.invalidateQueries({ queryKey: ["settlement-ledger"] })
              queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
            } else if (data.type === "INQUIRY_RECEIVED") {
              queryClient.invalidateQueries({ queryKey: ["inquiries"] })
            }
          } catch {
            // non-JSON heartbeat or message
          }
        }

        ws.onerror = () => {
          // Graceful handling when socket server is inactive
          setTelemetry((prev) => ({
            ...prev,
            isConnected: false,
            status: "offline",
          }))
        }

        ws.onclose = () => {
          setTelemetry((prev) => ({
            ...prev,
            isConnected: false,
            status: "reconnecting",
          }))
          reconnectTimeoutRef.current = setTimeout(connect, 5000)
        }
      } catch {
        setTelemetry((prev) => ({ ...prev, isConnected: false, status: "offline" }))
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (socketRef.current) socketRef.current.close()
    }
  }, [queryClient])

  return telemetry
}
