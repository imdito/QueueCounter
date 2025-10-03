"use client";
import React, { useState, useMemo } from "react";
import { Counter as BackendCounter } from "@/services/counter/api.service";
import { ICounter } from "@/interfaces/services/counter.interface";
import { 
  useGetCounters,
  useCreateCounter,
  useUpdateCounter,
  useDeleteCounter,
  useToggleCounter
} from "@/services/counter/wrapper.service";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import CounterCard from "../molecules/CounterCard";
import CounterForm from "../molecules/CounterForm";

interface CounterManagerProps {
  className?: string;
}

const CounterManager: React.FC<CounterManagerProps> = ({ className }) => {
  const [isAddingCounter, setIsAddingCounter] = useState(false);
  const [editingCounter, setEditingCounter] = useState<BackendCounter | null>(null);
  const [selectedCounter, setSelectedCounter] = useState<ICounter | null>(null);

  // Hooks
  const { data: countersRes, isLoading } = useGetCounters();
  const createCounter = useCreateCounter();
  const updateCounter = useUpdateCounter();
  const deleteCounter = useDeleteCounter();
  const toggleCounter = useToggleCounter();

  // Derived counters
  const counters: BackendCounter[] = useMemo(() => {
    if (countersRes?.data && 'counters' in countersRes.data) {
      return (countersRes.data.counters as BackendCounter[]);
    }
    return [];
  }, [countersRes]);

  interface CounterFormInput {
    name: string;
    description?: string;
    isActive?: boolean;
    estimatedServiceTime?: number | string;
    max_queue?: number | string;
  }

  const handleSubmit = (data: CounterFormInput) => {
    if (editingCounter) {
      updateCounter.mutate({ id: editingCounter.id, data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        estimatedServiceTime: Number(data.estimatedServiceTime) || 300,
        maxQueue: typeof data.max_queue === 'string' ? Number(data.max_queue) : (data.max_queue ?? editingCounter.maxQueue)
      }} , {
        onSuccess: (res) => {
          if (res.status) {
            setEditingCounter(null);
            setIsAddingCounter(false);
          }
        }
      });
    } else {
      createCounter.mutate({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        estimatedServiceTime: Number(data.estimatedServiceTime) || 300,
        maxQueue: typeof data.max_queue === 'string' ? Number(data.max_queue) : data.max_queue
      }, {
        onSuccess: (res) => {
          if (res.status) {
            setIsAddingCounter(false);
          }
        }
      });
    }
  };

  const handleCounterClick = (counter: ICounter) => {
    setSelectedCounter(prev => prev?.id === counter.id ? null : counter);
  };

  const handleEditCounter = () => {
    if (!selectedCounter) return;
    const backend = counters.find(c => c.id === selectedCounter.id) || null;
    setEditingCounter(backend);
    setIsAddingCounter(true);
  };

  const handleDeleteCounter = () => {
    if (!selectedCounter) return;
    deleteCounter.mutate(selectedCounter.id, {
      onSuccess: (res) => {
        if (res.status) {
          setSelectedCounter(null);
        }
      }
    });
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manajemen Counter
            </h2>
            <p className="text-gray-600 mt-1">Kelola counter/loket pelayanan</p>
          </div>
          {!isAddingCounter && !editingCounter && (
            <Button
              onClick={() => setIsAddingCounter(true)}
              leftIcon={<span className="material-symbols-outlined">add</span>}
            >
              Tambah Counter
            </Button>
          )}
        </div>
      </Card>

      {isAddingCounter || editingCounter ? (
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            {editingCounter ? "Edit Counter" : "Tambah Counter Baru"}
          </h3>
          <CounterForm
            counter={editingCounter ? {
              id: editingCounter.id,
              name: editingCounter.name,
              currentQueue: editingCounter.currentQueueNumber || 0,
              maxQueue: editingCounter.maxQueue || 0,
              isActive: editingCounter.isActive,
              createdAt: editingCounter.createdAt,
              updatedAt: editingCounter.updatedAt,
              deletedAt: editingCounter.deletedAt
            } : undefined}
            onSubmit={handleSubmit}
            isLoading={createCounter.isPending || updateCounter.isPending}
            isEditMode={!!editingCounter}
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingCounter(false);
                setEditingCounter(null);
              }}
            >
              Batal
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {selectedCounter && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={handleEditCounter}
                leftIcon={<span className="material-symbols-outlined">edit</span>}
              >Edit</Button>
              <Button
                variant="danger"
                onClick={handleDeleteCounter}
                isLoading={deleteCounter.isPending}
                leftIcon={
                  <span className="material-symbols-outlined">delete</span>
                }
              >
                Hapus
              </Button>
              <Button
                variant={selectedCounter.isActive ? 'secondary' : 'primary'}
                onClick={() => toggleCounter.mutate(selectedCounter.id)}
                isLoading={toggleCounter.isPending}
                leftIcon={<span className="material-symbols-outlined">power_settings_new</span>}
              >{selectedCounter.isActive ? 'Nonaktifkan' : 'Aktifkan'}</Button>
            </div>
          )}

          {isLoading && (
            <Card variant="outline" className="text-center py-8 text-gray-500">Memuat data counter...</Card>
          )}

          {!isLoading && counters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {counters.map((counter) => (
                <CounterCard
                  key={counter.id}
                  counter={{
                    id: counter.id,
                    name: counter.name,
                    currentQueue: counter.currentQueueNumber || 0,
                    maxQueue: counter.maxQueue || 0,
                    isActive: counter.isActive,
                    createdAt: counter.createdAt,
                    updatedAt: counter.updatedAt,
                    deletedAt: counter.deletedAt
                  }}
                  isSelected={selectedCounter?.id === counter.id}
                  onClick={handleCounterClick}
                />
              ))}
            </div>
          ) : (
            <Card variant="outline" className="text-center py-8 text-gray-500">
              Belum ada counter. Klik &apos;Tambah Counter&apos; untuk membuat counter baru.
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CounterManager;
