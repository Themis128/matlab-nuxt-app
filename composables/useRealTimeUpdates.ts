/**
 * Nuxt 4 composable for real-time data updates
 * Uses WebSocket or Server-Sent Events for live updates
 */
export const useRealTimeUpdates = () => {
  const isConnected = ref(false);
  const lastUpdate = ref<Date | null>(null);
  const updateCount = ref(0);
  const error = ref<Error | null>(null);

  let ws: WebSocket | null = null;
  let eventSource: EventSource | null = null;

  const connectWebSocket = (url: string = '/ws/updates') => {
    if (typeof window === 'undefined') return;

    try {
      const wsUrl = url.startsWith('ws') ? url : `ws://${window.location.host}${url}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnected.value = true;
        error.value = null;
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          lastUpdate.value = new Date();
          updateCount.value++;
          // Emit custom event for components to listen
          if (process.client) {
            window.dispatchEvent(
              new CustomEvent('realtime-update', {
                detail: data,
              })
            );
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        error.value = new Error('WebSocket error');
        console.error('WebSocket error:', err);
      };

      ws.onclose = () => {
        isConnected.value = false;
        console.log('WebSocket disconnected');
      };
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to connect WebSocket');
      console.error('WebSocket connection error:', err);
    }
  };

  const connectSSE = (url: string = '/api/events') => {
    if (typeof window === 'undefined') return;

    try {
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        isConnected.value = true;
        error.value = null;
        console.log('SSE connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          lastUpdate.value = new Date();
          updateCount.value++;
          // Emit custom event for components to listen
          if (process.client) {
            window.dispatchEvent(
              new CustomEvent('realtime-update', {
                detail: data,
              })
            );
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        error.value = new Error('SSE error');
        console.error('SSE error:', err);
        isConnected.value = false;
      };
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to connect SSE');
      console.error('SSE connection error:', err);
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    isConnected.value = false;
  };

  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // Cleanup on unmount
  if (process.client) {
    onBeforeUnmount(() => {
      disconnect();
    });
  }

  return {
    isConnected: readonly(isConnected),
    lastUpdate: readonly(lastUpdate),
    updateCount: readonly(updateCount),
    error: readonly(error),
    connectWebSocket,
    connectSSE,
    disconnect,
    sendMessage,
  };
};
