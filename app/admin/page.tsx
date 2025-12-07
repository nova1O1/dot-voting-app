'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Contestant = { id: string; name: string };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [newName, setNewName] = useState('');
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthed) loadContestants();
  }, [isAuthed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthed(true);
      setError('');
    } else {
      setError('Wrong password');
    }
  };

  const loadContestants = async () => {
    try {
      const res = await fetch('/api/contestants');
      const data = await res.json();
      setContestants(data.contestants || []);
      loadTotals();
    } catch (err) {
      setError('Failed to load contestants');
    }
  };

  const loadTotals = async () => {
    try {
      const res = await fetch('/api/vote');
      const data = await res.json();
      setTotals(data.totals || {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (res.ok) {
        setContestants(data.contestants || []);
        setNewName('');
        loadTotals();
      } else {
        setError(data.error || 'Failed to add');
      }
    } catch (err) {
      setError('Error adding contestant');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/contestants?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      setContestants(data.contestants || []);
      loadTotals();
    } catch (err) {
      setError('Failed to remove');
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="max-w-md w-full space-y-4">
          <h1 className="text-3xl font-light">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-light mb-8">Admin Dashboard</h1>
        
        <form onSubmit={handleAddContestant} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Contestant name"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Add
          </button>
        </form>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="space-y-2">
          {contestants.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-600">{totals[c.id] || 0} votes</p>
              </div>
              <button
                onClick={() => handleRemove(c.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
