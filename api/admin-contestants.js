import { loadState, saveState } from "./_state.js";

export default async function handler(req, res) {
  const state = await loadState();
  if (!state.contestants) state.contestants = [];
  if (!state.totals) state.totals = {};

  if (req.method === "POST") {
    const { name, subtitle } = req.body || {};
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const id = "c_" + Date.now().toString(36) + "_" + state.contestants.length;
    state.contestants.push({ id, name, subtitle: subtitle || "" });
    state.totals[id] = 0;

    await saveState(state);
    res.status(200).json({ ok: true, contestants: state.contestants, totals: state.totals });
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    state.contestants = state.contestants.filter((c) => c.id !== id);
    if (state.totals[id] != null) {
      delete state.totals[id];
    }

    await saveState(state);
    res.status(200).json({ ok: true, contestants: state.contestants, totals: state.totals });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
