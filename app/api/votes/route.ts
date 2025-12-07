// app/api/votes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { addVotes } from "@/lib/store";

const MAX_TOTAL_VOTES = 5;
const MAX_PER_CONTESTANT = 3;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const votes = body?.votes;
    if (!votes || typeof votes !== "object") {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }
    const counts: Record<string, number> = {};
    for (const [id, value] of Object.entries(votes)) {
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0) {
        return NextResponse.json(
          { message: "Invalid vote value" },
          { status: 400 }
        );
      }
      if (num > 0) {
        counts[id] = num;
      }
    }
    const totalVotes = Object.values(counts).reduce((sum, v) => sum + v, 0);
    if (totalVotes === 0) {
      return NextResponse.json(
        { message: "You must cast at least one vote" },
        { status: 400 }
      );
    }
    if (totalVotes > MAX_TOTAL_VOTES) {
      return NextResponse.json(
        { message: `You can cast at most ${MAX_TOTAL_VOTES} votes` },
        { status: 400 }
      );
    }
    for (const v of Object.values(counts)) {
      if (v > MAX_PER_CONTESTANT) {
        return NextResponse.json(
          { message: `Max ${MAX_PER_CONTESTANT} votes per contestant` },
          { status: 400 }
        );
      }
    }
    const contestants = addVotes(counts);
    return NextResponse.json({ contestants, message: "Votes submitted" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Failed to submit votes" },
      { status: 400 }
    );
  }
}
