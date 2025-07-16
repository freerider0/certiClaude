import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { userId, inviteCode } = body;

    // Validate required fields
    if (!userId || !inviteCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find agency by invite code
    // Note: In a real implementation, you'd have an invites table
    // For now, we'll use a simple approach where the invite code is the agency ID prefix
    const { data: agencies, error: searchError } = await supabase
      .from('agencies')
      .select('id, name')
      .limit(100);

    if (searchError) {
      throw searchError;
    }

    // Simple invite code validation (in production, use a proper invite system)
    const agency = agencies?.find(a => 
      a.id.substring(0, 6).toUpperCase() === inviteCode.toUpperCase()
    );

    if (!agency) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('agency_users')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this agency' },
        { status: 400 }
      );
    }

    // Create agency_users relationship (staff role by default)
    const { error: agencyUserError } = await supabase
      .from('agency_users')
      .insert({
        agency_id: agency.id,
        user_id: userId,
        role: 'staff',
      });

    if (agencyUserError) {
      throw agencyUserError;
    }

    // No need to update profiles table as it no longer exists
    // Agency association is handled by agency_users table

    return NextResponse.json({
      success: true,
      agencyName: agency.name,
      agencyId: agency.id,
    });

  } catch (error) {
    console.error('Error joining agency:', error);
    return NextResponse.json(
      { error: 'Failed to join agency' },
      { status: 500 }
    );
  }
}