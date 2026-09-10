import { NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAllSettings(true);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente systeminnstillinger' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, value, description, isSecret } = await request.json();

    if (!key || typeof value !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Både nøkkel og verdi er påkrevd' },
        { status: 400 }
      );
    }

    await setSetting(key, value, description, Boolean(isSecret));

    return NextResponse.json({
      success: true,
      message: `Innstilling '${key}' ble lagret.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Feil ved lagring av innstilling' },
      { status: 500 }
    );
  }
}
