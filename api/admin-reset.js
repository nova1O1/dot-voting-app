// api/admin-reset.js
export const config = {
  runtime: "nodejs"
};

import { loadState, saveState } from "./_state.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const action = body.action;

  try {
    const state = await loadState();

    if (action === "flushIps") {
      state.voters = {};
      await saveState(state);
      res.status(200).json({ ok: true, message: "All voter IPs cleared." });
      return;
    }

    if (action === "flushAll") {
      state.contestants = [];
      state.totals = {};
      state.voters = {};
      await saveState(state);
      res.status(200).json({
        ok: true,
        message: "All contestants & votes cleared.",
        contestants: state.contestants,
        totals: state.totals
      });
      return;
    }

    res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (err) {
    console.error("admin-reset error:", err);
    res.status(500).json({
      ok: false,
      error: "Internal server error while resetting.",
      detail: String(err?.message || err)
    });
  }
}
