import { useEffect, useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

export interface WebSocketTelemetry {
  isConnected: boolean
  latencyMs: number | null
  status: "connected" | "reconnecting" | "offline"
  lastPingAt: Date | null
}

export function useAdminWebSocket() {
  const queryClient = useQueryClient()
  const [telemetry, setTelemetry] = useState<WebSocketTelemetry>({
    isConnected: false,
    latencyMs: null,
    status: "offline",
    lastPingAt: null,
  })

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let isDisposed = false
    let pingInterval: ReturnType<typeof setInterval> | null = null
    let pingStartTime: number | null = null

    // If WebSocket is unavailable, report offline and disconnected
    if (typeof window === "undefined" || typeof WebSocket === "undefined") {
      setTelemetry({
        isConnected: false,
        latencyMs: null,
        status: "offline",
        lastPingAt: null,
      })
      return
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/ws/admin`

    function connect() {
      if (isDisposed) return

      try {
        setTelemetry((prev) => ({
          ...prev,
          isConnected: false,
          status: "reconnecting",
        }))

        const ws = new WebSocket(wsUrl)
        socketRef.current = ws

        const sendPing = () => {
          if (ws.readyState === WebSocket.OPEN && !isDisposed) {
            pingStartTime = performance.now()
            try {
              ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }))
            } catch {
              // Ignore ping send failures
            }
          }
        }

        ws.onopen = () => {
          if (isDisposed) return
          setTelemetry((prev) => ({
            ...prev,
            isConnected: true,
            status: "connected",
            lastPingAt: new Date(),
          }))
          sendPing()
          pingInterval = setInterval(sendPing, 10000)
        }

        ws.onmessage = (event) => {
          if (isDisposed) return
          try {
            const data = JSON.parse(event.data)
            if (data.type === "pong" || data.event === "pong" || data.pong) {
              if (pingStartTime !== null) {
                const rtt = Math.round(performance.now() - pingStartTime)
                setTelemetry((prev) => ({
                  ...prev,
                  latencyMs: rtt,
                  lastPingAt: new Date(),
                }))
                pingStartTime = null
              }
              return
            }
            if (data.type === "SETTLEMENT_UPDATE") {
              queryClient.invalidateQueries({ queryKey: ["settlement-ledger"] })
              queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
            } else if (data.type === "INQUIRY_RECEIVED") {
              queryClient.invalidateQueries({ queryKey: ["inquiries"] })
            } else if (data.type === "DEPOSIT_UPDATE" || data.type === "treasury:deposit_pending") {
              queryClient.invalidateQueries({ queryKey: ["pending-deposits"] })
              queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
            } else if (data.type === "WITHDRAWAL_UPDATE" || data.type === "treasury:withdrawal_pending") {
              queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] })
              queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
            } else if (data.type === "RAILS_UPDATE" || data.type === "deposit_rails:updated") {
              queryClient.invalidateQueries({ queryKey: ["deposit-rails"] })
            }
          } catch {
            // non-JSON heartbeat or message
          }
        }

        ws.onerror = () => {
          if (isDisposed) return
          setTelemetry((prev) => ({
            ...prev,
            isConnected: false,
            status: "offline",
          }))
        }

        ws.onclose = () => {
          if (pingInterval) {
            clearInterval(pingInterval)
            pingInterval = null
          }
          if (isDisposed) return
          setTelemetry((prev) => ({
            ...prev,
            isConnected: false,
            latencyMs: null,
            status: "reconnecting",
          }))
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isDisposed) connect()
          }, 5000)
        }
      } catch {
        if (!isDisposed) {
          setTelemetry({
            isConnected: false,
            latencyMs: null,
            status: "offline",
            lastPingAt: null,
          })
        }
      }
    }

    connect()

    return () => {
      isDisposed = true
      if (pingInterval) {
        clearInterval(pingInterval)
        pingInterval = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (socketRef.current) {
        // Detach handlers before closing so closure does not restart reconnect loop
        socketRef.current.onopen = null
        socketRef.current.onmessage = null
        socketRef.current.onerror = null
        socketRef.current.onclose = null
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [queryClient])

  return telemetry
}
