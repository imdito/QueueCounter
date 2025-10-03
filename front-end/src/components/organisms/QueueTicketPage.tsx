"use client";
import { FC, useState } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import { useGenerateTicket } from "@/services/queue/wrapper.service";
import { QueueResponse } from "@/services/queue/queue.service";

interface QueueWrapper { queue?: { counterId?: number | null; queueNumber: number; estimatedWaitTime?: number | null } }
import { useCounterAppStore } from "@/stores/global-states/counter/counter-app.store";
import toast from "react-hot-toast";

interface QueueTicketProps {
  className?: string;
}

const QueueTicketPage: FC<QueueTicketProps> = ({ className }) => {
  const [isClaimSuccess, setIsClaimSuccess] = useState(false);
  const { claimedQueue, setClaimedQueue } = useCounterAppStore();
    const { mutate: generateTicket } = useGenerateTicket();

  const handleClaim = () => {
      generateTicket(undefined, {
        onSuccess: (res: QueueResponse) => {
          // res.data dapat berupa: { queue }, { queues }, QueueStatus, atau null
          const maybeQueueObj = res?.data as unknown;
          let queue: { counterId?: number | null; queueNumber: number; estimatedWaitTime?: number | null } | null = null;
          if (maybeQueueObj && typeof maybeQueueObj === 'object' && 'queue' in (maybeQueueObj as QueueWrapper)) {
            queue = (maybeQueueObj as QueueWrapper).queue ?? null;
          }
          if (!res?.status || !queue) {
            setIsClaimSuccess(false);
            return toast.error("Gagal membuat tiket");
          }
          setClaimedQueue({
            counterId: queue.counterId ?? 0,
            counterName: queue.counterId ? `Counter ${queue.counterId}` : "-",
            estimatedWaitTime: queue.estimatedWaitTime || 0,
            position: queue.queueNumber,
            queueNumber: queue.queueNumber,
          });
          setIsClaimSuccess(true);
        },
      });
  };

  const handleReleaseQueue = () => {
      setIsClaimSuccess(false);
      setClaimedQueue(null);
      toast.success("Tiket dilepas. Ambil lagi jika perlu.");
  };

  return (
    <Card className={className}>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sistem Antrian</h2>

        {!isClaimSuccess ? (
          <div className="flex flex-col items-center w-full">
            <p className="text-gray-600 mb-8 text-center">
              Ambil nomor antrian Anda dengan menekan tombol di bawah ini
            </p>
            <Button
              size="lg"
              fullWidth
              onClick={handleClaim}
              leftIcon={
                <span className="material-symbols-outlined">
                  confirmation_number
                </span>
              }
            >
              Ambil Nomor Antrian
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="text-gray-600 mb-2">Nomor Antrian Anda</div>
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {claimedQueue?.queueNumber}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Posisi:</span>
                <span className="font-medium">{claimedQueue?.position}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Estimasi waktu tunggu:</span>
                <span className="font-medium">
              {claimedQueue?.estimatedWaitTime} menit
                </span>
              </div>
            </div>

            <Button variant="outline" onClick={handleReleaseQueue}>
              Ambil Nomor Baru
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QueueTicketPage;
