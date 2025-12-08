export const config = {
  runtime: "nodejs"
};

import { loadState } from "./_state.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const state = await loadState();
  res.status(200).json({
    contestants: state.contestants,
    totals: state.totals
  });
}
