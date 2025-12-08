import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRealTimeUpdates } from '../useRealTimeUpdates';

// Mock Vue lifecycle hooks
const mockOnBeforeUnmount = vi.fn((fn: () => void) => fn());

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onBeforeUnmount: mockOnBeforeUnmount,
    readonly: (val: any) => val,
  };
});

// Mock process
(global as any).process = {
  client: true,
};

// Mock WebSocket
class MockWebSocket {
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(public url: string) {}

  send(_data: string) {
    // Mock send
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

(global as any).WebSocket = MockWebSocket;

// Mock EventSource
class MockEventSource {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {}

  close() {
    // Mock close
  }
}

(global as any).EventSource = MockEventSource;

describe('useRealTimeUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(global, 'window', {
      value: {
        dispatchEvent: vi.fn(),
        location: { host: 'localhost:3000' },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return real-time update methods', () => {
    const updates = useRealTimeUpdates();

    expect(updates).toHaveProperty('isConnected');
    expect(updates).toHaveProperty('lastUpdate');
    expect(updates).toHaveProperty('updateCount');
    expect(updates).toHaveProperty('error');
    expect(updates).toHaveProperty('connectWebSocket');
    expect(updates).toHaveProperty('connectSSE');
    expect(updates).toHaveProperty('disconnect');
    expect(updates).toHaveProperty('sendMessage');
  });

  it('should initialize with disconnected state', () => {
    const updates = useRealTimeUpdates();

    expect(updates.isConnected.value).toBe(false);
    expect(updates.lastUpdate.value).toBeNull();
    expect(updates.updateCount.value).toBe(0);
  });

  it('should connect WebSocket', () => {
    const updates = useRealTimeUpdates();
    updates.connectWebSocket('/ws/updates');

    // WebSocket should be created
    expect(updates.isConnected.value).toBe(false); // Initially false until onopen
  });

  it('should handle WebSocket connection', () => {
    const updates = useRealTimeUpdates();
    updates.connectWebSocket('/ws/updates');

    // Simulate connection
    const ws = (updates as any).ws;
    if (ws && ws.onopen) {
      ws.onopen(new Event('open'));
    }

    expect(updates.isConnected.value).toBe(true);
  });

  it('should handle WebSocket messages', () => {
    const updates = useRealTimeUpdates();
    updates.connectWebSocket('/ws/updates');

    const ws = (updates as any).ws;
    if (ws && ws.onmessage) {
      ws.onmessage(new MessageEvent('message', { data: JSON.stringify({ test: 'data' }) }));
    }

    expect(updates.updateCount.value).toBe(1);
    expect(updates.lastUpdate.value).not.toBeNull();
  });

  it('should connect SSE', () => {
    const updates = useRealTimeUpdates();
    updates.connectSSE('/api/events');

    // EventSource should be created
    expect(updates.isConnected.value).toBe(false); // Initially false until onopen
  });

  it('should disconnect WebSocket', () => {
    const updates = useRealTimeUpdates();
    updates.connectWebSocket('/ws/updates');
    updates.disconnect();

    expect(updates.isConnected.value).toBe(false);
  });

  it('should send message via WebSocket', () => {
    const updates = useRealTimeUpdates();
    updates.connectWebSocket('/ws/updates');

    const ws = (updates as any).ws;
    if (ws) {
      ws.readyState = WebSocket.OPEN;
    }

    const sent = updates.sendMessage({ type: 'test' });

    expect(sent).toBe(true);
  });

  it('should return false when WebSocket not open', () => {
    const updates = useRealTimeUpdates();
    const sent = updates.sendMessage({ type: 'test' });

    expect(sent).toBe(false);
  });

  it('should cleanup on unmount', () => {
    useRealTimeUpdates();

    expect(mockOnBeforeUnmount).toHaveBeenCalled();
  });
});
