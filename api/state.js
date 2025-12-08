// api/state.js
export const config = {
  runtime: "nodejs"
};

import { loadState } from "./_state.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const state = await loadState();

    // 🔥 absolutely disable caching of the API response itself
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(200).json(state);
  } catch (err) {
    console.error("api/state error:", err);
    res.status(500).json({
      error: "Failed to load state.",
      detail: String(err?.message || err)
    });
  }
}
