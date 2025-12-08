// api/admin-contestants.js
import { loadState, saveState } from "./_state.js";

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
  try {
    const state = await loadState();
    if (!state.contestants) state.contestants = [];
    if (!state.totals) state.totals = {};

    if (req.method === "POST") {
      // Add contestant
      let body = {};
      try {
        body = await readJson(req);
      } catch (err) {
        res.status(400).json({ error: "Invalid JSON body" });
        return;
      }

      const { name, subtitle } = body || {};
      if (!name || typeof name !== "string") {
        res.status(400).json({ error: "Name is required" });
        return;
      }

      const id =
        "c_" + Date.now().toString(36) + "_" + state.contestants.length;
      state.contestants.push({ id, name, subtitle: subtitle || "" });
      state.totals[id] = 0;

      await saveState(state);
      res.status(200).json({
        ok: true,
        contestants: state.contestants,
        totals: state.totals,
      });
      return;
    }

    if (req.method === "DELETE") {
      // Remove contestant
      let body = {};
      try {
        body = await readJson(req);
      } catch (err) {
        res.status(400).json({ error: "Invalid JSON body" });
        return;
      }

      const { id } = body || {};
      if (!id) {
        res.status(400).json({ error: "id is required" });
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
        totals: state.totals,
      });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("api/admin-contestants error:", err);
    res
      .status(500)
      .json({ error: "Internal error while managing contestants." });
  }
}
