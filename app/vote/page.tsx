"use client";

import { useEffect, useMemo, useState } from "react";
import type { Contestant } from "@/lib/store";

const MAX_TOTAL = 5;
const MAX_PER = 3;

export default function VotePage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/contestants")
      .then(r => r.json())
      .then(d => setContestants(d.contestants ?? []));
  }, []);

  const total = useMemo(() => Object.values(votes).reduce((a, b) => a + b, 0), [votes]);
  const remaining = MAX_TOTAL - total;

  const increment = (id: string) => {
    if (votes[id] === undefined || votes[id] < MAX_PER) {
      if (remaining > 0) {
        setVotes(v => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
      }
    }
  };

  const decrement = (id: string) => {
    if ((votes[id] ?? 0) > 0) {
      const newVotes = { ...votes };
      newVotes[id]--;
      if (newVotes[id] === 0) delete newVotes[id];
      setVotes(newVotes);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total === 0) {
      setMsg("Cast at least one vote");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Votes submitted!");
        setContestants(data.contestants ?? []);
        setVotes({});
      } else {
        setMsg(data.message ?? "Error");
      }
    } catch {
      setMsg("Error submitting");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-semibold">Dot Voting</h1>
        <p className="mb-8 text-gray-600">You have {MAX_TOTAL} votes. Max {MAX_PER} per person.</p>
        <form onSubmit={submit} className="space-y-6 rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Vote</h2>
            <span className="text-sm text-gray-600">Remaining: <span className="font-bold">{remaining}</span></span>
          </div>
          {contestants.length === 0 ? (
            <p className="text-gray-500">No contestants yet.</p>
          ) : (
            <div className="space-y-3">
              {contestants.map(c => {
                const count = votes[c.id] ?? 0;
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-gray-600">Total votes: {c.votes}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => decrement(c.id)} className="rounded-full border border-gray-300 w-8 h-8 hover:bg-gray-200">−</button>
                      <span className="w-6 text-center font-bold">{count}</span>
                      <button type="button" onClick={() => increment(c.id)} className="rounded-full border border-gray-300 w-8 h-8 hover:bg-gray-200">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {msg && <p className={msg === "Votes submitted!" ? "text-green-600" : "text-red-600"}>{msg}</p>}
          <button
            type="submit"
            disabled={submitting || contestants.length === 0}
            className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Votes"}
          </button>
        </form>
      </div>
    </div>
  );
}
