"use client";
import React, { useMemo } from "react";
import Card from "../atoms/Card";
import CurrentQueueDisplay from "../molecules/CurrentQueueDisplay";
import { useGetCounters } from "@/services/counter/wrapper.service";
import { Counter } from "@/services/counter/api.service";
import { EQueueStatus } from "@/interfaces/services/queue.interface";
import { useQueueSSE } from "@/services/queue/sse.hook";

interface QueueDisplayBoardProps {
  className?: string;
}

const QueueDisplayPage: React.FC<QueueDisplayBoardProps> = ({ className }) => {
  const { data: countersResponse } = useGetCounters();
  const { data: sseData, connected } = useQueueSSE({ type: 'counter-display', enabled: true });

  interface SSECounter { id:number; name:string; currentQueueNumber:number; currentQueueId:number|null; isActive:boolean; maxQueue?:number }

  const counters: Counter[] = useMemo(() => {
    // Prioritize SSE for freshness
    if (sseData?.counters) {
      return (sseData.counters as SSECounter[])
        .filter(c => c.isActive)
        .map(c => ({
          id: c.id,
            name: c.name,
            currentQueueNumber: c.currentQueueNumber,
            currentQueueId: c.currentQueueId,
            isActive: c.isActive,
            maxQueue: c.maxQueue ?? 0,
            createdAt: '',
            updatedAt: ''
        } as Counter));
    }
    if (countersResponse?.data && 'counters' in countersResponse.data) {
      return (countersResponse.data.counters as Counter[]).filter(c => c.isActive);
    }
    return [];
  }, [sseData, countersResponse]);

  return (
    <div className={className}>
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          PAPAN INFORMASI ANTRIAN
        </h2>
        <p className="text-center text-gray-600">
          Berikut status antrian yang sedang dilayani pada masing-masing counter
        </p>
        <div className="mt-4 flex justify-center">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {connected ? 'Real-time (SSE aktif)' : 'Memuat data...'}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {counters.map((counter: Counter) => (
          <CurrentQueueDisplay
            key={counter.id}
            counterName={counter.name || "Counter"}
            queueNumber={counter.currentQueueNumber || 0}
            status={(counter.currentQueueNumber ? "CALLED" : "RELEASED") as EQueueStatus}
          />
        ))}

        {counters.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            Tidak ada counter yang aktif saat ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueDisplayPage;
