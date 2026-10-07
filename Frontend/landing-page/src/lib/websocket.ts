/**
 * WavyAssets WebSocket Client Layer
 * Real-time communication with Backend/landing-page WebSocket gateway
 */

import { io, Socket } from 'socket.io-client';

// -------------------------------------------------------------
// Telemetry & Ticker Contracts
// -------------------------------------------------------------
export interface AssetQuote {
  symbol: string;
  name: string;
  category: 'CRYPTO' | 'EQUITIES' | 'COMMODITIES' | 'TREASURIES';
  price: number;
  change24h: string;
  volume24h: string;
  sparkline: number[];
  updatedAt: string;
}

export interface TickerResponseData {
  quotes: AssetQuote[];
  feedStatus: 'OPTIMAL' | 'STALE' | 'FALLBACK';
  timestamp: string;
}

export interface TickerCallbacks {
  onQuotes?: (data: TickerResponseData) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// -------------------------------------------------------------
// WebSocket Service
// -------------------------------------------------------------
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private subscribers = new Map<number, TickerCallbacks>();
  private nextSubscriberId = 1;

  /**
   * Register subscriber callbacks and connect to ticker gateway if not connected.
   * Returns an unsubscribe function to remove the subscriber.
   */
  connect(callbacks: TickerCallbacks = {}): () => void {
    const subscriberId = this.nextSubscriberId++;
    this.subscribers.set(subscriberId, callbacks);

    // Reuse or preserve existing socket if already connected or handshake is pending
    if (this.socket && (this.socket.connected || !this.socket.disconnected)) {
      if (this.socket.connected) {
        callbacks.onConnect?.();
      }
      return () => this.unsubscribe(subscriberId);
    }

    const wsUrl = this.getWebSocketUrl();
    console.log('[WebSocket] Connecting to:', wsUrl);

    this.socket = io(wsUrl, {
      path: '/ws/ticker',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();

    return () => this.unsubscribe(subscriberId);
  }

  /**
   * Unsubscribe a subscriber by ID; disconnect only when last subscriber leaves
   */
  unsubscribe(subscriberId: number): void {
    this.subscribers.delete(subscriberId);
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Disconnect from the WebSocket gateway and clean up all listeners
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
    this.subscribers.clear();
  }

  /**
   * Subscribe to ticker updates
   */
  subscribe(): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Subscribing to ticker');
      this.socket.emit('ticker:subscribe');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get the WebSocket URL based on environment
   */
  private getWebSocketUrl(): string {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL;
    if (envUrl) {
      return envUrl;
    }
    // Fallback to backend origin if explicitly configured
    const backendUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_ORIGIN;
    if (backendUrl) {
      return backendUrl;
    }
    // Use page origin to preserve same-origin routing through configured proxy
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return '';
  }

  /**
   * Setup event listeners for the WebSocket connection
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.subscribers.forEach((cb) => cb.onConnect?.());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.subscribers.forEach((cb) => cb.onDisconnect?.());
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
      }
      this.subscribers.forEach((cb) => cb.onError?.(error));
    });

    this.socket.on('ticker:quotes', (data: TickerResponseData) => {
      console.log('[WebSocket] Received ticker quotes:', data.quotes?.length || 0, 'assets');
      this.subscribers.forEach((cb) => cb.onQuotes?.(data));
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      this.subscribers.forEach((cb) => cb.onError?.(error));
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
