"use client";
import { IQueue } from "@/interfaces/services/queue.interface";
import React, { useState, useEffect, useCallback } from "react";
import { apiFindQueue } from "@/services/queue/api.service";
import { mapBackendQueueStatus } from "@/utils/queueStatus.util";
import toast from "react-hot-toast";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import QueueCard from "../molecules/QueueCard";
import Input from "../atoms/Input";

interface QueueStatusCheckerProps {
  className?: string;
}

const QueueStatusChecker: React.FC<QueueStatusCheckerProps> = ({
  className,
}) => {
  const [queueNumber, setQueueNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [queueDetails, setQueueDetails] = useState<IQueue | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchQueue = useCallback((num: number, silent = false) => {
    if (!silent) setIsSubmitting(true);
    apiFindQueue(num)
      .then((res) => {
        if (res.status && res.data && 'queue' in res.data) {
          type BackendQueue = { id:number; queueNumber:number; status:string; counterId:number|null; createdAt:string; updatedAt:string };
          const raw = (res.data as { queue: BackendQueue }).queue;
          const mapped: IQueue = {
            id: raw.id,
            queueNumber: raw.queueNumber,
            status: mapBackendQueueStatus(raw.status),
            counter: raw.counterId ? { id: raw.counterId, name: `Counter ${raw.counterId}` } : null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
          };
          setQueueDetails(mapped);
          setNotFound(false);
        } else {
          setQueueDetails(null);
          setNotFound(true);
        }
      })
      .catch(() => {
        setQueueDetails(null);
        setNotFound(true);
      })
      .finally(() => {
        if (!silent) setIsSubmitting(false);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num <= 0) {
      toast.error("Nomor tidak valid");
      return;
    }
    setQueueNumber(String(num));
    fetchQueue(num);
  };

  // Polling untuk update status otomatis sampai status final (SERVED/SKIPPED/RESET)
  useEffect(() => {
    if (!queueNumber || !autoRefresh) return;
    const num = parseInt(queueNumber, 10);
    if (isNaN(num)) return;
    if (queueDetails && ["SERVED", "SKIPPED", "RESET"].includes(queueDetails.status)) return; // final
    const interval = setInterval(() => fetchQueue(num, true), 4000);
    return () => clearInterval(interval);
  }, [queueNumber, autoRefresh, queueDetails, fetchQueue]);

  const handleReleaseQueue = () => {
    toast.success("Nomor antrian dihapus dari tampilan lokal");
    setQueueDetails(null);
    setQueueNumber("");
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Cek Status Antrian
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Masukkan nomor antrian Anda untuk memeriksa status
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Nomor Antrian"
                placeholder="Masukkan nomor antrian"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                leftIcon={<span className="material-symbols-outlined">confirmation_number</span>}
                fullWidth
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} leftIcon={<span className="material-symbols-outlined">search</span>}>
                Cek Status
              </Button>
            </div>
          </div>
          {queueDetails && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto refresh 4s
              </label>
              <span>Terakhir diperbarui: {new Date(queueDetails.updatedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </form>
      </Card>

      {queueDetails ? (
        <div className="space-y-4">
          <QueueCard queue={queueDetails} />

          {queueDetails.status === "CLAIMED" && (
            <Button
              variant="danger"
              fullWidth
              onClick={handleReleaseQueue}
              leftIcon={
                <span className="material-symbols-outlined">exit_to_app</span>
              }
            >
              Lepaskan Nomor Antrian
            </Button>
          )}
        </div>
      ) : (
        notFound &&
        queueNumber && (
          <Card variant="outline" className="text-center py-6 text-gray-500">
            Nomor antrian <strong>{queueNumber}</strong> tidak ditemukan.
          </Card>
        )
      )}
    </div>
  );
};

export default QueueStatusChecker;
