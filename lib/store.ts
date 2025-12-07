// lib/store.ts

export type Contestant = {
  id: string;
  name: string;
  votes: number;
};

// Simple in-memory store.
// NOTE: On serverless platforms this resets on cold starts.
let contestants: Contestant[] = [
  { id: "1", name: "Contestant A", votes: 0 },
  { id: "2", name: "Contestant B", votes: 0 },
  { id: "3", name: "Contestant C", votes: 0 }
];

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function getContestants(): Contestant[] {
  // return a copy to avoid accidental mutation
  return contestants.map(c => ({ ...c }));
}

export function addContestant(name: string): Contestant {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }
  const contestant: Contestant = {
    id: generateId(),
    name: trimmed,
    votes: 0
  };
  contestants.push(contestant);
  return contestant;
}

/**
 * Apply votes to contestants.
 * `voteMap` is { [contestantId]: numberOfVotes }
 */
export function addVotes(
  voteMap: Record<string, number>
): Contestant[] {
  // basic validation that ids exist
  for (const id of Object.keys(voteMap)) {
    if (!contestants.some(c => c.id === id)) {
      throw new Error(`Invalid contestant id: ${id}`);
    }
  }
  contestants = contestants.map(c => {
    const additional = voteMap[c.id] ?? 0;
    if (additional > 0) {
      return { ...c, votes: c.votes + additional };
    }
    return c;
  });
  return getContestants();
}
