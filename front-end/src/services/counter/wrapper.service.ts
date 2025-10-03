"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetCounters, apiCreateCounter, apiUpdateCounter, apiDeleteCounter, apiToggleCounterStatus, CounterResponse, CreateCounterRequest, UpdateCounterRequest } from "./api.service";
import toast from "react-hot-toast";

const COUNTER_KEYS = {
  all: ["counters"] as const,
};

const safeErrorMessage = (e: unknown) => {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message?: unknown }).message);
  return 'Unknown error';
};

export const useGetCounters = () => {
  return useQuery<CounterResponse>({
    queryKey: COUNTER_KEYS.all,
    queryFn: () => apiGetCounters(),
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCounterRequest) => apiCreateCounter(payload),
    onSuccess: (res) => {
      if (res.status) {
        toast.success("Counter dibuat");
        qc.invalidateQueries({ queryKey: COUNTER_KEYS.all });
      } else {
        toast.error(res.message || 'Gagal membuat counter');
      }
    },
    onError: (e: unknown) => toast.error('Gagal membuat counter: ' + safeErrorMessage(e))
  });
};

export const useUpdateCounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCounterRequest }) => apiUpdateCounter(id, data),
    onSuccess: (res) => {
      if (res.status) {
        toast.success("Counter diperbarui");
        qc.invalidateQueries({ queryKey: COUNTER_KEYS.all });
      } else {
        toast.error(res.message || 'Gagal update counter');
      }
    },
    onError: (e: unknown) => toast.error('Gagal update counter: ' + safeErrorMessage(e))
  });
};

export const useDeleteCounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDeleteCounter(id),
    onSuccess: (res) => {
      if (res.status) {
        toast.success("Counter dihapus");
        qc.invalidateQueries({ queryKey: COUNTER_KEYS.all });
      } else {
        toast.error(res.message || 'Gagal hapus counter');
      }
    },
    onError: (e: unknown) => toast.error('Gagal hapus counter: ' + safeErrorMessage(e))
  });
};

export const useToggleCounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiToggleCounterStatus(id),
    onSuccess: (res) => {
      if (res.status) {
        toast.success("Status counter diubah");
        qc.invalidateQueries({ queryKey: COUNTER_KEYS.all });
      } else {
        toast.error(res.message || 'Gagal ubah status');
      }
    },
    onError: (e: unknown) => toast.error('Gagal ubah status: ' + safeErrorMessage(e))
  });
};
