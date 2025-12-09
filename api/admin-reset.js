// api/admin-reset.js
export const config = {
  runtime: "nodejs",
};

import { loadState, saveState } from "./_state.js";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function ensureAdmin(req, res) {
  if (!ADMIN_TOKEN) return true;
  const header = req.headers["x-admin-token"];
  if (typeof header === "string" && header === ADMIN_TOKEN) {
    return true;
  }
  res.status(401).json({ ok: false, error: "Unauthorized (invalid admin token)" });
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    if (!ensureAdmin(req, res)) return;

    const body = req.body || {};
    const action = body.action;

    const state = await loadState();

    if (action === "flushIps") {
      // keep contestants & totals, nuke voters
      state.voters = {};
      await saveState(state);
      res.status(200).json({ ok: true, message: "Voter IPs cleared" });
      return;
    }

    if (action === "flushAll") {
      // drop everything
      const empty = { contestants: [], totals: {}, voters: {} };
      await saveState(empty);
      res.status(200).json({ ok: true, message: "All contestants & votes cleared" });
      return;
    }

    res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (err) {
    console.error("api/admin-reset error:", err);
    res.status(500).json({
      ok: false,
      error: "Internal error during reset.",
      detail: String(err?.message || err),
    });
  }
}
