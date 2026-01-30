import { getAccountsSummary } from '@/ai/assist_flow/summarize-accounts';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation — the server-side genkit will validate again through zod
    if (!body) return NextResponse.json({ error: 'Missing body' }, { status: 400 });

    const result = await getAccountsSummary(body);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error('get-accounts-summary error:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
