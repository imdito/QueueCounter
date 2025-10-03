'use client';

import { useState, useEffect } from 'react';
import { apiGetCounters, apiCreateCounter, apiToggleCounterStatus, Counter } from '@/services/counter/api.service';
import { apiGenerateTicket, apiCallNext, apiCompleteQueue, apiSkipQueue, apiGetQueueStatus, QueueStatus, apiGetQueues, Queue } from '@/services/queue/api.service';
import axios from 'axios';

export default function AdminDashboard() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedCounterId, setSelectedCounterId] = useState<number | null>(null);
  const [newCounterName, setNewCounterName] = useState('');
  const [message, setMessage] = useState('');

  // Load data
  const loadData = async () => {
    try {
      const [countersRes, statusRes, queuesRes] = await Promise.all([
        apiGetCounters(),
        apiGetQueueStatus(),
        apiGetQueues()
      ]);

      if (countersRes.status && 'counters' in countersRes.data!) {
        setCounters((countersRes.data as { counters: Counter[] }).counters);
      }

      if (statusRes.status) {
        setQueueStatus(statusRes.data as QueueStatus);
      }

      if (queuesRes.status && queuesRes.data && 'queues' in queuesRes.data) {
        const qData = queuesRes.data as { queues: Queue[] };
        setQueues(qData.queues);
      }
    } catch (error) {
      setMessage('❌ Error loading data: ' + String(error));
    }
  };

  // Counter management
  const handleCreateCounter = async () => {
    if (!newCounterName.trim()) {
      setMessage('❌ Please enter counter name');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCreateCounter({
        name: newCounterName,
        description: `Counter created at ${new Date().toLocaleString()}`,
        estimatedServiceTime: 300
      });

      if (response.status) {
        setMessage('✅ Counter created successfully');
        setNewCounterName('');
        loadData();
      } else {
        setMessage('❌ Failed to create counter: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error creating counter: ' + String(error));
    }
    setLoading(false);
  };

  const handleToggleCounter = async (counterId: number) => {
    setLoading(true);
    try {
      const response = await apiToggleCounterStatus(counterId);
      if (response.status) {
        setMessage('✅ Counter status toggled successfully');
        loadData();
      } else {
        setMessage('❌ Failed to toggle counter: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error toggling counter: ' + String(error));
    }
    setLoading(false);
  };

  // Queue management
  const handleGenerateTicket = async () => {
    setLoading(true);
    try {
      const response = await apiGenerateTicket();
      if (response.status) {
        setMessage('✅ New ticket generated successfully');
        loadData();
      } else {
        setMessage('❌ Failed to generate ticket: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error generating ticket: ' + String(error));
    }
    setLoading(false);
  };

  const handleCallNext = async () => {
    if (!selectedCounterId) {
      setMessage('❌ Please select a counter first');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCallNext({ counterId: selectedCounterId });
      if (response.status) {
        setMessage('✅ Next queue called successfully');
        loadData();
      } else {
        setMessage('❌ Failed to call next queue: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error calling next queue: ' + String(error));
    }
    setLoading(false);
  };

  const handleCompleteQueue = async (queueId: number) => {
    setLoading(true);
    try {
      const response = await apiCompleteQueue(queueId);
      if (response.status) {
        setMessage('✅ Queue completed successfully');
        loadData();
      } else {
        setMessage('❌ Failed to complete queue: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error completing queue: ' + String(error));
    }
    setLoading(false);
  };

  const handleSkipQueue = async (queueId: number) => {
    setLoading(true);
    try {
      const response = await apiSkipQueue(queueId);
      if (response.status) {
        setMessage('✅ Queue skipped successfully');
        loadData();
      } else {
        setMessage('❌ Failed to skip queue: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error skipping queue: ' + String(error));
    }
    setLoading(false);
  };

  // Cron actions
  const handleCleanup = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cron/cleanup`);
      setMessage('🧹 Cleanup: ' + JSON.stringify(res.data?.data || res.data));
    } catch (e) {
      setMessage('❌ Cleanup failed: ' + String(e));
    }
    setLoading(false);
  };

  const handleDailyReset = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cron/reset-daily`);
      setMessage('🔄 Daily reset: ' + JSON.stringify(res.data?.data || res.data));
      loadData();
    } catch (e) {
      setMessage('❌ Daily reset failed: ' + String(e));
    }
    setLoading(false);
  };

  // Auto refresh
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🏢 Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage counters and queues in real-time</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Status Message */}
        {message && (
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <p className="font-medium">{message}</p>
            <button 
              onClick={() => setMessage('')}
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Queue Status Overview */}
        {queueStatus && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Queue Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{queueStatus.waiting}</div>
                <div className="text-sm text-orange-700">⏳ Waiting</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{queueStatus.beingServed}</div>
                <div className="text-sm text-blue-700">🔄 Being Served</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{queueStatus.completed}</div>
                <div className="text-sm text-green-700">✅ Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{queueStatus.totalToday}</div>
                <div className="text-sm text-gray-700">📈 Total Today</div>
              </div>
            </div>
          </div>
        )}

  <div className="grid lg:grid-cols-2 gap-8">
          {/* Counter Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔢 Counter Management</h2>
            
            {/* Create Counter */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Create New Counter</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  placeholder="Counter name..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateCounter}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  ➕ Create
                </button>
              </div>
            </div>

            {/* Counter List */}
            <div className="space-y-3">
              {counters.map((counter) => (
                <div key={counter.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">#{counter.id} - {counter.name}</h4>
                      <p className="text-sm text-gray-600">{counter.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCounterId(counter.id)}
                        className={`px-3 py-1 text-xs rounded ${
                          selectedCounterId === counter.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {selectedCounterId === counter.id ? '✓ Selected' : 'Select'}
                      </button>
                      <button
                        onClick={() => handleToggleCounter(counter.id)}
                        disabled={loading}
                        className={`px-3 py-1 text-xs rounded ${
                          counter.isActive 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        } disabled:opacity-50`}
                      >
                        {counter.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: {counter.isActive ? '🟢 Active' : '🔴 Inactive'} | 
                    Current Queue: #{counter.currentQueueNumber || 'None'} | 
                    Service Time: {counter.estimatedServiceTime}s
                  </div>
                </div>
              ))}
              {counters.length === 0 && (
                <p className="text-gray-500 text-center py-4">No counters found</p>
              )}
            </div>
          </div>

          {/* Queue Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎫 Queue Management</h2>
            
            {/* Queue Actions */}
            <div className="mb-6 space-y-3">
              <button
                onClick={handleGenerateTicket}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
              >
                🎫 Generate New Ticket
              </button>
              
              <button
                onClick={handleCallNext}
                disabled={loading || !selectedCounterId}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
              >
                📢 Call Next Queue {selectedCounterId ? `(Counter #${selectedCounterId})` : '(Select Counter First)'}
              </button>
            </div>

            {/* Currently Being Served */}
            {queueStatus?.currentlyServing && queueStatus.currentlyServing.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">🔄 Currently Being Served</h3>
                <div className="space-y-2">
                  {queueStatus.currentlyServing.map((queue) => (
                    <div key={queue.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">🎫 #{queue.queueNumber}</div>
                          <div className="text-sm text-gray-600">
                            Counter: #{queue.counterId} | Started: {new Date(queue.updatedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCompleteQueue(queue.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            ✅ Complete
                          </button>
                          <button
                            onClick={() => handleSkipQueue(queue.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:opacity-50"
                          >
                            ⏭️ Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Waiting */}
            {queueStatus?.nextWaiting && queueStatus.nextWaiting.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">⏳ Next in Queue</h3>
                <div className="space-y-2">
                  {queueStatus.nextWaiting.map((queue, index) => (
                    <div key={queue.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            🎫 #{queue.queueNumber} 
                            {index === 0 && <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded">NEXT</span>}
                          </div>
                          <div className="text-sm text-gray-600">
                            Priority: {queue.priority} | Created: {new Date(queue.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!queueStatus?.nextWaiting || queueStatus.nextWaiting.length === 0) && 
             (!queueStatus?.currentlyServing || queueStatus.currentlyServing.length === 0) && (
              <p className="text-gray-500 text-center py-8">No active queues</p>
            )}

            {/* Queue List */}
            <div className="mt-8">
              <h3 className="font-medium mb-3">📋 All Queues (Today)</h3>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {queues.slice(-50).reverse().map(q => (
                  <div key={q.id} className="text-xs flex justify-between bg-gray-50 border rounded px-2 py-1">
                    <span>#{q.queueNumber}</span>
                    <span>{q.status}</span>
                    <span>{q.counterId ? 'Counter ' + q.counterId : '-'}</span>
                    <span>{new Date(q.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
                {queues.length === 0 && <p className="text-gray-400 text-xs">No queues yet</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">ℹ️ System Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Backend Status:</strong> 🟢 Connected (localhost:5000)</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Auto Refresh:</strong> Every 5 seconds</p>
              <p><strong>Available Features:</strong> All backend features integrated ✅</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={handleCleanup} disabled={loading} className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm disabled:opacity-50">🧹 Cleanup Completed (24h+)</button>
            <button onClick={handleDailyReset} disabled={loading} className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm disabled:opacity-50">🔄 Daily Reset Counters</button>
          </div>
        </div>
      </div>
    </div>
  );
}