/**
 * React Hook for WebSocket Ticker Data
 * Manages WebSocket connection and provides live ticker quotes to components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService } from '../lib/websocket';
import type { TickerResponseData, AssetQuote } from '../lib/websocket';

interface UseTickerWebSocketOptions {
  autoConnect?: boolean;
  autoSubscribe?: boolean;
}

interface UseTickerWebSocketReturn {
  quotes: AssetQuote[];
  feedStatus: 'OPTIMAL' | 'STALE' | 'FALLBACK' | null;
  isConnected: boolean;
  isError: boolean;
  error: Error | null;
  lastUpdate: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: () => void;
  retry: () => void;
}

export function useTickerWebSocket(
  options: UseTickerWebSocketOptions = {}
): UseTickerWebSocketReturn {
  const { autoConnect = true, autoSubscribe = true } = options;

  const [quotes, setQuotes] = useState<AssetQuote[]>([]);
  const [feedStatus, setFeedStatus] = useState<'OPTIMAL' | 'STALE' | 'FALLBACK' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleQuotes = useCallback((data: TickerResponseData) => {
    setQuotes(data.quotes || []);
    setFeedStatus(data.feedStatus || null);
    setLastUpdate(data.timestamp || null);
  }, []);

  const handleConnect = useCallback(() => {
    console.log('[useTickerWebSocket] Connected');
    setIsConnected(true);
    setIsError(false);
    setError(null);

    if (autoSubscribe) {
      websocketService.subscribe();
    }
  }, [autoSubscribe]);

  const handleDisconnect = useCallback(() => {
    console.log('[useTickerWebSocket] Disconnected');
    setIsConnected(false);
  }, []);

  const handleError = useCallback((err: Error) => {
    console.error('[useTickerWebSocket] Error:', err);
    setIsConnected(false);
    setIsError(true);
    setError(err);
  }, []);

  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    setIsError(false);
    setError(null);
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    unsubscribeRef.current = websocketService.connect({
      onQuotes: handleQuotes,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError,
    });
  }, [handleQuotes, handleConnect, handleDisconnect, handleError]);

  const retry = useCallback(() => {
    connect();
  }, [connect]);

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
    isError,
    error,
    lastUpdate,
    connect,
    disconnect,
    subscribe,
    retry,
  };
}
