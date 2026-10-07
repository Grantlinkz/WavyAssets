import { io, Socket } from 'socket.io-client';
import { getStoredToken, refreshSessionToken } from './api';
import { useLiquidStore } from '../store/useLiquidStore';

function getSocketBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    // When running on Vercel deployment, connect directly to backend origin
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://wavyassets-backend-userdashboard.onrender.com';
    }
    // Development and containerized proxy use current origin
    return window.location.origin;
  }
  return 'http://localhost:5174';
}

class PortfolioSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  public connect() {
    const token = getStoredToken();
    if (!token) {
      console.warn('Portfolio WebSocket connection aborted: No access token found.');
      return;
    }

    if (this.socket?.connected || this.isConnecting) return;
    this.isConnecting = true;

    const baseUrl = getSocketBaseUrl();

    this.socket = io(`${baseUrl}/ws/portfolio`, {
      auth: (cb: (data: Record<string, unknown>) => void) => {
        cb({ token: getStoredToken() || '' });
      },
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Portfolio WebSocket:', this.socket?.id);
      this.isConnecting = false;
      // Explicitly subscribe 
      this.socket?.emit('portfolio:subscribe', {});
    });

    this.socket.on('connect_error', async (err) => {
      console.error('Portfolio WebSocket connection error:', err.message);
      this.isConnecting = false;

      // Handle server authentication rejection by reconnecting after credentials are renewed
      const isAuthError =
        err.message?.toLowerCase().includes('auth') ||
        err.message?.toLowerCase().includes('unauthorized') ||
        err.message?.toLowerCase().includes('token') ||
        err.message?.toLowerCase().includes('jwt');

      if (isAuthError) {
        try {
          const renewed = await refreshSessionToken();
          if (renewed && this.socket) {
            console.log('Credentials renewed following auth rejection; reconnecting WebSocket...');
            this.socket.connect();
          }
        } catch (refreshErr) {
          console.error('Credential renewal failed following WebSocket auth rejection:', refreshErr);
        }
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Portfolio WebSocket:', reason);
      this.isConnecting = false;
    });

    // Real-time Event Handlers
    this.socket.on('portfolio:tick', () => {
      // Real-time tick updates
    });

    this.socket.on('balance:updated', (data) => {
      console.log('Balance Updated via WS:', data);
      // Automatically refresh transactions and wallet state when balance changes
      useLiquidStore.getState().loadTransactions();
    });

    this.socket.on('allocation:rebalanced', (data) => {
      console.log('Allocation Rebalanced via WS:', data);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }
}

export const portfolioSocketService = new PortfolioSocketService();
