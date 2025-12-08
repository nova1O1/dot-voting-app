// api/admin-reset.js
export const config = {
  runtime: "nodejs"
};

import { loadState, saveState } from "./_state.js";

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = {};
  try {
    body = await readJson(req);
  } catch (err) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { action } = body;

  try {
    const state = await loadState();

    if (action === "flushIps") {
      state.voters = {};
      await saveState(state);
      res.status(200).json({
        ok: true,
        message: "All voter IPs cleared."
      });
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

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("admin-reset error:", err);
    res.status(500).json({
      error: "Internal server error while resetting.",
      detail: String(err?.message || err)
    });
  }
}
