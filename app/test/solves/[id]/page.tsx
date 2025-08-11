'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function TestSolveUpdatePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);
    setStatus(null);

    try {
      const res = await fetch(`/api/solves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      setStatus(res.status);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.error === 'string' ? data.error : 'Request failed'
        );
      }
      setResult(data);
    } catch {
      setError('Network or unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">
        API Test: PUT /api/solves/[id]
      </h1>
      <p className="text-gray-700 mb-6">
        Route param id: <code>{id}</code>
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">userInput</label>
          <textarea
            className="w-full p-3 border rounded-md font-mono"
            rows={4}
            placeholder="Enter userInput to update this solve"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !id || !userInput.trim()}
          className={`px-4 py-2 rounded text-white ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Sending…' : 'Send PUT'}
        </button>

        {status !== null && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <div className="mb-2 text-sm">Status: {status}</div>
            {error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
            {status === 401 && (
              <div className="mt-2 text-sm text-gray-600">
                You appear unauthenticated. Please sign in and retry.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
