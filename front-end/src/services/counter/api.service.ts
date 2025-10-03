import axios from 'axios';

// Base API URL from environment (e.g., http://localhost:5000/api/v1)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_BASE_PATH = '/counter';

// Counter API interfaces
export interface Counter {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  currentQueueNumber: number;
  currentQueueId: number | null;
  estimatedServiceTime: number;
  maxQueue?: number;
  operatorId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCounterRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  estimatedServiceTime?: number;
  maxQueue?: number;
}

export interface UpdateCounterRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  estimatedServiceTime?: number;
  maxQueue?: number;
  operatorId?: number | null;
}

export interface CounterResponse {
  status: boolean;
  message: string;
  data: { counter: Counter } | { counters: Counter[] } | null;
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

// Get all counters
export const apiGetCounters = async (): Promise<CounterResponse> => {
  const response = await axios.get(`${BASE_URL}${API_BASE_PATH}/`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get counter by ID
export const apiGetCounter = async (id: number): Promise<CounterResponse> => {
  const response = await axios.get(`${BASE_URL}${API_BASE_PATH}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Create new counter
export const apiCreateCounter = async (data: CreateCounterRequest): Promise<CounterResponse> => {
  const response = await axios.post(`${BASE_URL}${API_BASE_PATH}/`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update counter
export const apiUpdateCounter = async (id: number, data: UpdateCounterRequest): Promise<CounterResponse> => {
  const response = await axios.put(`${BASE_URL}${API_BASE_PATH}/${id}`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Delete counter
export const apiDeleteCounter = async (id: number): Promise<CounterResponse> => {
  const response = await axios.delete(`${BASE_URL}${API_BASE_PATH}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Toggle counter status
export const apiToggleCounterStatus = async (id: number): Promise<CounterResponse> => {
  const response = await axios.patch(`${BASE_URL}${API_BASE_PATH}/${id}/toggle-status`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};