import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "@/services/api/config";

// ── Types ──────────────────────────────────────────────────

export type WsEventType = "CONNECTED" | "NEW_MESSAGE" | "MESSAGE_READ" | "PONG";

export interface WsEvent {
  type: WsEventType;
  [key: string]: unknown;
}

type WsEventHandler = (event: WsEvent) => void;

interface WebSocketContextType {
  /**
   * Subscribe to all events for a conversation.
   * Returns an unsubscribe function.
   */
  subscribeToConversation: (
    conversationId: string,
    handler: WsEventHandler
  ) => () => void;
}

// ── Context ─────────────────────────────────────────────────

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

// ── Provider ────────────────────────────────────────────────

const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { hasAccessToken, getToken } = useAuth();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(1000);
  const isMountedRef = useRef(true);

  /**
   * Map<conversationId, Set<handler>>
   * Handlers are called when an event for a conversation arrives.
   */
  const handlersRef = useRef<Map<string, Set<WsEventHandler>>>(new Map());

  /**
   * Set of conversation IDs we must (re-)subscribe to after connecting.
   */
  const pendingSubscriptionsRef = useRef<Set<string>>(new Set());

  // ── Send SUBSCRIBE for all pending conversations ──────────
  const flushSubscriptions = useCallback((ws: WebSocket) => {
    const ids = [...pendingSubscriptionsRef.current];
    if (ids.length === 0) return;
    if (ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "SUBSCRIBE", conversationIds: ids }));
  }, []);

  // ── Connect / reconnect logic ─────────────────────────────
  const connect = useCallback(async () => {
    if (!isMountedRef.current) return;

    const token = await getToken();
    if (!token) return;

    // Close existing socket if still open
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    const url = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelayRef.current = 1000; // reset backoff on success
      flushSubscriptions(ws);
    };

    ws.onmessage = (e) => {
      let event: WsEvent;
      try {
        event = JSON.parse(e.data as string) as WsEvent;
      } catch {
        return;
      }

      // Deliver event to all handlers registered for the conversation
      const convId = event.conversationId as string | undefined;
      if (convId) {
        const handlers = handlersRef.current.get(convId);
        if (handlers) {
          handlers.forEach((h) => h(event));
        }
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror and trigger reconnect
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      // Exponential backoff: 1s → 2s → 4s → … capped at 30s
      const delay = Math.min(reconnectDelayRef.current, 30_000);
      reconnectDelayRef.current = delay * 2;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };
  }, [getToken, flushSubscriptions]);

  // ── Connect when authenticated ────────────────────────────
  useEffect(() => {
    if (!hasAccessToken) return;

    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccessToken]);

  // ── Heartbeat: send PING every 30s ───────────────────────
  useEffect(() => {
    if (!hasAccessToken) return;
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "PING" }));
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [hasAccessToken]);

  // ── Public API ────────────────────────────────────────────

  const subscribeToConversation = useCallback(
    (conversationId: string, handler: WsEventHandler): (() => void) => {
      // Register handler
      if (!handlersRef.current.has(conversationId)) {
        handlersRef.current.set(conversationId, new Set());
      }
      handlersRef.current.get(conversationId)!.add(handler);

      // Mark this conversation as needing subscription
      pendingSubscriptionsRef.current.add(conversationId);

      // Subscribe on the live socket if it is open
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            conversationIds: [conversationId],
          })
        );
      }

      // Return cleanup function
      return () => {
        const handlers = handlersRef.current.get(conversationId);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            handlersRef.current.delete(conversationId);
            pendingSubscriptionsRef.current.delete(conversationId);
          }
        }
      };
    },
    []
  );

  return (
    <WebSocketContext.Provider value={{ subscribeToConversation }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useWebSocket(): WebSocketContextType {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return ctx;
}
