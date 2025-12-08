// api/vote.js
export const config = {
  runtime: "nodejs"
};

import { loadState, saveState, getClientIp, hashIp } from "./_state.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const votes = body.votes || {};

    const state = await loadState();
    const ip = getClientIp(req);
    const ipHash = hashIp(ip);

    if (state.voters[ipHash]) {
      res.status(403).json({ ok: false, error: "You have already voted." });
      return;
    }

    let total = 0;
    for (const [id, count] of Object.entries(votes)) {
      const n = Number(count) || 0;
      if (n < 0) {
        res.status(400).json({ ok: false, error: "Invalid vote counts." });
        return;
      }
      if (n > 0) {
        const exists = state.contestants.some((c) => c.id === id);
        if (!exists) {
          res.status(400).json({ ok: false, error: "Invalid contestant id." });
          return;
        }
      }
      if (n > 3) {
        res
          .status(400)
          .json({ ok: false, error: "Max 3 votes per contestant." });
        return;
      }
      total += n;
    }

    if (total === 0) {
      res.status(400).json({ ok: false, error: "No votes submitted." });
      return;
    }
    if (total > 5) {
      res
        .status(400)
        .json({ ok: false, error: "You can only use 5 votes total." });
      return;
    }

    for (const [id, count] of Object.entries(votes)) {
      const n = Number(count) || 0;
      if (!n) continue;
      if (state.totals[id] == null) state.totals[id] = 0;
      state.totals[id] += n;
    }

    state.voters[ipHash] = new Date().toISOString();

    await saveState(state);

    res.status(200).json({
      ok: true,
      totals: state.totals
    });
  } catch (err) {
    console.error("api/vote error:", err);
    res.status(500).json({
      ok: false,
      error: "Internal error while submitting votes.",
      detail: String(err?.message || err)
    });
  }
}
