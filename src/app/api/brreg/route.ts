import { NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/brreg';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = Number(searchParams.get('limit')) || 15;

    const companies = await searchCompanies(query, category, limit);

    return NextResponse.json({
      success: true,
      data: companies,
      count: companies.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente bedriftsdata' },
      { status: 500 }
    );
  }
}
