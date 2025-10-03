"use client";
import { ICounter } from "@/interfaces/services/counter.interface";
import { IQueue } from "@/interfaces/services/queue.interface";
import React, { useState, useMemo, useEffect } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import Select from "../atoms/Select";
import CurrentQueueDisplay from "../molecules/CurrentQueueDisplay";
import { useGetCounters } from "@/services/counter/wrapper.service";
import { apiCallNext, apiSkipQueue, apiGetQueueStatus, apiCompleteQueue } from "@/services/queue/api.service";
import { useQueueSSE } from "@/services/queue/sse.hook";
import toast from "react-hot-toast";

interface CounterOperatorProps {
  className?: string;
}

const CounterOperator: React.FC<CounterOperatorProps> = ({ className }) => {
  const { data: countersRes, isLoading } = useGetCounters();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentQueue, setCurrentQueue] = useState<IQueue | null>(null);
  const { data: sseData } = useQueueSSE({ type: 'queue-updates', enabled: true });

  interface BackendCounter { id:number; name:string; currentQueueNumber:number; maxQueue?:number; isActive:boolean; createdAt:string; updatedAt:string; deletedAt:string|null }
  interface ServingQueue { id:number; queueNumber:number; counterId:number|null; status:string; createdAt:string; updatedAt:string }
  interface SSECounter { id:number; name:string; currentQueueNumber:number; maxQueue?:number; isActive:boolean; createdAt?:string; updatedAt?:string; deletedAt?:string|null }

  const activeCounters: ICounter[] = useMemo(() => {
    // Prefer SSE counters if available for real-time numbers
    const countersSource: SSECounter[] | BackendCounter[] | null = (sseData?.counters as SSECounter[] | undefined) || (countersRes?.data && 'counters' in countersRes.data ? countersRes.data.counters as BackendCounter[] : null);
    if (countersSource) {
      return countersSource.map((c) => ({
        id: c.id,
        name: c.name,
        currentQueue: c.currentQueueNumber || 0,
        maxQueue: c.maxQueue || 0,
        isActive: c.isActive,
        createdAt: c.createdAt || '',
        updatedAt: c.updatedAt || '',
        deletedAt: c.deletedAt || null,
      })).filter(c => c.isActive);
    }
    return [];
  }, [countersRes, sseData]);

  // Update current queue automatically from SSE when selected counter changes or SSE pushes data
  useEffect(() => {
    if (!selectedId || !sseData?.currentlyServing) return;
    const serving = sseData.currentlyServing.find(q => q.counterId === selectedId);
    if (serving) {
      setCurrentQueue({
        id: serving.id,
        queueNumber: serving.queueNumber,
        status: 'CALLED',
        counter: serving.counterId ? { id: serving.counterId, name: `Counter ${serving.counterId}` } : null,
        createdAt: serving.createdAt || '',
        updatedAt: serving.updatedAt || '',
      });
    } else {
      setCurrentQueue(null);
    }
  }, [sseData, selectedId]);

  const selectedCounter = activeCounters.find(c => c.id === selectedId) || null;

  const refreshStatus = () => {
    apiGetQueueStatus().then(res => {
      if (res.status && res.data && 'currentlyServing' in res.data) {
        const serving = (res.data as { currentlyServing: ServingQueue[] }).currentlyServing;
        const match = serving.find((q: ServingQueue) => q.counterId === selectedId);
        if (match) {
          const mapped: IQueue = {
            id: match.id,
            queueNumber: match.queueNumber,
            status: 'CALLED',
            counter: match.counterId ? { id: match.counterId, name: `Counter ${match.counterId}` } : null,
            createdAt: match.createdAt,
            updatedAt: match.updatedAt,
          };
          setCurrentQueue(mapped);
        } else {
          setCurrentQueue(null);
        }
      }
    });
  };

  const handleCounterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedId(val ? Number(val) : null);
    setCurrentQueue(null);
    refreshStatus();
  };

  const handleNextQueue = () => {
    if (!selectedId) return toast.error('Pilih counter dulu');
    apiCallNext({ counterId: selectedId })
      .then(res => {
        if (res.status && res.data && 'queue' in res.data) {
          toast.success('Memanggil antrian berikut');
          refreshStatus();
        } else {
          toast.error(res.message || 'Tidak ada antrian');
        }
      })
      .catch(() => toast.error('Gagal memanggil'));
  };

  const handleSkipQueue = () => {
    if (!currentQueue) return;
    apiSkipQueue(currentQueue.id)
      .then(res => {
        if (res.status) {
          toast.success('Antrian dilewati');
          refreshStatus();
        } else {
          toast.error(res.message || 'Gagal skip');
        }
      })
      .catch(() => toast.error('Gagal skip'));
  };

  const handleCompleteQueue = () => {
    if (!currentQueue) return;
    apiCompleteQueue(currentQueue.id)
      .then(res => {
        if (res.status) {
          toast.success('Antrian selesai');
          refreshStatus();
        } else {
          toast.error(res.message || 'Gagal selesaikan');
        }
      })
      .catch(() => toast.error('Gagal selesaikan'));
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          OPERATOR COUNTER
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Panel untuk operator counter melayani antrian pengunjung
        </p>

        <Select
          label="Pilih Counter"
          fullWidth
          options={[
            { value: "", label: "Pilih Counter", disabled: true },
            ...activeCounters.map((counter) => ({
              value: counter.id.toString(),
              label: counter.name,
              disabled: false,
            })),
          ]}
          value={selectedId ? String(selectedId) : ""}
          onChange={handleCounterChange}
        />
      </Card>

      {selectedCounter ? (
        <div className="space-y-6">
          <CurrentQueueDisplay
            counterName={selectedCounter.name}
            queueNumber={currentQueue?.queueNumber || selectedCounter.currentQueue || 0}
            status={currentQueue ? 'CALLED' : 'RELEASED'}
          />

          <div className="flex gap-4">
            <Button
              fullWidth
              leftIcon={
                <span className="material-symbols-outlined">arrow_forward</span>
              }
              onClick={handleNextQueue}
              isLoading={false}
              disabled={isLoading}
            >
              Panggil Antrian Berikutnya
            </Button>

            {currentQueue && (
              <Button
                fullWidth
                variant="danger"
                leftIcon={
                  <span className="material-symbols-outlined">skip_next</span>
                }
                onClick={handleSkipQueue}
                isLoading={false}
                disabled={false}
              >
                Lewati Antrian
              </Button>
            )}
            {currentQueue && (
              <Button
                fullWidth
                variant="primary"
                leftIcon={
                  <span className="material-symbols-outlined">check_circle</span>
                }
                onClick={handleCompleteQueue}
                isLoading={false}
                disabled={false}
              >
                Selesaikan
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Card variant="outline" className="text-center py-8 text-gray-500">
          Silahkan pilih counter untuk mulai melayani antrian
        </Card>
      )}
    </div>
  );
};

export default CounterOperator;
