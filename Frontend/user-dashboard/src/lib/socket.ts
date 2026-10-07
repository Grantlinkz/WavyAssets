import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './api';
import { useLiquidStore } from '../store/useLiquidStore';

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

    // Use the current origin for the WS connection, which the Vite proxy routes to port 4001
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';

    this.socket = io(`${baseUrl}/ws/portfolio`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Portfolio WebSocket:', this.socket?.id);
      this.isConnecting = false;
      // Explicitly subscribe 
      this.socket?.emit('portfolio:subscribe', {});
    });

    this.socket.on('connect_error', (err) => {
      console.error('Portfolio WebSocket connection error:', err.message);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Portfolio WebSocket:', reason);
      this.isConnecting = false;
    });

    // Real-time Event Handlers
    this.socket.on('portfolio:tick', () => {
      // You can update the store here. For instance, livePrices or a new consolidated state.
      // console.log('Portfolio Tick:', _data);
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
