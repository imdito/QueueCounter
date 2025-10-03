"use client";
// Wrapper disederhanakan menyesuaikan API queue sederhana baru
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GenericError { message?: string }
import toast from "react-hot-toast";
import {
  apiGenerateTicket,
  apiGetQueues,
  apiGetQueueStatus,
  apiCallNext,
  apiCompleteQueue,
  apiSkipQueue,
} from "./api.service";

const QUEUE_KEYS = {
  all: ["queues"] as const,
  status: ["queues", "status"] as const,
};

export const useGetQueues = () => {
  return useQuery({
    queryKey: QUEUE_KEYS.all,
    queryFn: () => apiGetQueues(),
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });
};

export const useGetQueueStatus = () => {
  return useQuery({
    queryKey: QUEUE_KEYS.status,
    queryFn: () => apiGetQueueStatus(),
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });
};

export const useGenerateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiGenerateTicket(),
    onSuccess: (response) => {
      const toastId = toast.loading("Memproses tiket...", { duration: 3000 });
      if (response?.status) {
        toast.success("Tiket antrian dibuat", { id: toastId });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.status });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      } else {
        toast.error(response?.message || "Gagal membuat tiket", { id: toastId });
      }
    },
    onError: (error: unknown) => {
  const msg = typeof error === 'object' && error && 'message' in error ? (error as GenericError).message : 'Gagal membuat tiket';
      toast.error(String(msg));
    },
  });
};

export const useCallNext = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (counterId: number) => apiCallNext({ counterId }),
    onSuccess: (response) => {
      const toastId = toast.loading("Memanggil antrian berikut...", { duration: 3000 });
      if (response?.status) {
        toast.success("Antrian berikut dipanggil", { id: toastId });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.status });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      } else {
        toast.error(response?.message || "Gagal memanggil antrian", { id: toastId });
      }
    },
    onError: (error: unknown) => {
  const msg = typeof error === 'object' && error && 'message' in error ? (error as GenericError).message : 'Gagal memanggil antrian';
      toast.error(String(msg));
    },
  });
};

export const useCompleteQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (queueId: number) => apiCompleteQueue(queueId),
    onSuccess: (response) => {
      const toastId = toast.loading("Menyelesaikan antrian...", { duration: 3000 });
      if (response?.status) {
        toast.success("Antrian selesai", { id: toastId });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.status });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      } else {
        toast.error(response?.message || "Gagal menyelesaikan antrian", { id: toastId });
      }
    },
    onError: (error: unknown) => {
  const msg = typeof error === 'object' && error && 'message' in error ? (error as GenericError).message : 'Gagal menyelesaikan antrian';
      toast.error(String(msg));
    },
  });
};

export const useSkipQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (queueId: number) => apiSkipQueue(queueId),
    onSuccess: (response) => {
      const toastId = toast.loading("Melewati antrian...", { duration: 3000 });
      if (response?.status) {
        toast.success("Antrian dilewati", { id: toastId });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.status });
        qc.invalidateQueries({ queryKey: QUEUE_KEYS.all });
      } else {
        toast.error(response?.message || "Gagal melewati antrian", { id: toastId });
      }
    },
    onError: (error: unknown) => {
  const msg = typeof error === 'object' && error && 'message' in error ? (error as GenericError).message : 'Gagal melewati antrian';
      toast.error(String(msg));
    },
  });
};
