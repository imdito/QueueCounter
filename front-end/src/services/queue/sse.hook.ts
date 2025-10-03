"use client";
import { useEffect, useRef, useState } from "react";

interface QueueSSEData {
  waiting: number;
  beingServed: number;
  completed: number;
  totalToday?: number;
  currentlyServing: Array<{
    id: number;
    queueNumber: number;
    counterId: number | null;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  nextWaiting: Array<{
    id: number;
    queueNumber: number;
    status: string;
    counterId: number | null;
  }>;
  counters: Array<{
    id: number;
    name: string;
    currentQueueNumber?: number;
    currentQueueId?: number | null;
    isActive: boolean;
  }>;
  [key: string]: unknown;
}

interface UseQueueSSEOptions {
  enabled?: boolean;
  type?: 'queue-updates' | 'counter-display';
}

export function useQueueSSE(options: UseQueueSSEOptions = {}) {
  const { enabled = true, type = 'queue-updates' } = options;
  const [data, setData] = useState<QueueSSEData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (eventSourceRef.current) return; // already connected

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    // Derive origin (strip trailing /api/v1 if present)
    const origin = apiBase.replace(/\/api\/v1\/?$/, '');
    const url = `${origin}/api/v1/sse/${type === 'queue-updates' ? 'queue-updates' : 'counter-display'}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        // Heartbeat events have type property; ignore updating main data
        if (parsed && parsed.type === 'heartbeat') return;
        setData(parsed as QueueSSEData);
      } catch {
        // silently ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      setError('SSE connection error');
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [enabled, type]);

  return { data, connected, error };
}
