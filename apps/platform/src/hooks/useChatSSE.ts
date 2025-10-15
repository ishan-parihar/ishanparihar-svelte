import { useEffect, useRef, useState, useCallback } from "react";
import { SupportMessage } from "@/lib/supportService";

export interface ChatSSEEvent {
  type:
    | "connected"
    | "new_message"
    | "messages_read"
    | "session_status_updated"
    | "ping"
    | "user_typing"
    | "user_stopped_typing";
  data?: any;
  timestamp?: string;
}

export interface UseChatSSEOptions {
  sessionId: string;
  onMessage?: (message: SupportMessage) => void;
  onStatusUpdate?: (status: string) => void;
  onMessagesRead?: (messageIds: string[]) => void;
  onUserTyping?: (userId: string, isTyping: boolean) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useChatSSE({
  sessionId,
  onMessage,
  onStatusUpdate,
  onMessagesRead,
  onUserTyping,
  onError,
  onConnectionChange,
}: UseChatSSEOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(
        `/api/admin/support/chat/${sessionId}/events`,
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        onConnectionChange?.(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const chatEvent: ChatSSEEvent = JSON.parse(event.data);

          switch (chatEvent.type) {
            case "connected":
              // Connection established
              break;

            case "new_message":
              if (chatEvent.data && onMessage) {
                onMessage(chatEvent.data);
              }
              break;

            case "session_status_updated":
              if (chatEvent.data?.status && onStatusUpdate) {
                onStatusUpdate(chatEvent.data.status);
              }
              break;

            case "messages_read":
              if (chatEvent.data?.message_ids && onMessagesRead) {
                onMessagesRead(chatEvent.data.message_ids);
              }
              break;

            case "user_typing":
              if (chatEvent.data?.user_id && onUserTyping) {
                onUserTyping(chatEvent.data.user_id, true);
              }
              break;

            case "user_stopped_typing":
              if (chatEvent.data?.user_id && onUserTyping) {
                onUserTyping(chatEvent.data.user_id, false);
              }
              break;

            case "ping":
              // Keep-alive ping, no action needed
              break;

            default:
              console.log("Unknown SSE event type:", chatEvent.type);
          }
        } catch (parseError) {
          console.error("Error parsing SSE message:", parseError);
        }
      };

      eventSource.onerror = (event) => {
        setConnected(false);
        onConnectionChange?.(false);

        const errorObj = new Error("SSE connection error");
        setError(errorObj);
        onError?.(errorObj);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000,
          );
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `Attempting to reconnect (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`,
            );
            connect();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
          const maxAttemptsError = new Error(
            "Max reconnection attempts reached",
          );
          setError(maxAttemptsError);
          onError?.(maxAttemptsError);
        }
      };
    } catch (connectionError) {
      const errorObj =
        connectionError instanceof Error
          ? connectionError
          : new Error("Failed to establish SSE connection");
      setError(errorObj);
      onError?.(errorObj);
    }
  }, [
    sessionId,
    onMessage,
    onStatusUpdate,
    onMessagesRead,
    onUserTyping,
    onError,
    onConnectionChange,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnected(false);
    setError(null);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [connect, disconnect]);

  // Send typing indicator (this would typically be sent via a separate API call)
  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      try {
        await fetch(`/api/admin/support/chat/${sessionId}/typing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ typing: isTyping }),
        });
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    },
    [sessionId],
  );

  useEffect(() => {
    if (sessionId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    error,
    reconnect,
    disconnect,
    sendTypingIndicator,
  };
}

// Hook for managing typing indicators with debouncing
export function useTypingIndicator(
  sessionId: string,
  debounceMs: number = 1000,
) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { sendTypingIndicator } = useChatSSE({ sessionId });

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, debounceMs);
  }, [isTyping, sendTypingIndicator, debounceMs]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  }, [isTyping, sendTypingIndicator]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    startTyping,
    stopTyping,
  };
}
