export type Contestant = {
  id: string;
  name: string;
  votes: number;
};

let contestants: Contestant[] = [
  { id: "1", name: "Contestant A", votes: 0 },
  { id: "2", name: "Contestant B", votes: 0 },
  { id: "3", name: "Contestant C", votes: 0 },
];

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function getContestants() {
  return contestants.map(c => ({ ...c }));
}

export function addContestant(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name required");

  const c: Contestant = {
    id: generateId(),
    name: trimmed,
    votes: 0
  };

  contestants.push(c);
  return c;
}

export function addVotes(voteMap: Record<string, number>) {
  contestants = contestants.map(c => ({
    ...c,
    votes: c.votes + (voteMap[c.id] ?? 0)
  }));

  return getContestants();
}
