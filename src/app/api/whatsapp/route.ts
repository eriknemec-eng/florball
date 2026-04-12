import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const link = db.settings?.whatsappLink?.trim();

    if (!link) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.redirect(link);
  } catch (err) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}
