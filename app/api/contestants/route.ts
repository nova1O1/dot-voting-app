import { NextRequest, NextResponse } from 'next/server';
import { getContestants, addContestant, removeContestant } from '@/lib/store';

export async function GET() {
  try {
    const contestants = getContestants();
    return NextResponse.json({ contestants });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const contestant = addContestant(name.trim());
    return NextResponse.json({ contestant, contestants: getContestants() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add contestant' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    removeContestant(id);
    return NextResponse.json({ contestants: getContestants() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove contestant' }, { status: 500 });
  }
}
