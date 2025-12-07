"use client";

import { useEffect, useState } from "react";
import type { Contestant } from "@/lib/store";

export default function AdminPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contestants")
      .then(r => r.json())
      .then(d => setContestants(d.contestants ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contestants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Failed");
      } else {
        setContestants(data.contestants ?? []);
        setName("");
      }
    } catch (err) {
      setError("Error");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-semibold">Admin - Dot Voting</h1>
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-gray-200 p-6">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Add contestant"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 text-xl font-semibold">Contestants ({contestants.length})</h2>
          {contestants.map(c => (
            <div key={c.id} className="border-t border-gray-100 py-2">
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">Votes: {c.votes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
