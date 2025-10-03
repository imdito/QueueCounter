import axios from 'axios';

// Base API URL from environment (e.g., http://localhost:5000/api/v1)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_BASE_PATH = '/queue';

// Queue API interfaces
export interface Queue {
  id: number;
  queueNumber: number;
  customerName: string | null;
  customerContact: string | null;
  counterId: number | null;
  status: 'WAITING' | 'BEING_SERVED' | 'COMPLETED' | 'SKIPPED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  estimatedWaitTime: number | null;
  actualServiceTime: number | null;
  notes: string | null;
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface QueueStatus {
  waiting: number;
  beingServed: number;
  completed: number;
  totalToday: number;
  currentlyServing: Queue[];
  nextWaiting: Queue[];
}

export interface QueueResponse {
  status: boolean;
  message: string;
  data: { queue: Queue } | { queues: Queue[] } | QueueStatus | null;
}

export interface CallNextRequest {
  counterId: number;
}

// Get authorization header from cookies (client-side)
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

// Get all queues
export const apiGetQueues = async (): Promise<QueueResponse> => {
  const response = await axios.get(`${BASE_URL}${API_BASE_PATH}/`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get queue by ID
export const apiGetQueue = async (id: number): Promise<QueueResponse> => {
  const response = await axios.get(`${BASE_URL}${API_BASE_PATH}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Generate new queue ticket
export const apiGenerateTicket = async (): Promise<QueueResponse> => {
  const response = await axios.post(`${BASE_URL}${API_BASE_PATH}/generate-ticket`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Call next queue for a counter
export const apiCallNext = async (data: CallNextRequest): Promise<QueueResponse> => {
  const response = await axios.post(`${BASE_URL}${API_BASE_PATH}/call-next`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Complete queue service
export const apiCompleteQueue = async (id: number): Promise<QueueResponse> => {
  const response = await axios.patch(`${BASE_URL}${API_BASE_PATH}/${id}/complete`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Skip queue
export const apiSkipQueue = async (id: number): Promise<QueueResponse> => {
  const response = await axios.patch(`${BASE_URL}${API_BASE_PATH}/${id}/skip`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get queue status
export const apiGetQueueStatus = async (): Promise<QueueResponse> => {
  const response = await axios.get(`${BASE_URL}${API_BASE_PATH}/status`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Find queue by number
export const apiFindQueue = async (number: number): Promise<QueueResponse> => {
  const response = await axios.get(`${BASE_URL}${API_BASE_PATH}/find`, {
    params: { number },
    headers: getAuthHeader()
  });
  return response.data;
};
