// api/admin-contestants.js
export const config = {
  runtime: "nodejs"
};

import { loadState, saveState } from "./_state.js";

export default async function handler(req, res) {
  try {
    const state = await loadState();
    if (!Array.isArray(state.contestants)) state.contestants = [];
    if (!state.totals || typeof state.totals !== "object") state.totals = {};

    if (req.method === "POST") {
      const body = req.body || {};
      const name = (body.name || "").trim();
      const subtitle = (body.subtitle || "").trim();

      if (!name) {
        res.status(400).json({ ok: false, error: "Name is required." });
        return;
      }

      const id = "c_" + Date.now().toString(36) + "_" + state.contestants.length;
      state.contestants.push({ id, name, subtitle });
      state.totals[id] = 0;

      await saveState(state);
      res.status(200).json({
        ok: true,
        contestants: state.contestants,
        totals: state.totals
      });
      return;
    }

    if (req.method === "DELETE") {
      const body = req.body || {};
      const id = body.id;
      if (!id) {
        res.status(400).json({ ok: false, error: "id is required." });
        return;
      }

      state.contestants = state.contestants.filter((c) => c.id !== id);
      if (state.totals[id] != null) {
        delete state.totals[id];
      }

      await saveState(state);
      res.status(200).json({
        ok: true,
        contestants: state.contestants,
        totals: state.totals
      });
      return;
    }

    res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("api/admin-contestants error:", err);
    res.status(500).json({
      ok: false,
      error: "Internal error while managing contestants.",
      detail: String(err?.message || err)
    });
  }
}
