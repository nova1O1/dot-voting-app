"use client";

import { useState, useEffect } from "react";

interface Contestant {
  id: string;
  name: string;
  votes: number;
}

const MAX_TOTAL_VOTES = 5;
const MAX_PER_CONTESTANT = 3;

export default function VotePage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [votes, setVotes] = useState<{ [id: string]: number }>({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContestants = async () => {
      try {
        const res = await fetch("/api/contestants");
        const data = await res.json();
        setContestants(data.contestants || []);
      } catch (error) {
        console.error("Failed to fetch contestants", error);
      }
    };
    fetchContestants();
  }, []);

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleVoteChange = (id: string, delta: number) => {
    const newVotes = { ...votes, [id]: Math.max(0, (votes[id] || 0) + delta) };
    const total = Object.values(newVotes).reduce((a, b) => a + b, 0);
    if (total <= MAX_TOTAL_VOTES && (newVotes[id] || 0) <= MAX_PER_CONTESTANT) {
      setVotes(newVotes);
    }
  };

  const handleSubmit = async () => {
    if (totalVotes === 0) {
      setMessage("Please cast at least one vote");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Vote submitted successfully!");
        setVotes({});
      } else {
        setMessage(data.message || "Failed to submit votes");
      }
    } catch (error) {
      setMessage("Error submitting votes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-2">Vote</h1>
        <p className="text-center text-gray-600 mb-8">
          You have {MAX_TOTAL_VOTES - totalVotes} votes remaining
        </p>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            {message}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {contestants.length === 0 ? (
            <p className="text-gray-500 text-center">No contestants yet</p>
          ) : (
            contestants.map((contestant) => (
              <div
                key={contestant.id}
                className="border border-gray-300 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{contestant.name}</p>
                  <p className="text-sm text-gray-500">Current votes: {contestant.votes}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVoteChange(contestant.id, -1)}
                    disabled={!votes[contestant.id] || votes[contestant.id] === 0}
                    className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {votes[contestant.id] || 0}
                  </span>
                  <button
                    onClick={() => handleVoteChange(contestant.id, 1)}
                    disabled={
                      totalVotes >= MAX_TOTAL_VOTES ||
                      (votes[contestant.id] || 0) >= MAX_PER_CONTESTANT
                    }
                    className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={totalVotes === 0 || isLoading}
          className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "Submitting..." : "Submit Votes"}
        </button>
      </div>
    </div>
  );
}
