/**
 * React Hook for WebSocket Ticker Data
 * Manages WebSocket connection and provides live ticker quotes to components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, TickerResponseData, AssetQuote } from '../lib/websocket';

interface UseTickerWebSocketOptions {
  autoConnect?: boolean;
  autoSubscribe?: boolean;
}

interface UseTickerWebSocketReturn {
  quotes: AssetQuote[];
  feedStatus: 'OPTIMAL' | 'STALE' | 'FALLBACK' | null;
  isConnected: boolean;
  lastUpdate: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: () => void;
}

export function useTickerWebSocket(
  options: UseTickerWebSocketOptions = {}
): UseTickerWebSocketReturn {
  const { autoConnect = true, autoSubscribe = true } = options;

  const [quotes, setQuotes] = useState<AssetQuote[]>([]);
  const [feedStatus, setFeedStatus] = useState<'OPTIMAL' | 'STALE' | 'FALLBACK' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const isConnectedRef = useRef(false);

  const handleQuotes = useCallback((data: TickerResponseData) => {
    setQuotes(data.quotes || []);
    setFeedStatus(data.feedStatus || null);
    setLastUpdate(data.timestamp || null);
  }, []);

  const handleConnect = useCallback(() => {
    console.log('[useTickerWebSocket] Connected');
    setIsConnected(true);
    isConnectedRef.current = true;

    if (autoSubscribe) {
      websocketService.subscribe();
    }
  }, [autoSubscribe]);

  const handleDisconnect = useCallback(() => {
    console.log('[useTickerWebSocket] Disconnected');
    setIsConnected(false);
    isConnectedRef.current = false;
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('[useTickerWebSocket] Error:', error);
    setIsConnected(false);
    isConnectedRef.current = false;
  }, []);

  const connect = useCallback(() => {
    websocketService.connect({
      onQuotes: handleQuotes,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError,
    });
  }, [handleQuotes, handleConnect, handleDisconnect, handleError]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const subscribe = useCallback(() => {
    websocketService.subscribe();
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    quotes,
    feedStatus,
    isConnected,
    lastUpdate,
    connect,
    disconnect,
    subscribe,
  };
}
