import { NextResponse } from 'next/server';
import { getAgencyDashboardData } from '@/lib/agency/dashboard';

export async function GET(request: Request) {
  try {
    const data = await getAgencyDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Agency not found') {
        return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}