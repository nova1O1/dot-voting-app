import { NextRequest, NextResponse } from 'next/server';
import { submitVotes, getVoteTotals } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { votes } = await req.json();
    if (!votes || typeof votes !== 'object') {
      return NextResponse.json({ error: 'Invalid votes data' }, { status: 400 });
    }
    const totals = submitVotes(votes);
    return NextResponse.json({ success: true, totals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit votes' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const totals = getVoteTotals();
    return NextResponse.json({ totals });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vote totals' }, { status: 500 });
  }
}
