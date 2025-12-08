// api/_state.js
import crypto from "crypto";
import { list, put } from "@vercel/blob";

export const STATE_PATH = "poll/state.json";

function normalizeState(raw) {
  return {
    contestants: Array.isArray(raw?.contestants)
      ? raw.contestants
      : [
          { id: "a", name: "Team Aurora", subtitle: "Concept A" },
          { id: "b", name: "Project Nova", subtitle: "Concept B" },
          { id: "c", name: "Studio Echo", subtitle: "Concept C" }
        ],
    totals: raw?.totals || {},
    voters: raw?.voters || {}
  };
}

export async function loadState() {
  const { blobs } = await list({
    prefix: STATE_PATH,
    limit: 1
  });

  if (!blobs.length) {
    return normalizeState({});
  }

  const blob = blobs[0];

  // 🚀 IMPORTANT: bypass CDN cache so updates show instantly
  const res = await fetch(blob.url + "?v=" + Date.now());

  if (!res.ok) {
    throw new Error(`Failed to fetch state blob: ${res.status} ${res.statusText}`);
  }

  const json = await res.json().catch(() => ({}));
  return normalizeState(json);
}



export async function saveState(state) {
  // Minimal, safe options: no extra token, no cacheControlMaxAge
  await put(
    STATE_PATH,
    JSON.stringify(state),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json"
    }
  );
}

export function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || "change-this-salt";
  return crypto.createHash("sha256").update(ip + salt).digest("hex");
}
