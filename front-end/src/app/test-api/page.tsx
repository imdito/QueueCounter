'use client';

import { useState, useEffect } from 'react';
import { apiGetCounters, apiCreateCounter, Counter } from '@/services/counter/api.service';
import { apiGetQueues, apiGenerateTicket, apiGetQueueStatus, Queue, QueueStatus } from '@/services/queue/queue.service';

export default function TestApiPage() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Test counter endpoints
  const testGetCounters = async () => {
    setLoading(true);
    try {
      const response = await apiGetCounters();
      if (response.status && 'counters' in response.data!) {
        setCounters((response.data as { counters: Counter[] }).counters);
        setMessage('✅ Counters loaded successfully');
      } else {
        setMessage('❌ Failed to load counters: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error loading counters: ' + String(error));
    }
    setLoading(false);
  };

  const testCreateCounter = async () => {
    setLoading(true);
    try {
      const response = await apiCreateCounter({
        name: `Counter ${Date.now()}`,
        description: 'Test counter',
        estimatedServiceTime: 300
      });
      if (response.status) {
        setMessage('✅ Counter created successfully');
        testGetCounters(); // Refresh list
      } else {
        setMessage('❌ Failed to create counter: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error creating counter: ' + String(error));
    }
    setLoading(false);
  };

  // Test queue endpoints
  const testGetQueues = async () => {
    setLoading(true);
    try {
      const response = await apiGetQueues();
      if (response.status && 'queues' in response.data!) {
        setQueues((response.data as { queues: Queue[] }).queues);
        setMessage('✅ Queues loaded successfully');
      } else {
        setMessage('❌ Failed to load queues: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error loading queues: ' + String(error));
    }
    setLoading(false);
  };

  const testGenerateTicket = async () => {
    setLoading(true);
    try {
      const response = await apiGenerateTicket();
      if (response.status) {
        setMessage('✅ Ticket generated successfully');
        testGetQueues(); // Refresh list
        testGetQueueStatus(); // Refresh status
      } else {
        setMessage('❌ Failed to generate ticket: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error generating ticket: ' + String(error));
    }
    setLoading(false);
  };

  const testGetQueueStatus = async () => {
    setLoading(true);
    try {
      const response = await apiGetQueueStatus();
      if (response.status) {
        setQueueStatus(response.data as QueueStatus);
        setMessage('✅ Queue status loaded successfully');
      } else {
        setMessage('❌ Failed to load queue status: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error loading queue status: ' + String(error));
    }
    setLoading(false);
  };

  // Load initial data
  useEffect(() => {
    testGetCounters();
    testGetQueues();
    testGetQueueStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          🧪 Backend API Test Page
        </h1>
        
        {/* Status Message */}
        {message && (
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Counters Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔢 Counter Management</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={testGetCounters}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '⏳ Loading...' : '📋 Get Counters'}
            </button>
            <button
              onClick={testCreateCounter}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '⏳ Creating...' : '➕ Create Counter'}
            </button>
          </div>
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Counters ({counters.length}):</h3>
            {counters.length === 0 ? (
              <p className="text-gray-500">No counters found</p>
            ) : (
              <div className="space-y-2">
                {counters.map((counter) => (
                  <div key={counter.id} className="bg-white p-3 rounded border">
                    <div className="font-medium">#{counter.id} - {counter.name}</div>
                    <div className="text-sm text-gray-600">
                      Status: {counter.isActive ? '🟢 Active' : '🔴 Inactive'} | 
                      Current Queue: {counter.currentQueueNumber || 'None'} |
                      Est. Service Time: {counter.estimatedServiceTime}s
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Queue Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🎫 Queue Management</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={testGetQueues}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '⏳ Loading...' : '📋 Get Queues'}
            </button>
            <button
              onClick={testGenerateTicket}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '⏳ Generating...' : '🎫 Generate Ticket'}
            </button>
            <button
              onClick={testGetQueueStatus}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? '⏳ Loading...' : '📊 Get Status'}
            </button>
          </div>

          {/* Queue Status */}
          {queueStatus && (
            <div className="mb-4 p-4 bg-blue-50 rounded border">
              <h3 className="font-medium mb-2">📊 Queue Status:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-2 rounded">
                  <div className="font-medium text-orange-600">⏳ Waiting</div>
                  <div className="text-lg">{queueStatus.waiting}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-medium text-blue-600">🔄 Being Served</div>
                  <div className="text-lg">{queueStatus.beingServed}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-medium text-green-600">✅ Completed</div>
                  <div className="text-lg">{queueStatus.completed}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-medium text-gray-600">📈 Total Today</div>
                  <div className="text-lg">{queueStatus.totalToday}</div>
                </div>
              </div>
            </div>
          )}

          <div className="border rounded p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Queue List ({queues.length}):</h3>
            {queues.length === 0 ? (
              <p className="text-gray-500">No queues found</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {queues.map((queue) => (
                  <div key={queue.id} className="bg-white p-3 rounded border">
                    <div className="font-medium">
                      🎫 #{queue.queueNumber} - ID: {queue.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: {queue.status} | 
                      Priority: {queue.priority} | 
                      Counter: {queue.counterId || 'None'} |
                      Created: {new Date(queue.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Server Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🖥️ Server Information</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Backend URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5000</code></p>
            <p>Frontend URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:4000</code></p>
            <p>Test this page to verify all backend features are connected to frontend</p>
          </div>
        </div>
      </div>
    </div>
  );
}