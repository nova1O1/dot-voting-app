import crypto from "crypto";
import { Redis } from "@upstash/redis";

export const STATE_KEY = "dot-poll:state";

// Use the env vars that Vercel actually created for you
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

const DEFAULT_CONTESTANTS = [
  { id: "a", name: "Team Aurora", subtitle: "Concept A" },
  { id: "b", name: "Project Nova", subtitle: "Concept B" },
  { id: "c", name: "Studio Echo", subtitle: "Concept C" },
];

function normalizeState(raw) {
  const contestants =
  Array.isArray(raw?.contestants) && raw.contestants.length > 0
    ? raw.contestants
    : DEFAULT_CONTESTANTS;


  const totals =
    raw?.totals && typeof raw.totals === "object" ? raw.totals : {};
  const voters =
    raw?.voters && typeof raw.voters === "object" ? raw.voters : {};

  contestants.forEach((c) => {
    if (totals[c.id] == null) totals[c.id] = 0;
  });

  return { contestants, totals, voters };
}

export async function loadState() {
  const raw = await redis.get(STATE_KEY);
  if (!raw) {
    const initial = normalizeState({});
    await redis.set(STATE_KEY, initial);
    return initial;
  }
  return normalizeState(raw);
}

export async function saveState(state) {
  await redis.set(STATE_KEY, state);
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
