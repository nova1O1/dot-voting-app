'use client';
import { useState, useEffect } from 'react';

type Contestant = { id: string; name: string };

export default function VotePage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const MAX_TOTAL = 5;
  const MAX_PER = 3;

  useEffect(() => {
    loadContestants();
  }, []);

  const loadContestants = async () => {
    try {
      const res = await fetch('/api/contestants');
      const data = await res.json();
      setContestants(data.contestants || []);
      const initialVotes: Record<string, number> = {};
      (data.contestants || []).forEach((c: Contestant) => {
        initialVotes[c.id] = 0;
      });
      setVotes(initialVotes);
    } catch (err) {
      setError('Failed to load contestants');
    } finally {
      setLoading(false);
    }
  };

  const currentTotal = Object.values(votes).reduce((a, b) => a + b, 0);
  const remaining = MAX_TOTAL - currentTotal;

  const handleIncrement = (id: string) => {
    if (currentTotal < MAX_TOTAL && votes[id] < MAX_PER) {
      setVotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
    }
  };

  const handleDecrement = (id: string) => {
    if (votes[id] > 0) {
      setVotes(prev => ({ ...prev, [id]: prev[id] - 1 }));
    }
  };

  const handleSubmit = async () => {
    if (currentTotal === 0) {
      setError('Please allocate at least 1 vote');
      return;
    }
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit votes');
      }
    } catch (err) {
      setError('Error submitting votes');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-4xl font-light">Thank you!</h1>
          <p className="text-gray-600">Your votes have been recorded.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-light mb-2">Dot Voting</h1>
        <p className="text-gray-600 mb-6">You have {MAX_TOTAL} votes. Maximum {MAX_PER} per contestant.</p>

        <div className="mb-6 p-4 bg-gray-50 rounded text-sm">
          <p>Remaining votes: <strong>{remaining}/{MAX_TOTAL}</strong></p>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {contestants.length === 0 ? (
          <p className="text-gray-600">No contestants available yet.</p>
        ) : (
          <div className="space-y-4 mb-8">
            {contestants.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                <h2 className="text-lg font-medium">{c.name}</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrement(c.id)}
                    disabled={votes[c.id] === 0}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{votes[c.id]}</span>
                  <button
                    onClick={() => handleIncrement(c.id)}
                    disabled={currentTotal >= MAX_TOTAL || votes[c.id] >= MAX_PER}
                    className="px-3 py-1 border rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={currentTotal === 0 || currentTotal > MAX_TOTAL}
          className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 font-medium"
        >
          Submit Votes
        </button>
      </div>
    </div>
  );
}
