// api/vote.js
import { loadState, saveState, getClientIp, hashIp } from "./_state.js";

const MAX_TOTAL = 5;
const MAX_PER = 3;

// Helper to read JSON body safely
async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        const json = JSON.parse(data);
        resolve(json || {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const ip = getClientIp(req);
    const ipHash = hashIp(ip);

    // Parse JSON body (allocations)
    let body = {};
    try {
      body = await readJson(req);
    } catch (err) {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }

    const allocations = body.allocations || {}; // { contestantId: votes }

    const votesArray = Object.entries(allocations).map(([id, v]) => ({
      id,
      votes: Number(v) || 0,
    }));

    if (!votesArray.length) {
      res.status(400).json({ error: "No votes submitted." });
      return;
    }

    const totalVotes = votesArray.reduce((sum, x) => sum + x.votes, 0);
    if (totalVotes <= 0 || totalVotes > MAX_TOTAL) {
      res.status(400).json({ error: "You must use 1–5 votes." });
      return;
    }

    for (const { id, votes } of votesArray) {
      if (votes < 0 || votes > MAX_PER) {
        res.status(400).json({ error: "Max 3 votes per contestant." });
        return;
      }
    }

    const state = await loadState();

    // One-vote-per-IP check
    if (state.voters && state.voters[ipHash]) {
      res
        .status(403)
        .json({ error: "You have already voted from this device/IP." });
      return;
    }

    const validIds = new Set(state.contestants.map((c) => c.id));
    for (const { id } of votesArray) {
      if (!validIds.has(id)) {
        res.status(400).json({ error: "Unknown contestant: " + id });
        return;
      }
    }

    if (!state.totals) state.totals = {};
    for (const { id, votes } of votesArray) {
      if (!votes) continue;
      state.totals[id] = (state.totals[id] || 0) + votes;
    }

    if (!state.voters) state.voters = {};
    state.voters[ipHash] = true;

    await saveState(state);

    res.status(200).json({
      ok: true,
      totals: state.totals,
    });
  } catch (err) {
    console.error("api/vote error:", err);
    res.status(500).json({ error: "Internal error while submitting votes." });
  }
}
