// app/api/contestants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addContestant, getContestants } from "@/lib/store";

export async function GET() {
  const contestants = getContestants();
  return NextResponse.json({ contestants });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }
    addContestant(name);
    const contestants = getContestants();
    return NextResponse.json({ contestants });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Failed to add contestant" },
      { status: 400 }
    );
  }
}
