import crypto from "crypto";
import { list, put } from "@vercel/blob";

export const STATE_PATH = "poll/state.json";

export async function loadState() {
  const { blobs } = await list({ prefix: STATE_PATH, limit: 1 });

  if (!blobs.length) {
    return {
      contestants: [
        { id: "a", name: "Team Aurora", subtitle: "Concept A" },
        { id: "b", name: "Project Nova", subtitle: "Concept B" },
        { id: "c", name: "Studio Echo", subtitle: "Concept C" }
      ],
      totals: {},
      voters: {}
    };
  }

  const blob = blobs[0];
  const res = await fetch(blob.url);
  const json = await res.json();
  return {
    contestants: Array.isArray(json.contestants) ? json.contestants : [],
    totals: json.totals || {},
    voters: json.voters || {}
  };
}

export async function saveState(state) {
  await put(
    STATE_PATH,
    JSON.stringify(state),
    {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0
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
