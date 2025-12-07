// app/api/votes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { submitVotes } from "@/lib/store";

const MAX_TOTAL_VOTES = 5;
const MAX_PER_CONTESTANT = 3;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const votes = body?.votes; // { [contestantId]: voteCount }

    if (!votes || typeof votes !== "object") {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    let totalVotes = 0;
    for (const [id, count] of Object.entries(votes)) {
      const num = Number(count);
      if (!Number.isFinite(num) || num < 0) {
        return NextResponse.json(
          { message: "Invalid vote value" },
          { status: 400 }
        );
      }
      if (num > MAX_PER_CONTESTANT) {
        return NextResponse.json(
          { message: `You can cast at most ${MAX_PER_CONTESTANT} votes` },
          { status: 400 }
        );
      }
      totalVotes += num;
    }

    if (totalVotes > MAX_TOTAL_VOTES) {
      return NextResponse.json(
        { message: `Total votes cannot exceed ${MAX_TOTAL_VOTES}` },
        { status: 400 }
      );
    }

    submitVotes(votes);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Failed to submit votes" },
      { status: 400 }
    );
  }
}
