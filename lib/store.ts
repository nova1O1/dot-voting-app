// In-memory data store
export type Contestant = {
  id: string;
  name: string;
};

export type Vote = {
  id: string;
  contestantId: string;
  votes: number;
};

let contestants: Contestant[] = [];
let votes: Vote[] = [];
let idCounter = 0;

export function addContestant(name: string): Contestant {
  const id = String(idCounter++);
  const contestant = { id, name };
  contestants.push(contestant);
  return contestant;
}

export function removeContestant(id: string) {
  contestants = contestants.filter(c => c.id !== id);
}

export function getContestants() {
  return [...contestants];
}

export function getVoteTotals() {
  const totals: Record<string, number> = {};
  contestants.forEach(c => {
    totals[c.id] = 0;
  });
  votes.forEach(v => {
    if (totals[v.contestantId] !== undefined) {
      totals[v.contestantId] += v.votes;
    }
  });
  return totals;
}

export function submitVotes(voteData: Record<string, number>) {
  const MAX_TOTAL = 5;
  const MAX_PER = 3;
  
  let total = 0;
  for (const [id, count] of Object.entries(voteData)) {
    if (count < 0 || count > MAX_PER) {
      throw new Error(`Invalid vote count for contestant ${id}`);
    }
    total += count;
  }
  
  if (total > MAX_TOTAL) {
    throw new Error(`Total votes exceeds ${MAX_TOTAL}`);
  }
  
  for (const [id, count] of Object.entries(voteData)) {
    if (count > 0) {
      votes.push({
        id: String(idCounter++),
        contestantId: id,
        votes: count
      });
    }
  }
  
  return getVoteTotals();
}
