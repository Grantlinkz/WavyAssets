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
  private callbacks: TickerCallbacks = {};

  /**
   * Connect to the ticker WebSocket gateway
   */
  connect(callbacks: TickerCallbacks = {}): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.callbacks = callbacks;

    // Get WebSocket URL from environment or default to localhost
    const wsUrl = this.getWebSocketUrl();

    console.log('[WebSocket] Connecting to:', wsUrl);

    this.socket = io(wsUrl, {
      path: '/ws/ticker',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from the WebSocket gateway
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
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
    // Fallback to backend origin
    const backendUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_ORIGIN;
    if (backendUrl) {
      return backendUrl;
    }
    // Default to localhost for development
    return 'http://localhost:4000';
  }

  /**
   * Setup event listeners for the WebSocket connection
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
        this.callbacks.onError?.(error);
      }
    });

    this.socket.on('ticker:quotes', (data: TickerResponseData) => {
      console.log('[WebSocket] Received ticker quotes:', data.quotes?.length || 0, 'assets');
      this.callbacks.onQuotes?.(data);
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      this.callbacks.onError?.(error);
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
