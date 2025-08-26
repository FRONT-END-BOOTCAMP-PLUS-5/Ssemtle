'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface CalendarResponse {
  days: Array<{
    date: string;
    total: number;
    correct: number;
    accuracy: number;
    solves: unknown[];
  }>;
  monthTotal: number;
  monthCorrect: number;
  monthAccuracy: number;
}

export default function TestCalendarPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API call failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Calendar API Test</h1>
        <p>Please log in first to test the API</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Calendar API Test</h1>

      <div className="mb-8 space-y-4">
        <div>
          <button
            onClick={() => testAPI('/api/solves/calendar?month=2025-08')}
            className="mr-4 rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            Test Current Month: 2025-08
          </button>
        </div>

        <div>
          <button
            onClick={() => testAPI('/api/solves/calendar?month=2025-07')}
            className="mr-4 rounded bg-indigo-500 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            Test Last Month: 2025-07
          </button>
        </div>

        <div>
          <button
            onClick={() =>
              testAPI(
                '/api/solves/calendar?from=2025-08-01T00:00:00Z&to=2025-08-13T23:59:59Z'
              )
            }
            className="mr-4 rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            Test Date Range: Aug 1-13, 2025
          </button>
        </div>

        <div>
          <button
            onClick={() =>
              testAPI('/api/solves/calendar?month=2025-08&only=wrong')
            }
            className="mr-4 rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            Test Wrong Only: 2025-08
          </button>
        </div>

        <div>
          <button
            onClick={() => testAPI('/api/solves/calendar?month=2025-06')}
            className="mr-4 rounded bg-purple-500 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading}
          >
            Test June 2025
          </button>
        </div>
      </div>

      {loading && <div className="text-blue-600">Loading...</div>}

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="rounded bg-gray-100 p-4">
          <h2 className="mb-2 text-lg font-semibold">API Response:</h2>
          <pre className="overflow-auto rounded border bg-white p-4 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.days && (
            <div className="mt-4">
              <h3 className="font-semibold">Summary:</h3>
              <p>Days with data: {result.days.length}</p>
              <p>Month total: {result.monthTotal}</p>
              <p>Month correct: {result.monthCorrect}</p>
              <p>Month accuracy: {(result.monthAccuracy * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
