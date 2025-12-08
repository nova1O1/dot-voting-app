// api/_state.js
import crypto from "crypto";
import { list, put } from "@vercel/blob";

export const STATE_PATH = "poll/state.json";

// Helper to ensure we always have a usable state shape
function normalizeState(raw) {
  return {
    contestants: Array.isArray(raw?.contestants) ? raw.contestants : [
      { id: "a", name: "Team Aurora", subtitle: "Concept A" },
      { id: "b", name: "Project Nova", subtitle: "Concept B" },
      { id: "c", name: "Studio Echo", subtitle: "Concept C" }
    ],
    totals: raw?.totals || {},
    voters: raw?.voters || {}
  };
}

export async function loadState() {
  // Explicitly pass the token just to be extra-safe
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Check your Vercel env variables."
    );
  }

  const { blobs } = await list({
    prefix: STATE_PATH,
    limit: 1,
    token
  });

  if (!blobs.length) {
    // No state yet: return default
    return normalizeState({});
  }

  const blob = blobs[0];

  const res = await fetch(blob.url);
  if (!res.ok) {
    throw new Error(`Failed to fetch state blob: ${res.status} ${res.statusText}`);
  }

  const json = await res.json().catch(() => ({}));
  return normalizeState(json);
}

export async function saveState(state) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Check your Vercel env variables."
    );
  }

  // IMPORTANT: do NOT pass cacheControlMaxAge: 0
  // It must be >= 60 seconds or omitted.
  await put(
    STATE_PATH,
    JSON.stringify(state),
    {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      token
      // cacheControlMaxAge: 60 // optional, but not needed here
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
